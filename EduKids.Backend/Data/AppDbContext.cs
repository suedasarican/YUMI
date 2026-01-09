using Microsoft.EntityFrameworkCore;
using EduKids.Models;

namespace EduKids.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // --- TABLOLAR (DbSet) ---
        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ChildProfile> ChildProfiles { get; set; }
        public DbSet<ChildProgress> ChildProgresses { get; set; }
        public DbSet<GameGuide> GameGuides { get; set; }
        public DbSet<Comment> Comments { get; set; }

        // Yeni Eklenenler
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<BlogPost> BlogPosts { get; set; }
        public DbSet<ExpertAvailability> ExpertAvailabilities { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<ExpertQuestion> ExpertQuestions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. RANDEVU İLİŞKİLERİ
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Expert)
                .WithMany(u => u.AppointmentsAsExpert)
                .HasForeignKey(a => a.ExpertId)
                .OnDelete(DeleteBehavior.Restrict); // Uzman silinirse randevu geçmişi silinmesin

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Parent)
                .WithMany(u => u.AppointmentsAsParent)
                .HasForeignKey(a => a.ParentId)
                .OnDelete(DeleteBehavior.Restrict); // Veli silinirse randevu geçmişi silinmesin

            // 2. MESAJ İLİŞKİLERİ
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender) // Message modelinde Sender property'si olmalı
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Receiver) // Message modelinde Receiver property'si olmalı
                .WithMany(u => u.ReceivedMessages)
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            // 3. BLOG POST İLİŞKİSİ (YENİ EKLENDİ)
            modelBuilder.Entity<BlogPost>()
                .HasOne(b => b.Author)
                .WithMany() // User modelinde 'BlogPosts' listesi olmasa bile ilişki kurulabilir
                .HasForeignKey(b => b.AuthorId)
                .OnDelete(DeleteBehavior.Restrict); // Yazar silinirse bloglar kalır (veya Cascade yaparsan silinir)
        }
    }
}