using Microsoft.EntityFrameworkCore;
using EduKids.Models;

namespace EduKids.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ChildProfile> ChildProfiles { get; set; }
        public DbSet<GameGuide> GameGuides { get; set; }
        public DbSet<Comment> Comments { get; set; }

        // Yeni eklenen ChildProgress tablosu
        public DbSet<ChildProgress> ProgressRecords { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Relationships
            modelBuilder.Entity<GameGuide>()
                .HasOne(g => g.Expert)
                .WithMany(u => u.WrittenGuides)
                .HasForeignKey(g => g.ExpertId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ChildProfile>()
                .HasOne(c => c.Parent)
                .WithMany(u => u.Children)
                .HasForeignKey(c => c.ParentId);
        }
    }
}