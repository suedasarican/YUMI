using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduKids.Data;
using EduKids.Models;

namespace EduKids.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<ActionResult<User>> Login([FromBody] LoginDto loginRequest)
        {
            // Veritabanında email ve şifre kontrolü (Büyük/küçük harf duyarlılığı olabilir)
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginRequest.Email && u.PasswordHash == loginRequest.Password);

            if (user == null)
            {
                return Unauthorized(new { message = "E-posta veya şifre hatalı." });
            }

            return Ok(user);
        }
    }

    // Login için basit DTO
    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}