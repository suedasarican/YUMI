using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduKids.Data;
using EduKids.Models;

namespace EduKids.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AppointmentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: Uzmanın randevularını getir (Takvimde dolu görünsün diye)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointments([FromQuery] int? expertId, [FromQuery] int? parentId)
        {
            var query = _context.Appointments.AsQueryable();

            if (expertId.HasValue) query = query.Where(a => a.ExpertId == expertId);
            if (parentId.HasValue) query = query.Where(a => a.ParentId == parentId);

            return await query.OrderByDescending(a => a.Date).ToListAsync();
        }

        // POST: Randevu Satın Al (Direkt Onaylı)
        [HttpPost]
        public async Task<ActionResult<Appointment>> CreateAppointment(Appointment appointment)
        {
            // 1. Önce bu saat gerçekten müsait mi kontrol et (Çakışma Kontrolü)
            // Not: Tarih karşılaştırmasında saat farkı olmaması için .Date kullanıyoruz
            var availabilitySlot = await _context.ExpertAvailabilities
                .FirstOrDefaultAsync(x =>
                    x.ExpertId == appointment.ExpertId &&
                    x.AvailableDate.Date == appointment.Date.Date &&
                    x.AvailableTime == appointment.Time);

            if (availabilitySlot == null)
            {
                return BadRequest("Seçilen saat artık müsait değil veya başkası tarafından alındı.");
            }

            // 2. Randevuyu 'Approved' (Onaylı) olarak kaydet (Çünkü satın alındı)
            appointment.Status = AppointmentStatus.Approved;
            _context.Appointments.Add(appointment);

            // 3. Müsaitlik slotunu sil (Artık dolu)
            _context.ExpertAvailabilities.Remove(availabilitySlot);

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAppointments), new { id = appointment.Id }, appointment);
        }
    }
}