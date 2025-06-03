using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Serve arquivos estáticos da pasta wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

app.Run();