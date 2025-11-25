using Backend.Repositories;

namespace Backend.BackgroundServices;

public class ExpiredTokenRemovalBackgroundService : BackgroundService
{
    private readonly IServiceProvider _services;

    public ExpiredTokenRemovalBackgroundService(IServiceProvider services)
    {
        _services = services;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // pokreni odmah
        await CleanTokens();

        // ponavljaj svakih sat vremena
        var timer = new PeriodicTimer(TimeSpan.FromHours(1));

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await CleanTokens();
        }
    }

    private async Task CleanTokens()
    {
        using var scope = _services.CreateScope();

        var repo = scope.ServiceProvider.GetRequiredService<RefreshTokenRepository>();

        var olderThan = DateTime.UtcNow.AddHours(-1);

        await repo.BulkDelete(olderThan);
    }
}