using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduKids.Data;
using EduKids.Models;

namespace EduKids.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExpertAvailabilityController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExpertAvailabilityController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: Uzmanın müsait saatlerini getir
        // Frontend'de takvimi doldurmak için kullanılır
        [HttpGet("{expertId}")]
        public async Task<ActionResult<IEnumerable<ExpertAvailability>>> GetSlots(int expertId)
        {
            return await _context.ExpertAvailabilities
                .Where(x => x.ExpertId == expertId)
                .OrderBy(x => x.AvailableDate)
                .ThenBy(x => x.AvailableTime)
                .ToListAsync();
        }

        // 2. POST: Yeni müsaitlik saati ekle (GÜNCELLENDİ)
        // Artık "Zaten ekli" hatası (409) vermek yerine "Tamam, zaten var" (200) dönüyor.
        // Bu sayede Frontend'deki döngü bozulmuyor.
        [HttpPost]
        public async Task<ActionResult<ExpertAvailability>> AddSlot(ExpertAvailability slot)
        {
            // Aynı saatte başka kayıt var mı kontrol et
            // Not: Date karşılaştırmasında saat farkını yoksaymak için .Date kullanıyoruz
            bool exists = await _context.ExpertAvailabilities.AnyAsync(x =>
                x.ExpertId == slot.ExpertId &&
                x.AvailableDate.Date == slot.AvailableDate.Date &&
                x.AvailableTime == slot.AvailableTime);

            if (exists)
            {
                // Hata fırlatmak yerine mevcut olanı veya başarı mesajı dönüyoruz
                return Ok(new { message = "Bu saat zaten ekli, işlem başarılı sayıldı." });
            }

            _context.ExpertAvailabilities.Add(slot);
            await _context.SaveChangesAsync();

            return Ok(slot);
        }

        // 3. DELETE: Saati sil
        // Uzman takvimden tik işaretini kaldırınca burası çalışacak
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSlot(int id)
        {
            var slot = await _context.ExpertAvailabilities.FindAsync(id);

            if (slot == null)
            {
                // Silinmek istenen şey zaten yoksa, hata değil başarı dönelim (Idempotency)
                return NotFound();
            }

            _context.ExpertAvailabilities.Remove(slot);
            await _context.SaveChangesAsync();
            return NoContent(); // 204 No Content (Başarılı silme)
        }
    }
}