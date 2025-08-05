import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Keyboard,
    ActivityIndicator,
    Image,
    TouchableOpacity
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useSocket from '../../hooks/useSocket';
import * as ImagePicker from 'expo-image-picker';
import ImageViewing from "react-native-image-viewing";
import { Ionicons } from '@expo/vector-icons';
import { CHAT_API } from '../../config/apiConfig';

const ChatScreen = () => {
    const { chatId, userId: otherUserId, name } = useLocalSearchParams();
    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [isViewerVisible, setIsViewerVisible] = useState(false);
    const [viewerImages, setViewerImages] = useState([]);
    const [initialIndex, setInitialIndex] = useState(0);
    const typingTimeoutRef = useRef(null);
    const flatListRef = useRef(null);
    const socket = useSocket();

    // Load user from AsyncStorage
    useEffect(() => {
        const loadUser = async () => {
            const stored = await AsyncStorage.getItem('user');
            if (stored) setCurrentUser(JSON.parse(stored));
        };
        loadUser();
    }, []);

    // Load chat messages
    useEffect(() => {
        if (!chatId) return;

        const loadMessages = async () => {
            try {
                const res = await axios.get(`${CHAT_API}/messages/${chatId}`);
                // Reverse to show latest at bottom (for inverted FlatList)
                setMessages(res.data.reverse());
            } catch (err) {
                console.error('Failed to load messages', err);
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, [chatId]);

    // Scroll to bottom whenever new messages arrive
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => scrollToBottom(), 100);
        }
    }, [messages]);

    // Set up socket listeners
    useEffect(() => {
        if (!socket || !currentUser) return;

        socket.on('receiveMessage', (msg) => {
            if (msg.chat_id === chatId) {
                setMessages((prev) => [msg, ...prev]); // Add to top because of inverted list
            }
        });

        socket.on('typing', ({ chat_id, sender_id }) => {
            if (chat_id === chatId && sender_id === otherUserId) {
                setIsTyping(true);
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
            }
        });

        socket.on('messageRead', ({ chat_id, reader_id }) => {
            if (chat_id === chatId) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.receiver_id === reader_id ? { ...msg, is_read: true } : msg
                    )
                );
            }
        });

        socket.emit('mark_read', {
            chat_id: chatId,
            reader_id: currentUser.id,
        });

        socket.emit('messageRead', {
            chat_id: chatId,
            reader_id: currentUser.id,
        });

        return () => {
            socket.off('receiveMessage');
            socket.off('typing');
            socket.off('messageRead');
        };
    }, [socket, chatId, currentUser, otherUserId]);

    // Scroll to bottom (for inverted list, offset 0 is bottom)
    const scrollToBottom = () => {
        if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
    };

    // Send a text message
    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const payload = {
            chat_id: chatId,
            sender_id: currentUser.id,
            receiver_id: otherUserId,
            content: newMessage.trim(),
            message_type: 'text',
        };

        try {
            const { data } = await axios.post(`${CHAT_API}/messages`, payload);
            setMessages((prev) => [data, ...prev]); // For inverted list
            socket?.emit('sendMessage', data);
            setNewMessage('');
            Keyboard.dismiss();
            scrollToBottom();
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    // Send an image message
    const sendImageMessage = async (imageUrl) => {
        if (!currentUser || !chatId || !otherUserId) return;

        const payload = {
            chat_id: chatId,
            sender_id: currentUser.id,
            receiver_id: otherUserId,
            content: imageUrl,
            message_type: 'image',
        };

        try {
            const { data } = await axios.post(`${CHAT_API}/messages`, payload);
            setMessages((prev) => [data, ...prev]);
            socket?.emit('sendMessage', data);
            scrollToBottom();
        } catch (err) {
            console.error('Failed to send image message', err);
        }
    };

    // Pick image from gallery and upload
    const pickImageAndSend = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                alert('Permission to access gallery is required!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
            });

            if (!result.canceled) {
                const imageUrl = await uploadToCloudinary(result.assets[0].uri);
                await sendImageMessage(imageUrl);
            }
        } catch (error) {
            console.error('Image picking/upload error:', error);
        }
    };

    // Upload image to Cloudinary under 'chats' folder
    const uploadToCloudinary = async (uri) => {
        const formData = new FormData();
        formData.append('file', {
            uri,
            type: 'image/jpeg',
            name: 'chat-image.jpg',
        });
        formData.append('upload_preset', 'craftify_unsigned');
        formData.append('folder', 'chats');

        const response = await fetch(
            'https://api.cloudinary.com/v1_1/dmeicwx5d/image/upload',
            {
                method: 'POST',
                body: formData,
            }
        );

        const data = await response.json();
        return data.secure_url;
    };

    // Typing event
    const handleTyping = () => {
        socket?.emit('typing', {
            fromUserId: currentUser.id,
            toUserId: otherUserId,
            chatId,
        });
    };

    // Render each message
    const renderItem = ({ item }) => {
        const isMe = item.sender_id === currentUser.id;

        return (
            <View className={`px-4 py-2 my-1 ${isMe ? 'items-end' : 'items-start'}`}>
                <View
                    className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                        isMe ? 'bg-brown' : 'bg-gray-200'
                    }`}
                >
                    {item.message_type === 'image' ? (
                        <TouchableOpacity
                            onPress={() => {
                                setViewerImages([{ uri: item.content }]);
                                setInitialIndex(0);
                                setIsViewerVisible(true);
                            }}
                        >
                            <Image
                                source={{ uri: item.content }}
                                style={{ width: 200, height: 200, borderRadius: 10 }}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    ) : (
                        <Text
                            className={`text-base font-i28_regular ${
                                isMe ? 'text-white' : 'text-black'
                            }`}
                        >
                            {item.content}
                        </Text>
                    )}
                </View>
                <Text className="text-xs text-gray-400 font-i28_regular mt-1">
                    {new Date(item.created_at).toLocaleTimeString()}
                </Text>
                {isMe && item.is_read && (
                    <Text className="text-xs text-green-500 mt-1">Seen</Text>
                )}
            </View>
        );
    };

    if (loading) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#8B4513" />
          </View>
        );
      }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 bg-white"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <View className="flex-1 pt-10">
                <Text className="text-center mb-4 mt-2 text-2xl font-i28_semibold text-lightblack">
                    {name}
                </Text>

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.message_id}
                    className="px-2"
                    inverted // ✅ Keeps chat pinned to bottom
                />

                {isTyping && (
                    <Text className="text-center text-sm font-i28_regular text-gray-400 mb-1">
                        Typing...
                    </Text>
                )}

                <View className="flex-row items-center border-t border-gray-300 p-2 bg-white">
                    <Pressable onPress={pickImageAndSend} className="mr-2">
                        <Ionicons name="image-outline" size={28} color="#8B4513" />
                    </Pressable>
                    <TextInput
                        className="flex-1 font-i28_regular border border-gray-300 rounded-full px-4 py-3 text-base"
                        placeholder="Type a message"
                        value={newMessage}
                        onChangeText={(text) => {
                            setNewMessage(text);
                            handleTyping();
                        }}
                    />
                    <Pressable
                        onPress={sendMessage}
                        className="ml-2 bg-brown px-6 py-3 rounded-full"
                    >
                        <Text className="font-i28_semibold text-white font-semibold">Send</Text>
                    </Pressable>

                    <ImageViewing
                        images={viewerImages}
                        imageIndex={initialIndex}
                        visible={isViewerVisible}
                        onRequestClose={() => setIsViewerVisible(false)}
                    />
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ChatScreen;
