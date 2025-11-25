using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Data;
using Backend.Models;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Services;

public class JwtAuthenticationService
{
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _context;
    private readonly RefreshTokenRepository _refreshTokenRepository;
    
    public JwtAuthenticationService(IConfiguration configuration, AppDbContext context, RefreshTokenRepository refreshTokenRepository)
    {
        _configuration = configuration;
        _context = context;
        _refreshTokenRepository = refreshTokenRepository;
    }

    public async Task<UserLoginResponse?> Authenticate(UserLoginDto request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            return null;
        
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;
        
        return await GenerateJwtToken(user);
    }

    public async Task<UserLoginResponse?> ValidateRefreshToken(string token)
    {
        var refreshToken = await _refreshTokenRepository.Get(token);
        
        if (refreshToken == null || refreshToken.Expiry < DateTime.UtcNow)
            return null;
        
        await _refreshTokenRepository.Delete(refreshToken);
        
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == refreshToken.UserId);
        
        if (user == null) return null;
        
        return await GenerateJwtToken(user);
    }
    
    private async Task<UserLoginResponse> GenerateJwtToken(User user)
    {
        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];
        var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);
        var tokenValidityMins = _configuration.GetValue<int>("Jwt:TokenValidityMins");
        var tokenExpiryTimeStamp = DateTime.UtcNow.AddMinutes(tokenValidityMins);
        
        var token = new JwtSecurityToken(issuer,
            audience,
            [
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            ],
            expires: tokenExpiryTimeStamp,
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key), 
                SecurityAlgorithms.HmacSha256));
        
        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

        return new UserLoginResponse
        {
            Id = user.Id,
            AccessToken = accessToken,
            ExpiresIn = (int)tokenExpiryTimeStamp.Subtract(DateTime.UtcNow).TotalSeconds,
            RefreshToken = await GenerateRefreshToken(user.Id)
        };
    }
    
    private async Task<string> GenerateRefreshToken(Guid userId)
    {
        var refreshTokenValidityMins = _configuration.GetValue<int>("Jwt:RefreshTokenValidityMins");
        
        var refreshToken = new RefreshToken
        {
            Token = Guid.NewGuid().ToString(),
            Expiry = DateTime.UtcNow.AddMinutes(refreshTokenValidityMins),
            UserId = userId
        };
        
        await _refreshTokenRepository.Create(refreshToken);
        
        return refreshToken.Token;
    }
}