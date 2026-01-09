using Microsoft.EntityFrameworkCore;
using EduKids.Models;

namespace EduKids.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Tüm Tablolar Burada Olmalı
        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ChildProfile> ChildProfiles { get; set; } // Bu eksikti, geri geldi
        public DbSet<ChildProgress> ChildProgresses { get; set; } // Bu eksikti
        public DbSet<GameGuide> GameGuides { get; set; } // Bu eksikti
        public DbSet<Comment> Comments { get; set; } // Bu eksikti

        // Yeni Tablolar
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<BlogPost> BlogPosts { get; set; }
        public DbSet<ExpertAvailability> ExpertAvailabilities { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<ExpertQuestion> ExpertQuestions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // --- MEVCUT KODLARIN (Appointment) ---
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Expert)
                .WithMany(u => u.AppointmentsAsExpert)
                .HasForeignKey(a => a.ExpertId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Parent)
                .WithMany(u => u.AppointmentsAsParent)
                .HasForeignKey(a => a.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            // --- YENİ EKLENECEK KISIM (Mesajlar İçin) ---
            modelBuilder.Entity<Message>()
                .HasOne<User>() // Gönderen Kullanıcı
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne<User>() // Alan Kullanıcı
                .WithMany(u => u.ReceivedMessages)
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}