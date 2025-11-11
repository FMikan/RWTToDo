/*
DTO -> Data Transfer Object 
- it is used to transfer data from the client to the server, but never contains data that it should not receive from the user.
- allows the API to send only the data the client needs, while hiding the internals from the model/database.
*/

using System.ComponentModel.DataAnnotations;

namespace Backend.Models;
public class UserRegisterDto
{
    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}