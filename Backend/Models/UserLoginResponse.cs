namespace Backend.Models;

public class UserLoginResponse
{
    public Guid Id { get; set; } 
    
    public int ExpiresIn { get; set; }
    
    public string? AccessToken { get; set; }
    
    public string? RefreshToken { get; set; }
}