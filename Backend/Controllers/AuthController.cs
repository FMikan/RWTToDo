using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data; 
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Backend.Services;

namespace Backend.Controllers{

	[ApiController]
	[Route("api/[controller]")]
	public class AuthController : ControllerBase
	{
		private readonly AppDbContext _context;
		private readonly JwtAuthenticationService _jwtAuthenticationService;
		
		public AuthController(AppDbContext context, JwtAuthenticationService jwtAuthenticationService)
		{
			_context = context;
			_jwtAuthenticationService = jwtAuthenticationService;
		}
		
		[AllowAnonymous]
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
	    
	    [AllowAnonymous]
	    [HttpPost("login")]
		public async Task<ActionResult<UserLoginResponse>> Login([FromBody] UserLoginDto request)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			var result = await _jwtAuthenticationService.Authenticate(request);
			
			if (result == null)
				return Unauthorized("Invalid email or password.");
			
			return Ok(result);
			
		}
		[AllowAnonymous]
		[HttpPost("Refresh")]
		public async Task<ActionResult<UserLoginResponse?>> Refresh([FromBody] UserRefreshRequest request)
		{
			if(string.IsNullOrEmpty(request.Token))
				return BadRequest("Invalid Token");
			
			var result = await _jwtAuthenticationService.ValidateRefreshToken(request.Token);
			
			return result is not null ? result : Unauthorized();
		}
	}
}
