using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

[Table("refresh_token")]
public class RefreshToken
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("token")]
    public string? Token { get; set; }

    [Column("expiry")]
    public DateTime Expiry { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }
}
