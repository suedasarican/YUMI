using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduKids.Data;
using EduKids.Models;

namespace EduKids.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // --- KULLANICI & UZMAN LİSTELEME ---
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users.ToListAsync();
            return Ok(users);
        }

        // --- UZMAN EKLEME ---
        [HttpPost("experts")]
        public async Task<IActionResult> CreateExpert([FromBody] User expert)
        {
            // Basit bir e-posta kontrolü eklemek iyi olur
            if (await _context.Users.AnyAsync(u => u.Email == expert.Email))
            {
                return BadRequest(new { message = "Bu e-posta adresi zaten kayıtlı." });
            }

            expert.Role = UserRole.Expert; // 1
            expert.IsActive = true;
            _context.Users.Add(expert);
            await _context.SaveChangesAsync();
            return Ok(expert);
        }

        // --- KULLANICI / UZMAN SİLME ---
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound(new { message = "Kullanıcı bulunamadı." });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Kullanıcı başarıyla silindi." });
        }

        // --- ÜRÜN İŞLEMLERİ ---

        // EKSİK OLAN KISIM BUYDU (EKLENDİ):
        [HttpGet("products")]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _context.Products.ToListAsync();
            return Ok(products);
        }

        [HttpPost("products")]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return Ok(product);
        }

        [HttpDelete("products/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Ürün silindi" });
        }
    }
}