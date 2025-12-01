using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class SubjectCreateDto
{
    [Required(ErrorMessage = "Subject name is required.")]
    [MaxLength(70, ErrorMessage = "Subject name must be 70 characters or less")]
    public string? Name { get; set; }
}