import React, { useEffect, useMemo, useState } from "react";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import { getHubProxyFactory } from "../generated_hub/TypedSignalR.Client";
import { ChatHubContext } from "./SignalRContextDefinition";
import type { ChatHubContextValue } from "./SignalRContextDefinition";
import type {
  IChatHub,
  IChatReceiver,
} from "../generated_hub/TypedSignalR.Client/SignalRDemo.API.Chat";
import type { Message } from "../generated_hub/SignalRDemo.API.Chat";

// Props for the ChatHub provider
interface ChatHubProviderProps {
  children: React.ReactNode;
  hubUrl: string;
  autoConnect?: boolean;
}

// ChatHub Provider Component
export const ChatHubProvider: React.FC<ChatHubProviderProps> = ({
  children,
  hubUrl,
  autoConnect = true,
}) => {
  const [connectionState, setConnectionState] = useState<HubConnectionState>(
    HubConnectionState.Disconnected,
  );
  const [error, setError] = useState<Error | null>(null);

  // Initialize connection and hub proxy using useMemo to avoid recreating on every render
  const connection = useMemo(() => {
    // Build the connection
    const newConnection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    // Set up connection state change handlers
    newConnection.onreconnecting((error?: Error) => {
      console.log("SignalR reconnecting...", error);
      setConnectionState(HubConnectionState.Reconnecting);
      setError(error ?? null);
    });

    newConnection.onreconnected((connectionId?: string) => {
      console.log("SignalR reconnected:", connectionId);
      setConnectionState(HubConnectionState.Connected);
      setError(null);
    });

    newConnection.onclose((error?: Error) => {
      console.log("SignalR connection closed", error);
      setConnectionState(HubConnectionState.Disconnected);
      setError(error ?? null);
    });

    return newConnection;
  }, [hubUrl]);

  // Create typed hub proxy using generated factory
  const hub = useMemo(() => {
    const hubProxyFactory = getHubProxyFactory("IChatHub");
    return hubProxyFactory.createHubProxy(connection);
  }, [connection]);

  // Cleanup connection on unmount
  useEffect(() => {
    return () => {
      if (connection.state !== HubConnectionState.Disconnected) {
        connection.stop();
      }
    };
  }, [connection]);

  // Start connection (without receiver - components will register their own)
  useEffect(() => {
    let isCleanedUp = false;

    const startConnection = async () => {
      try {
        // Start the connection only if not already started/starting and autoConnect is true
        if (
          autoConnect &&
          connection.state === HubConnectionState.Disconnected &&
          !isCleanedUp
        ) {
          setConnectionState(HubConnectionState.Connecting);
          await connection.start();
          if (!isCleanedUp) {
            setConnectionState(HubConnectionState.Connected);
            console.log("SignalR Connected.");
            setError(null);
          }
        }
      } catch (err) {
        if (!isCleanedUp) {
          console.error("SignalR Connection Error:", err);
          setError(err as Error);
          setConnectionState(HubConnectionState.Disconnected);
        }
      }
    };

    startConnection();

    // Cleanup
    return () => {
      isCleanedUp = true;
    };
  }, [connection, autoConnect]);

  const contextValue: ChatHubContextValue = {
    connection,
    hub,
    connectionState,
    isConnected: connectionState === HubConnectionState.Connected,
    error,
  };

  return (
    <ChatHubContext.Provider value={contextValue}>
      {children}
    </ChatHubContext.Provider>
  );
};

// Type exports for convenience
export type { ChatHubContextValue, IChatHub, IChatReceiver, Message };
export { ChatHubContext } from "./SignalRContextDefinition";
