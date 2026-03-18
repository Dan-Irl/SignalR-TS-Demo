using Microsoft.AspNetCore.SignalR;

namespace SignalRDemo.API.Chat;

public class ChatHub : Hub<IChatReceiver>, IChatHub
{
    private static readonly Dictionary<string, string> _participants = new();
    private static readonly object _lock = new();

    public async Task Join(string username)
    {
        lock (_lock)
        {
            _participants[Context.ConnectionId] = username;
        }

        await Clients.All.OnJoin(username, DateTime.UtcNow);
    }

    public async Task Leave()
    {
        string? username = null;
        lock (_lock)
        {
            if (_participants.TryGetValue(Context.ConnectionId, out username))
            {
                _participants.Remove(Context.ConnectionId);
            }
        }

        if (username != null)
        {
            await Clients.All.OnLeave(username, DateTime.UtcNow);
        }
    }

    public Task<IEnumerable<string>> GetParticipants()
    {
        lock (_lock)
        {
            return Task.FromResult<IEnumerable<string>>(_participants.Values.ToList());
        }
    }

    public async Task SendMessage(string message)
    {
        string? username = null;
        lock (_lock)
        {
            _participants.TryGetValue(Context.ConnectionId, out username);
        }

        if (username != null)
        {
            var msg = new Message(username, message, DateTime.UtcNow);
            await Clients.All.OnReceiveMessage(msg);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await Leave();
        await base.OnDisconnectedAsync(exception);
    }
}
