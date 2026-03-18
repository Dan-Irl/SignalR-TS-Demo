# SignalR TypeScript Demo

A strongly-typed SignalR chat application demonstrating real-time communication between .NET and React using automatically generated TypeScript types.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Restore .NET tools
dotnet tool restore

### 2. Run the Application

```bash
# From repository root
aspire run
```

## Architecture

### Backend (.NET 10)
- **SignalR Hub** - Real-time chat hub with strongly-typed interfaces
- **TypedSignalR.Client.TypeScript** - Generates TypeScript types from C# interfaces
- **Tapper** - Generates TypeScript types from C# records/classes
- **.NET Aspire** - Orchestration and service discovery

### Frontend (React + TypeScript + Vite)
- **ChatHubProvider** - React context for managing SignalR connection
- **Component-Level Receivers** - Each component registers its own event handlers
- **Generated Types** - Full type safety from C# to TypeScript

## Generating TypeScript Types

After modifying C# hub interfaces or types:

```bash
dotnet tsrts --project SignalRDemo.API/SignalRDemo.API.csproj --output .\SignalRDemo.Frontend/src/generated_hub
```

This generates:
- `SignalRDemo.API.Chat.ts` - Type definitions (from Tapper)
- `TypedSignalR.Client/SignalRDemo.API.Chat.ts` - Hub and receiver interfaces
- `TypedSignalR.Client/index.ts` - Hub proxy factory and receiver registration

## Usage Example

### Setup Provider

```typescript
import { ChatHubProvider } from './contexts';

function App() {
    return (
        <ChatHubProvider 
            hubUrl="http://localhost:5193/chatHub"
            autoConnect={true}
        >
            <ChatComponent />
        </ChatHubProvider>
    );
}
```

### Use in Components

```typescript
import { useMemo } from 'react';
import { useChatHub, useChatHubProxy, useRegisterReceiver } from './contexts';
import type { IChatReceiver, Message } from './contexts';

function ChatComponent() {
    const { isConnected, connectionState, error } = useChatHub();
    const hub = useChatHubProxy();
    const [messages, setMessages] = useState<Message[]>([]);

    // Register event handlers
    const receiver: IChatReceiver = useMemo(
        () => ({
            onReceiveMessage: async (message: Message) => {
                setMessages(prev => [...prev, message]);
            },
            onLeave: async (username, dateTime) => {
                console.log(`${username} left`);
            },
            onJoin: async (username, dateTime) => {
                console.log(`${username} joined`);
            },
        }),
        [],
    );

    useRegisterReceiver(receiver);

    // Call hub methods
    const sendMessage = async () => {
        await hub.join('Alice');
        await hub.sendMessage('Hello!');
        const participants = await hub.getParticipants();
        await hub.leave();
    };

    return (
        <button onClick={sendMessage} disabled={!isConnected}>
            Send Message
        </button>
    );
}
```

## Key Concepts

### Hub Proxy Factory

The **Hub Proxy Factory** creates a strongly-typed wrapper around the raw SignalR connection. Instead of calling methods with magic strings like:

```typescript
// Without proxy - No type safety, easy to make mistakes
await connection.invoke("SendMessage", "Hello");  // Typo in method name? Runtime error!
```

You get full TypeScript type safety:

```typescript
// With proxy - Full IntelliSense and compile-time checking
const hub = useChatHubProxy();
await hub.sendMessage("Hello");  // TypeScript validates method exists and parameters are correct
```

**Benefits:**
- **Autocomplete** - Your IDE shows all available methods
- **Type checking** - Wrong types or parameters = compile error
- **Refactoring** - Rename in C# → TypeScript errors immediately
- **Documentation** - Method signatures with JSDoc comments

### Receivers & Event Handlers

A **Receiver** defines methods that the **server can call on your client**. Think of it as the opposite of the hub:

- **Hub** (IChatHub) = Methods you call on the server: `join()`, `sendMessage()`, etc.
- **Receiver** (IChatReceiver) = Methods the server calls on you: `onReceiveMessage()`, `onJoin()`, etc.

**Why Component-Level Receivers?**

Each component can register its own receiver handlers for the same events:

```typescript
// ChatComponent - Shows messages in chat
const chatReceiver: IChatReceiver = {
    onReceiveMessage: async (message) => {
        setMessages(prev => [...prev, message]);  // Add to chat
    }
};

// NotificationComponent - Shows toast notifications
const notificationReceiver: IChatReceiver = {
    onReceiveMessage: async (message) => {
        showToast(`New message from ${message.username}`);  // Show notification
    }
};
```

Both components react to the same server event, but in different ways. This makes your code:
- **Modular** - Each component handles events independently
- **Reusable** - Add/remove components without affecting others
- **Clean** - No prop drilling or global state needed

### Multiple Receivers
Multiple components can independently listen to the same SignalR events:

```typescript
function App() {
    return (
        <ChatHubProvider hubUrl="http://localhost:5193/chatHub">
            <ChatComponent />          {/* Shows chat messages */}
            <NotificationComponent />  {/* Shows toast notifications */}
        </ChatHubProvider>
    );
}
```

## roject Structure

```
SignalR-TS-Demo/
├── SignalRDemo.API/           # .NET SignalR backend
│   ├── Chat/
│   │   ├── IChatHub.cs        # Hub interface
│   │   ├── IChatReceiver.cs   # Receiver interface
│   │   ├── ChatHub.cs         # Hub implementation
│   │   └── Message.cs         # Message record
│   └── Program.cs
├── SignalRDemo.Frontend/      # React frontend
│   └── src/
│       ├── contexts/          # ChatHub React context
│       │   ├── ChatHubProvider
│       │   └── Hooks
│       ├── generated_hub/     # Generated TypeScript files
│       ├── ChatComponent.tsx
│       └── App.tsx
└── SignalRDemo.AppHost/       # .NET Aspire orchestration
```

## Docs

- [TypedSignalR.Client](https://github.com/nenoNaninu/TypedSignalR.Client) - Strongly-typed SignalR client generator
- [Tapper](https://github.com/nenoNaninu/Tapper) - C# to TypeScript transpiler
- [SignalR Documentation](https://docs.microsoft.com/aspnet/core/signalr/) - Official SignalR docs