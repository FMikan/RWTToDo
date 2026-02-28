using System.Text.Json.Serialization;
using Backend.Services;

namespace Backend.Models;

public class ExamReadDto
{
    public Guid Id { get; set; }
    
    public Guid UserId { get; set; }
    
    public Guid? SubjectId { get; set; }
    
    [JsonConverter(typeof(DateTimeShortConverter))]
    public DateTime? Date { get; set; }
    
    public string? Description { get; set; }
    
    [JsonConverter(typeof(DateTimeShortConverter))]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}