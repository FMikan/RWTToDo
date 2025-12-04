using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class UserTask
{
    [Key]
    public Guid Id { get; set; }
    
    [ForeignKey("User")]
    public Guid UserId { get; set; }
    
    [ForeignKey("Subject")]
    public Guid? SubjectId { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(600)]
    public string? Description { get; set; }
    
    public DateTime? DueDate { get; set; }

    public TaskPriority Priority { get; set; } = TaskPriority.Low;
    
    [EnumDataType(typeof(TaskStatus))]
    public TaskStatus Status { get; set; } = TaskStatus.Active;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
}

public enum TaskPriority
{
    Low = 1,
    Medium = 2,
    High = 3,
    Urgent = 4,
    Critical = 5
}

public enum TaskStatus
{
    Active,
    Completed
}