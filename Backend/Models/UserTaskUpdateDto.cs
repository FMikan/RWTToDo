
using System.Text.Json.Serialization;
using Backend.Services;

namespace Backend.Models;

public class UserTaskUpdateDto
{
    public Guid? SubjectId { get; set; }
    
    public string Title { get; set; } = "";
    
    public string? Description { get; set; }
    
    public DateTime? DueDate { get; set; }
    
    public TaskPriority Priority { get; set; }
}