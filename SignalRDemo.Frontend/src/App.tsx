import { ChatHubProvider } from "./contexts";
import { ChatComponent } from "./ChatComponent";
import { NotificationComponent } from "./NotificationComponent";

// Main App component with ChatHub provider
function App() {
  return (
    <ChatHubProvider hubUrl="http://localhost:5193/chatHub" autoConnect={true}>
      <ChatComponent />
      <NotificationComponent />
    </ChatHubProvider>
  );
}

export default App;
