using TypedSignalR.Client;

namespace SignalRDemo.API.Chat;

[Receiver]
public interface IChatReceiver
{
    Task OnReceiveMessage(Message message);
    Task OnLeave(string username, DateTime dateTime);
    Task OnJoin(string username, DateTime dateTime);
}
