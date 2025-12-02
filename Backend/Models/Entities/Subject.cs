using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class Subject
{
    [Key]
    public Guid Id { get; set; }
    
    [ForeignKey("User")]
    public Guid UserId { get; set; }
    
    [MaxLength(70)]
    [Required]
    public string? Name { get; set; }    
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}