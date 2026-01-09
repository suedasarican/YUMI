using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduKids.Data;
using EduKids.Models;

namespace EduKids.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/users/experts
        // Sadece Uzmanları Getirir
        [HttpGet("experts")]
        public async Task<ActionResult<IEnumerable<User>>> GetExperts()
        {
            var experts = await _context.Users
                .Where(u => u.Role == UserRole.Expert) // Sadece uzmanlar
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Title, // Veritabanında bu alanlar varsa
                    u.Bio,
                    u.ImageUrl
                })
                .ToListAsync();

            return Ok(experts);
        }
    }
}