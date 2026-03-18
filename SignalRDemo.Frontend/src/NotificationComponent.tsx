import { useState, useMemo } from "react";
import { useRegisterChatRecevier } from "./contexts";
import type { Message, IChatReceiver } from "./contexts";

export function NotificationComponent() {
  const [notifications, setNotifications] = useState<string[]>([]);

  // This component has its own receiver with different behavior
  const receiver: IChatReceiver = useMemo(
    () => ({
      onReceiveMessage: async (message: Message) => {
        // Show a notification instead of adding to chat
        const notification = `New message from ${message.username}`;
        setNotifications((prev) => [...prev, notification]);

        // Auto-remove notification after 5 seconds
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n !== notification));
        }, 5000);
      },
      onLeave: async (username: string) => {
        const notification = `${username} left the chat`;
        setNotifications((prev) => [...prev, notification]);

        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n !== notification));
        }, 3000);
      },
      onJoin: async (username: string) => {
        const notification = `${username} joined the chat`;
        setNotifications((prev) => [...prev, notification]);

        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n !== notification));
        }, 3000);
      },
    }),
    [],
  );

  // Register this component's receiver
  useRegisterChatRecevier(receiver);

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 1000,
      }}
    >
      {notifications.map((notification, idx) => (
        <div
          key={idx}
          style={{
            background: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            marginBottom: "10px",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          {notification}
        </div>
      ))}
    </div>
  );
}
