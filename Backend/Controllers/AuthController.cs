using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data; 
using Backend.Models;

namespace Backend.Controllers{

	[ApiController]
	[Route("api/[controller]")]
	public class AuthController : ControllerBase
	{
    	private readonly AppDbContext _context;
	    

    	public AuthController(AppDbContext context)
    	{
        	_context = context;
    	}

    	[HttpPost("register")]
    	public async Task<IActionResult> Register(UserRegisterDto request)
    	{
			if (!ModelState.IsValid)
        		return BadRequest(ModelState);
     
        	if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
        		return BadRequest("Lozinka mora imati minimalno 8 znakova.");
   
			if (string.IsNullOrWhiteSpace(request.Email))
        		return BadRequest("Email je obavezan.");

			var normalizedEmail = request.Email.Trim().ToLowerInvariant();
      
        	if (!request.Password.Any(char.IsDigit))
           		return BadRequest("Lozinka mora sadržavati barem jedan broj.");
    
        	if (!new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(normalizedEmail))
        		return BadRequest("Neispravan format emaila.");

        	if (await _context.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail))
        		return BadRequest("Korisnik s ovim emailom već postoji.");
            
        
        	string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        
        	var user = new User
        	{
            	FirstName = request.FirstName,
            	LastName = request.LastName,
            	Email = normalizedEmail,
            	PasswordHash = passwordHash,
        	};
        
        	_context.Users.Add(user);
        	try
    		{
        		await _context.SaveChangesAsync();
   			}
    		catch
    		{
        		return StatusCode(500, "Greška pri spremanju podataka.");
    		}	
        
        	return StatusCode(201); 

		}
	}
}
