namespace Backend.Models;

public class ExamReadDto
{
    public Guid Id { get; set; }
    
    public Guid UserId { get; set; }
    
    public Guid? SubjectId { get; set; }
    
    public DateTime? Date { get; set; }
    
    public string? Description { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}