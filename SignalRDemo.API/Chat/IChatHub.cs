using TypedSignalR.Client;

namespace SignalRDemo.API.Chat;

[Hub]
public interface IChatHub
{
    Task Join(string username);
    Task Leave();
    Task<IEnumerable<string>> GetParticipants();
    Task SendMessage(string message);
}
