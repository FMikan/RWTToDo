using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Subject
{
    [Key]
    public Guid Id { get; set; }
    
    public Guid UserId { get; set; }
    
    [MaxLength(70)]
    [Required]
    public string? Name { get; set; }    
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}