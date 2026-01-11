using System.Security.Claims;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskStatus = Backend.Models.TaskStatus;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaskController : Controller
{
    private readonly AppDbContext _dbContext;

    public TaskController(AppDbContext context)
    {
      _dbContext = context;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<UserTaskReadDto>> CreateTask(UserTaskCreateDto request)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var task = new UserTask
      {
        Id = Guid.NewGuid(),
        UserId = request.UserId,
        SubjectId = request.SubjectId,
        Title = request.Title,
        Description = request.Description,
        DueDate = request.DueDate,
        Priority = request.Priority,
        Status = request.Status,
        CreatedAt = DateTime.UtcNow
      };

      _dbContext.Tasks.Add(task);
      await _dbContext.SaveChangesAsync();

      var taskReadDto = new UserTaskReadDto
      {
        Id = task.Id,
        UserId = task.UserId,
        SubjectId = task.SubjectId,
        Title = task.Title,
        Description = task.Description,
        DueDate = task.DueDate,
        Priority = task.Priority,
        Status = task.Status,
        CreatedAt = task.CreatedAt
      };

      return CreatedAtAction(nameof(GetById), new { id = task.Id }, taskReadDto);

    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserTaskReadDto>> GetById(Guid id)
    {
      var task = await _dbContext.Tasks.FindAsync(id);

      if (task == null)
        return NotFound();

      var dto = new UserTaskReadDto
      {
        Id = task.Id,
        UserId = task.UserId,
        SubjectId = task.SubjectId,
        Title = task.Title,
        Description = task.Description,
        DueDate = task.DueDate,
        Priority = task.Priority,
        Status = task.Status,
        CreatedAt = task.CreatedAt
      };

      return Ok(dto);
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetTasks()
    {
      var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

      if (userIdString == null)
        return Unauthorized("User ID not found in token.");

      if (!Guid.TryParse(userIdString, out var userId))
        return Unauthorized("Invalid user ID format.");
      
      var tasks = await _dbContext.Tasks
        .Where(x => x.UserId == userId)
        .Select(x => new UserTaskReadDto
        {
          Id =  x.Id,
          UserId = x.UserId,
          SubjectId = x.SubjectId,
          Title = x.Title,
          Description = x.Description,
          DueDate =  x.DueDate,
          Priority = x.Priority,
          Status = x.Status,
          CreatedAt = x.CreatedAt
        })
        .ToListAsync();

      return Ok(tasks);
    }
    
    [Authorize]
    [HttpDelete("{id}")]
        
    public async Task<IActionResult> DeleteSubject(Guid id)
    {
      var userTask = await _dbContext.Tasks 
        .FirstOrDefaultAsync(s => s.Id == id);
            
      if (userTask == null)
        return NotFound("Task not found.");
            
      var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
      if (userIdString == null)
        return Unauthorized("User ID not found in token.");
            
      if (!Guid.TryParse(userIdString, out var userId))
        return Unauthorized("Invalid user ID format.");
            
      if (userTask.UserId != userId)
        return Unauthorized("You do not have permission to update this task.");
            
      _dbContext.Tasks.Remove(userTask);

      try
      {
        await _dbContext.SaveChangesAsync();
      }
      catch
      {
        return StatusCode(500, "Error deleting data.");
      }
            
      return Ok("Task deleted.");

    }

    [Authorize]
    [HttpPatch("{id}/complete")]
    public async Task<IActionResult> CompleteTask(Guid id)
    {
      var task = await _dbContext.Tasks.FindAsync(id);

      if (task == null)
        return NotFound("Task not found.");

      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null || task.UserId.ToString() != userId)
        return Unauthorized("You do not have permission to update this task.");

      task.Status = TaskStatus.Completed;

      try
      {
        await _dbContext.SaveChangesAsync();
      }
      catch
      {
        return StatusCode(500, "Error completing task");
      }

      return Ok(new
      {
        message = "Task marked as completed.",
        taskId = task.Id,
        status = task.Status.ToString()
      });
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UserTaskUpdateDto request)
    {
      var userTask = await _dbContext.Tasks.FindAsync(id);

      if (userTask == null)
        return NotFound("Task not found.");

      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null || userTask.UserId.ToString() != userId)
        return Unauthorized("You do not have permission to update this task.");

      userTask.Title = request.Title;
      userTask.Description = request.Description;
      userTask.DueDate = request.DueDate;
      userTask.Priority = request.Priority;

      try
      {
        await _dbContext.SaveChangesAsync();
      }
      catch
      {
        return StatusCode(500, "Error updating task");
      }

      return Ok("Task updated successfully.");
    }
}
