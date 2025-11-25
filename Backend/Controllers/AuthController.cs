using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data; 
using Backend.Models;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Controllers{

	[ApiController]
	[Route("api/[controller]")]
	public class AuthController : ControllerBase
	{
		private readonly AppDbContext _context;
		private readonly IConfiguration _configuration;

		public AuthController(AppDbContext context, IConfiguration configuration)
		{
			_context = context;
			_configuration = configuration;
		}
		
    	[HttpPost("register")]
    	public async Task<IActionResult> Register(UserRegisterDto request)
    	{
			if (!ModelState.IsValid)
        		return BadRequest(ModelState);

			var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        	if (await _context.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail))
        		return BadRequest("A user with this email already exists.");
	        
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
        		return StatusCode(500, "Error saving data.");
    		}	
        
        	return StatusCode(201); 
		}
	    
	    
	    [HttpPost("login")]
		public async Task<IActionResult> Login(UserLoginDto request)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);
		
			var normalizedEmail = request.Email.Trim().ToLowerInvariant();
		
			var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
		
			if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
			{
				return Unauthorized("Incorrect email or password.");
			}
		
			var claims = new List<Claim>
			{
				new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
			};

			var keyString = _configuration["Jwt:Key"] ?? "dev_secret_change_this_to_secure_and_long";
			var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
			var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
			
			
			int expiresMinutes;
			if (!int.TryParse(_configuration["Jwt:ExpiresMinutes"], out expiresMinutes))
				expiresMinutes = 60;

			var token = new JwtSecurityToken(
				issuer: _configuration["Jwt:Issuer"],
				audience: _configuration["Jwt:Audience"],
				claims: claims,
				expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
				signingCredentials: creds
			);
			
			var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
			return Ok(new { token = tokenString });
		}
	}
}
