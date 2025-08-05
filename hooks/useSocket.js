// hooks/useSocket.js
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SOCKET_URL } from '../config/apiConfig';

export default function useSocket() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let socketInstance;

    const connectSocket = async () => {
      const userData = await AsyncStorage.getItem("user");
      const parsedUser = JSON.parse(userData);
      const token = parsedUser?.token;
      console.log("🔑 JWT Token:", token);

      if (!token) {
        console.log("❌ No token found in AsyncStorage");
        return;
      }

      socketInstance = io(`${SOCKET_URL}`, {
        auth: { token },
      });

      socketInstance.on("connect", () => {
        console.log("✅ Connected to socket:", socketInstance.id);
        setSocket(socketInstance);
      });

      socketInstance.on("connect_error", (err) => {
        console.log("❌ Socket connection error:", err.message);
      });

      socketInstance.on("receiveMessage", (data) => {
        console.log("📩 Received message:", data);
      });
    };

    connectSocket();

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        console.log("🔌 Socket disconnected");
      }
    };
  }, []);

  return socket;
}
