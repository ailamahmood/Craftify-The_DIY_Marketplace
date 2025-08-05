// app/ChatTest.js
import React from "react";
import { View, Text, Button } from "react-native";
import useSocket from "../../hooks/useSocket";

const ChatTest = () => {
  const socketRef = useSocket();

  const sendTestMessage = () => {
    const socket = socketRef.current;
    if (socket) {
      socket.emit("joinChat", { chatId: "demo-chat" });
      socket.emit("sendMessage", {
        chatId: "demo-chat",
        messageText: "Hello world!",
      });
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>🧪 Testing Socket.IO Connection</Text>
      <Button title="Send Test Message" onPress={sendTestMessage} />
    </View>
  );
};

export default ChatTest;
