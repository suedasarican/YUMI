using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using EduKids.Data;
using EduKids.Models;
using System.Linq;
using System.Threading.Tasks;

namespace EduKids.Controllers
{
    // NOT: AuthController buradan kaldırıldı çünkü artık kendi dosyasında (AuthController.cs).

    // 0.5 PUBLIC CONTROLLER (Giriş yapmadan ürünleri çekmek için)
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
// Namespace burada kapanıyor. Eğer bu parantez eksikse veya bundan sonra başka bir } varsa hata alırsın.