using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduKids.Data;
using EduKids.Models;

namespace EduKids.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BlogController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: Tüm Yayınlanmış Blogları Getir (Anasayfa İçin)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BlogPost>>> GetBlogs()
        {
            return await _context.BlogPosts
                .Include(b => b.Author)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        // 2. GET: Sadece Bana Ait Bloglar (Uzman Paneli İçin)
        [HttpGet("expert/{expertId}")]
        public async Task<ActionResult<IEnumerable<BlogPost>>> GetMyBlogs(int expertId)
        {
            return await _context.BlogPosts
                .Where(b => b.AuthorId == expertId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        // 3. POST: Yeni Blog Yazısı Ekle
        [HttpPost]
        [HttpPost]
        public async Task<ActionResult<BlogPost>> CreateBlog([FromBody] BlogPost blog)
        {
            // Validasyon: Başlık veya İçerik yoksa hata ver
            if (string.IsNullOrEmpty(blog.Title) || string.IsNullOrEmpty(blog.Content))
            {
                return BadRequest(new { message = "Başlık ve içerik zorunludur." });
            }

            // Otomatik doldurulacak alanlar
            blog.CreatedAt = DateTime.UtcNow;

            // Eğer Frontend'den 'authorId' gelmezse varsayılan bir değer atayalım (Patlamaması için)
            if (blog.AuthorId == 0)
            {
                // Geçici çözüm: İlk kullanıcıyı yazar yap (veya hata döndür)
                // blog.AuthorId = 1; 
                return BadRequest(new { message = "Yazar bilgisi (AuthorId) eksik." });
            }

            // Yazarın gerçekten var olup olmadığını kontrol et
            var authorExists = await _context.Users.AnyAsync(u => u.Id == blog.AuthorId);
            if (!authorExists)
            {
                return BadRequest(new { message = "Belirtilen yazar bulunamadı." });
            }

            // Model validasyonunu temizle (Author objesi null gelebilir, sorun değil)
            ModelState.Clear();

            _context.BlogPosts.Add(blog);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBlogs), new { id = blog.Id }, blog);
        }

        // 4. PUT: Blog Güncelle
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBlog(int id, BlogPost blog)
        {
            if (id != blog.Id) return BadRequest();

            var existingBlog = await _context.BlogPosts.FindAsync(id);
            if (existingBlog == null) return NotFound();

            // Sadece değişen alanları güncelle
            existingBlog.Title = blog.Title;
            existingBlog.Content = blog.Content;
            existingBlog.Category = blog.Category;
            existingBlog.ImageUrl = blog.ImageUrl;
            existingBlog.Status = blog.Status;
            // RelatedProductIds için ayrı bir tablo yapısı gerekir ama şimdilik basit tutalım

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // 5. DELETE: Blog Sil
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBlog(int id)
        {
            var blog = await _context.BlogPosts.FindAsync(id);
            if (blog == null) return NotFound();

            _context.BlogPosts.Remove(blog);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}