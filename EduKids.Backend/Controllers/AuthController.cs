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

        // --- GİRİŞ YAPMA (LOGIN) ---
        [HttpPost("login")]
        public async Task<ActionResult<User>> Login([FromBody] LoginDto loginRequest)
        {
            // E-posta ve Şifre kontrolü
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginRequest.Email && u.PasswordHash == loginRequest.Password);

            if (user == null)
            {
                return Unauthorized(new { message = "E-posta veya şifre hatalı." });
            }

            // Hesap dondurulmuş mu kontrolü
            if (!user.IsActive)
            {
                return Unauthorized(new { message = "Hesabınız pasif durumdadır. Yönetici ile görüşün." });
            }

            return Ok(user);
        }

        // --- KAYIT OLMA (REGISTER) - EKSİK OLAN KISIM BUYDU ---
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            // 1. E-posta daha önce alınmış mı kontrol et
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
            {
                return BadRequest("Bu e-posta adresi zaten kullanımda.");
            }

            // 2. Güvenlik: Eğer Rol belirtilmediyse otomatik Ebeveyn (Parent) yap
            // (Frontend zaten Role:2 gönderiyor ama garanti olsun)
            if (user.Role == 0 && !user.Email.Contains("admin"))
            {
                user.Role = UserRole.Parent;
            }

            user.IsActive = true; // Kayıt olan direkt aktif olsun

            // 3. Veritabanına Ekle
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(user);
        }
    }

    // Login için veri taşıyıcı (DTO)
    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}