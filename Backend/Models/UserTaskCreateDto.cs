using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Backend.Services;

namespace Backend.Models;

public class UserTaskCreateDto
{
    public Guid UserId { get; set; }

    public Guid? SubjectId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(600)]
    public string? Description { get; set; }
    
    public DateTime? DueDate { get; set; }

    [Range(1, 5)]
    public TaskPriority Priority { get; set; } = TaskPriority.Low;

    [EnumDataType(typeof(TaskStatus))]
    public TaskStatus Status { get; set; } = TaskStatus.Active;
}