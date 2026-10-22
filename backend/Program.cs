using Livekit.Server.Sdk.Dotnet;
using LiveKitApp.Backend;
using LiveKitApp.Backend.EndPoints;
using LiveKitApp.Backend.Services;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

//Binding di LiveKitOptions
builder.Services
    .AddOptions<LiveKitOptions>()
    .Bind(builder.Configuration.GetSection(LiveKitOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddSingleton<RoomServiceClient>(serviceProvider => {
    var options = serviceProvider.GetRequiredService<IOptions<LiveKitOptions>>().Value;
    return new RoomServiceClient(
        host:options.InternalUrl,
        apiKey:options.ApiKey,
        apiSecret:options.ApiSecret
    );
});

builder.Services.AddSingleton<TokenFactory>();

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Configurazione CORS per consentire l'accesso dal frontend React (es. http://localhost:5173) e altri client
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.MapRoomEndpoints();
app.MapTokenEndpoints();

app.Run();
