using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class UserLoginDto
{
    [Required(ErrorMessage = "Email is required.")]
    [RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", 
        ErrorMessage = "Email format is invalid.")]
    public string Email { get; set; } = string.Empty;

    
    [Required]
    [MinLength(8, ErrorMessage = "The password must have a minimum of 8 characters.")]
    [RegularExpression(@"^(?=.*\d).+$", ErrorMessage = "The password must contain at least one number.")]
    public string Password { get; set; } = string.Empty;

}

