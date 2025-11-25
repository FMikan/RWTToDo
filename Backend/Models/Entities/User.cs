using System.ComponentModel.DataAnnotations;    

namespace Backend.Models 
{
    public class User
    {
         [Key]   
         public Guid Id { get; set; } 
 
         [Required] 
         [StringLength(100)]    
         public string FirstName { get; set; } = string.Empty;
 
         [Required]
         [StringLength(100)]
         public string LastName { get; set; } = string.Empty;
 
         [Required]
         [EmailAddress]  
         [StringLength(100)]
         public string Email { get; set; } = string.Empty; 
 
         [Required]
         [MaxLength(100)]
         public string PasswordHash { get; set; } = string.Empty;   
         public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
     }
 }