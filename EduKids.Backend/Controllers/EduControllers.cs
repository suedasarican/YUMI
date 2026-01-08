using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore; // Added for ToListAsync
using EduKids.Data;
using EduKids.Models;
using System.Linq;
using System.Threading.Tasks; // Added for Async

namespace EduKids.Controllers
{
    // 0. AUTH CONTROLLER (NEW: Handles Login/Register)
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AuthController(AppDbContext context) { _context = context; }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto loginReq)
        {
            // Simple logic for prototype: Find user by Email
            var user = _context.Users.FirstOrDefault(u => u.Email == loginReq.Email);
            if (user == null) return Unauthorized(new { message = "Kullanıcı bulunamadı." });

            // In a real app, you would verify PasswordHash and return a JWT Token here.
            return Ok(user);
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] User user)
        {
            if (_context.Users.Any(u => u.Email == user.Email))
                return BadRequest(new { message = "Bu email zaten kayıtlı." });

            _context.Users.Add(user);
            _context.SaveChanges();
            return Ok(new { message = "Kayıt başarılı!" });
        }
    }

    public class LoginDto { public string Email { get; set; } = ""; public string Password { get; set; } = ""; }

    // 0.5 PUBLIC CONTROLLER (NEW: For fetching data without login)
    [ApiController]
    [Route("api/[controller]")]
    public class PublicController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PublicController(AppDbContext context) { _context = context; }

        [HttpGet("products")]
        public IActionResult GetAllProducts()
        {
            return Ok(_context.Products.ToList());
        }
    }

    // 1. ADMIN CONTROLLER
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Admin")] // Commented out for easier testing without JWT
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AdminController(AppDbContext context) { _context = context; }

        [HttpPost("products")]
        public IActionResult CreateProduct([FromBody] Product product)
        {
            _context.Products.Add(product);
            _context.SaveChanges();
            return Ok(product);
        }

        [HttpDelete("products/{id}")]
        public IActionResult DeleteProduct(int id)
        {
            var product = _context.Products.Find(id);
            if (product == null) return NotFound();
            _context.Products.Remove(product);
            _context.SaveChanges();
            return Ok(new { message = "Silindi" });
        }

        [HttpGet("experts/pending")]
        public IActionResult GetPendingExperts()
        {
            return Ok(_context.Users.Where(u => u.Role == UserRole.Expert && !u.IsActive).ToList());
        }

        [HttpPost("experts/approve/{id}")]
        public IActionResult ApproveExpert(int id)
        {
            var expert = _context.Users.Find(id);
            if (expert == null) return NotFound();
            expert.IsActive = true;
            _context.SaveChanges();
            return Ok(new { message = "Onaylandı" });
        }
    }

    // 2. PARENT CONTROLLER
    [ApiController]
    [Route("api/[controller]")]
    public class ParentController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ParentController(AppDbContext context) { _context = context; }

        [HttpGet("children/{parentId}")]
        public IActionResult GetChildren(int parentId)
        {
            return Ok(_context.ChildProfiles.Where(c => c.ParentId == parentId).ToList());
        }

        [HttpPost("children")]
        public IActionResult AddChild([FromBody] ChildProfile profile)
        {
            _context.ChildProfiles.Add(profile);
            _context.SaveChanges();
            return Ok(profile);
        }
    }

    // 3. EXPERT CONTROLLER
    [ApiController]
    [Route("api/[controller]")]
    public class ExpertController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ExpertController(AppDbContext context) { _context = context; }

        [HttpPost("guides")]
        public IActionResult CreateGuide([FromBody] GameGuide guide)
        {
            _context.GameGuides.Add(guide);
            _context.SaveChanges();
            return Ok(new { message = "Oyun rehberi yayınlandı." });
        }
    }
}