using System.Security.Claims;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{


    [ApiController]
    [Route("api/[controller]")]
    public class SubjectController : Controller
    {
        private readonly AppDbContext _dbContext;
        

        public SubjectController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateSubject([FromBody] SubjectCreateDto request)
        {
            if(!ModelState.IsValid)
                return BadRequest(ModelState);
            
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdString == null)
                return Unauthorized("User ID not found in token.");

            Guid userId;

            if (!Guid.TryParse(userIdString, out userId))
                return Unauthorized("Invalid user ID format.");
            
            var exists = await _dbContext.Subjects
                .AnyAsync(s => s.Name == request.Name && s.UserId == userId);

            if (exists)
                return Conflict("Subject with this name already exists.");


            var subject = new Subject
            {
                Name = request.Name,
                UserId = userId
            };
                
            _dbContext.Subjects.Add(subject);
            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch
            {
                return StatusCode(500, "Error saving data.");
            }	
        
            return StatusCode(201);     
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubject(Guid id, [FromBody] SubjectCreateDto request)
        {
            
            var subject = await _dbContext.Subjects
                .FirstOrDefaultAsync(s => s.Id == id);
            
            if (subject == null)
                return NotFound("Subject not found.");
            
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (userIdString == null)
                return Unauthorized("User ID not found in token.");
            
            Guid userId;
            
            if (!Guid.TryParse(userIdString, out userId))
                return Unauthorized("Invalid user ID format.");
            
            if (subject.UserId != userId)
                return Unauthorized("You do not have permission to update this subject.");
            
            subject.Name = request.Name;
                
            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch
            {
                return StatusCode(500, "Error updating data.");
            }
            
            return Ok("Subject updated.");
            
        }

        [Authorize]
        [HttpDelete("{id}")]
        
        public async Task<IActionResult> DeleteSubject(Guid id)
        {
            var subject = await _dbContext.Subjects 
                .FirstOrDefaultAsync(s => s.Id == id);
            
            if (subject == null)
                return NotFound("Subject not found.");
            
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (userIdString == null)
                return Unauthorized("User ID not found in token.");
            
            Guid userId;
            
            if (!Guid.TryParse(userIdString, out userId))
                return Unauthorized("Invalid user ID format.");
            
            if (subject.UserId != userId)
                return Unauthorized("You do not have permission to update this subject.");
            
            _dbContext.Subjects.Remove(subject);

            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch
            {
                return StatusCode(500, "Error deleting data.");
            }
            
            return Ok("Subject deleted.");

        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetSubjects()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (userIdString == null)
                return Unauthorized("User ID not found in token.");
            
            Guid userId;
            
            if (!Guid.TryParse(userIdString, out userId))
                return Unauthorized("Invalid user ID format.");
            
            var subjects = await _dbContext.Subjects
                .Where(x => x.UserId == userId)
                .Select(x => new SubjectListDto
                {
                    Id = x.Id,
                    Name = x.Name
                })
                .ToListAsync();
            
            return Ok(subjects);
        }
        
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<SubjectListDto>> GetById(Guid id)
        {
            var subject = await _dbContext.Subjects.FirstOrDefaultAsync(s => s.Id == id);

            if (subject == null)
                return NotFound("Subject not found.");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized("User ID missing in token.");

            if (subject.UserId.ToString() != userId)
                return Forbid("You do not have permission to access this subject.");

            return Ok(new SubjectListDto
            {
                Id = subject.Id,
                Name = subject.Name
            });
        }
    }
}   