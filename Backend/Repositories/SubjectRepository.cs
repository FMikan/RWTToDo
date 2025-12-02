using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class SubjectRepository
{
    private readonly AppDbContext _dbContext;
    
    public SubjectRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    
    public async Task<Subject?> Get(Guid id) =>
        await _dbContext.Subjects.FirstOrDefaultAsync(x => x.Id == id);
    
    public async Task Create(Subject subject)
    {
        await _dbContext.Subjects.AddAsync(subject);
        await _dbContext.SaveChangesAsync();
    }
    
    public async Task Delete(Subject subject)
    {
        _dbContext.Subjects.Remove(subject);
        await _dbContext.SaveChangesAsync();
    }
    
}