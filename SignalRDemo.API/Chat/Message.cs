using Tapper;

namespace SignalRDemo.API.Chat;

[TranspilationSource]
public record Message(string Username, string Content, DateTime TimeStamp);
