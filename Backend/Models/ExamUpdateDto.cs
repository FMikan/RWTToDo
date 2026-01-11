using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class ExamUpdateDto
{
    [Required]
    public Guid SubjectId { get; set; }
    
    [Required]
    public DateTime Date { get; set; }
    
    [MaxLength(600)]
    public string? Description { get; set; }
}