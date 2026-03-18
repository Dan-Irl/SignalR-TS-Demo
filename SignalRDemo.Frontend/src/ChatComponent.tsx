import { useState, useMemo } from "react";
import { useChatHub as useChatHub, useRegisterChatRecevier } from "./contexts";
import type { Message, IChatReceiver } from "./contexts";

export function ChatComponent() {
  const hub = useChatHub();
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);

  // Register this component's own receiver
  const receiver: IChatReceiver = useMemo(
    () => ({
      onReceiveMessage: async (message: Message) => {
        console.log("Message received:", message);
        setMessages((prev) => [...prev, message]);
      },
      onLeave: async (username: string, dateTime: Date | string) => {
        console.log(`${username} left at ${dateTime}`);
        setParticipants((prev) => prev.filter((p) => p !== username));
      },
      onJoin: async (username: string, dateTime: Date | string) => {
        console.log(`${username} joined at ${dateTime}`);
        setParticipants((prev) => [...prev, username]);
      },
    }),
    [],
  );

  // Register the receiver with SignalR
  useRegisterChatRecevier(receiver);

  const handleJoin = async () => {
    if (!username.trim()) return;
    try {
      await hub.join(username);
      setHasJoined(true);
      // Fetch current participants after joining
      const currentParticipants = await hub.getParticipants();
      setParticipants(currentParticipants);
    } catch (error) {
      console.error("Failed to join:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    try {
      await hub.sendMessage(message);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleLeave = async () => {
    try {
      await hub.leave();
      setHasJoined(false);
    } catch (error) {
      console.error("Failed to leave:", error);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>SignalR Chat Demo</h1>

      {/* Join Form */}
      {!hasJoined && (
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            style={{ padding: "10px", marginRight: "10px", width: "200px" }}
          />
          <button
            onClick={handleJoin}
            disabled={!username.trim()}
            style={{ padding: "10px 20px" }}
          >
            Join Chat
          </button>
        </div>
      )}

      {/* Chat Interface */}
      {hasJoined && (
        <>
          {/* Participants List */}
          <div style={{ marginBottom: "20px" }}>
            <h3>Participants ({participants.length})</h3>
            <ul>
              {participants.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </div>

          {/* Messages */}
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              minHeight: "300px",
              maxHeight: "400px",
              overflowY: "auto",
              marginBottom: "20px",
              borderRadius: "5px",
            }}
          >
            {messages.length === 0 ? (
              <p style={{ color: "#999" }}>No messages yet...</p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: "10px",
                    padding: "8px",
                    background: "#f9f9f9",
                    borderRadius: "3px",
                  }}
                >
                  <strong>{msg.username}</strong>: {msg.content}
                  <br />
                  <small style={{ color: "#666" }}>
                    {new Date(msg.timeStamp).toLocaleTimeString()}
                  </small>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              style={{ flex: 1, padding: "10px" }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              style={{ padding: "10px 20px" }}
            >
              Send
            </button>
          </div>

          <button
            onClick={handleLeave}
            style={{
              padding: "10px 20px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            Leave Chat
          </button>
        </>
      )}
    </div>
  );
}
