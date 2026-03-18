var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.SignalRDemo_API>("api")
    .WithHttpEndpoint(port: 5193);

var viteApp = builder.AddViteApp("frontend", "../SignalRDemo.Frontend")
    .WithPnpm()
    .WithReference(api);

builder.Build().Run();
