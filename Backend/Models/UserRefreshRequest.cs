using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class UserRefreshRequest
{
    [Required(ErrorMessage = "Refresh token is required.")]
    public string? Token { get; set; }
}