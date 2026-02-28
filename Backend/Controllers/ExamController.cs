using System.Security.Claims;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExamController : Controller
{
    private readonly AppDbContext _dbContext;

    public ExamController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ExamReadDto>> CreateExam(ExamCreateDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest();
        }

        var exam = new Exam
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            SubjectId = request.SubjectId,
            Description = request.Description,
            Date = request.Date,
            CreatedAt = DateTime.UtcNow
        };
        
         _dbContext.Exams.Add(exam);
        await _dbContext.SaveChangesAsync();

        var examReadDto = new ExamReadDto
        {
            Id = exam.Id,
            UserId = exam.UserId,
            SubjectId = exam.SubjectId,
            Description = exam.Description,
            Date = exam.Date,
            CreatedAt = exam.CreatedAt
        };
        
        return Ok(examReadDto);
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<ExamReadDto>> GetById(Guid id)
    {
        var exam = await _dbContext.Exams.FindAsync(id);

        if (exam == null)
            return NotFound();

        var dto = new ExamReadDto
        {
            Id = exam.Id,
            UserId = exam.UserId,
            SubjectId = exam.SubjectId,
            Description = exam.Description,
            Date = exam.Date,
            CreatedAt = exam.CreatedAt
        };

        return Ok(dto);
    }
    
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetExams()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userIdString == null)
            return Unauthorized("User ID not found in token.");

        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized("Invalid user ID format.");
      
        var exams = await _dbContext.Exams
            .Where(x => x.UserId == userId)
            .Select(x => new ExamReadDto
            {
                Id =  x.Id,
                UserId = x.UserId,
                SubjectId = x.SubjectId,
                Date = x.Date,
                Description = x.Description,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync();

        return Ok(exams);
    }
    
    [Authorize]
    [HttpDelete("{id}")]
        
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var exam = await _dbContext.Exams 
            .FirstOrDefaultAsync(s => s.Id == id);
            
        if (exam == null)
            return NotFound("Task not found.");
            
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
        if (userIdString == null)
            return Unauthorized("User ID not found in token.");
            
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized("Invalid user ID format.");
            
        if (exam.UserId != userId)
            return Unauthorized("You do not have permission to delete this task.");
            
        _dbContext.Exams.Remove(exam);

        try
        {
            await _dbContext.SaveChangesAsync();
        }
        catch
        {
            return StatusCode(500, "Error deleting data.");
        }
            
        return Ok("Exam deleted.");
    }
    
    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateExam(Guid id, [FromBody] ExamUpdateDto request)
    {
        var exam= await _dbContext.Exams.FindAsync(id);

        if (exam == null)
            return NotFound("Task not found.");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null || exam.UserId.ToString() != userId)
            return Unauthorized("You do not have permission to update this task.");
        
        exam.Description = request.Description;
        exam.Date = request.Date;
        exam.SubjectId = request.SubjectId;

        try
        {
            await _dbContext.SaveChangesAsync();
        }
        catch
        {
            return StatusCode(500, "Error updating task");
        }

        return Ok("Exam updated successfully.");
    }
}