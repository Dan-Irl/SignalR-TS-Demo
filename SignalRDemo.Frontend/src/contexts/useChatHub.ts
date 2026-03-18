import { useContext, useEffect } from "react";
import { ChatHubContext } from "./SignalRContextDefinition";
import type { ChatHubContextValue } from "./SignalRContextDefinition";
import type {
  IChatHub,
  IChatReceiver,
} from "../generated_hub/TypedSignalR.Client/SignalRDemo.API.Chat";
import { getReceiverRegister } from "../generated_hub/TypedSignalR.Client";
import type { Disposable } from "../generated_hub/TypedSignalR.Client";

// Custom hook for accessing the ChatHub context
const useGetChatHubContext = (): ChatHubContextValue => {
  const context = useContext(ChatHubContext);
  if (!context) {
    throw new Error("useChatHub must be used within a ChatHubProvider");
  }
  return context;
};

// Custom hook to get the hub instance directly
export const useChatHub = (): IChatHub => {
  const { hub, isConnected } = useGetChatHubContext();
  if (!hub) {
    throw new Error("Hub is not initialized");
  }
  if (!isConnected) {
    console.warn("Hub is not connected yet");
  }
  return hub;
};

// Custom hook for components to register their own receivers
export const useRegisterChatRecevier = (receiver: IChatReceiver): void => {
  const { connection } = useGetChatHubContext();

  useEffect(() => {
    if (!connection) return;

    // Register the receiver
    const receiverRegister = getReceiverRegister("IChatReceiver");
    const subscription: Disposable = receiverRegister.register(
      connection,
      receiver
    );

    console.log("Receiver registered");

    // Cleanup: unregister when component unmounts or receiver changes
    return () => {
      console.log("Receiver unregistered");
      subscription.dispose();
    };
  }, [connection, receiver]);
};
