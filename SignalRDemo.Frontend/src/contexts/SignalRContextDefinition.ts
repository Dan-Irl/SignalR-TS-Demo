import { createContext } from "react";
import type { HubConnection } from "@microsoft/signalr";
import type { HubConnectionState } from "@microsoft/signalr";
import type { IChatHub } from "../generated_hub/TypedSignalR.Client/SignalRDemo.API.Chat";

// Define the ChatHub context value type
export interface ChatHubContextValue {
  connection: HubConnection | null;
  hub: IChatHub | null;
  connectionState: HubConnectionState;
  isConnected: boolean;
  error: Error | null;
}

// Create the ChatHub Context
export const ChatHubContext = createContext<ChatHubContextValue | null>(null);
