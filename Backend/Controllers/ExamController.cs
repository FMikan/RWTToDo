using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

public class ExamController : Controller
{
    private readonly AppDbContext _dbContext;

    public ExamController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ExamReadDto>> CreateTask(ExamCreateDto request)
    {
        
    }
    
}