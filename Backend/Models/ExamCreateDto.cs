using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class ExamCreateDto
{
    public Guid UserId { get; set; }
    
    [Required]
    public Guid SubjectId { get; set; }
    
    [Required]
    public DateTime Date { get; set; }
    
    [MaxLength(600)]
    public string? Description { get; set; }
}