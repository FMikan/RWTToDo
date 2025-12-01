using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class RefreshTokenRepository
{
    private AppDbContext _dbContext;

    public RefreshTokenRepository(AppDbContext dbContext){
        _dbContext = dbContext;
    }
    public async Task<RefreshToken?> Get(string token) =>
        await _dbContext.RefreshTokens.FirstOrDefaultAsync(x => x.Token == token);

    public async Task Create(RefreshToken refreshToken)
    {
        await _dbContext.RefreshTokens.AddAsync(refreshToken);
        await _dbContext.SaveChangesAsync();
    }

    public async Task Delete(RefreshToken refreshToken)
    
    {
        _dbContext.RefreshTokens.Remove(refreshToken);
        await _dbContext.SaveChangesAsync();
    }

    public async Task BulkDelete(DateTime toDateTime) =>
         await _dbContext.RefreshTokens
            .Where(x => x.Expiry <= toDateTime)
            .ExecuteDeleteAsync();
}
