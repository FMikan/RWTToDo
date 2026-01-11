/*
DTO -> Data Transfer Object 
- it is used to transfer data from the client to the server, but never contains data that it should not receive from the user.
- allows the API to send only the data the client needs, while hiding the internals from the model/database.
*/

using System.ComponentModel.DataAnnotations;

namespace Backend.Models;
public class UserRegisterDto
{
    [Required(ErrorMessage = "First name is required.")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Last name is required.")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        ErrorMessage = "Email format is invalid.")]
    public string Email { get; set; } = string.Empty;

    
    [Required]
    [MinLength(8, ErrorMessage = "The password must have a minimum of 8 characters.")]
    [RegularExpression(@"^(?=.*\d).+$", ErrorMessage = "The password must contain at least one number.")]
    public string Password { get; set; } = string.Empty;
}