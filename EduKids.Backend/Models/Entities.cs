using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace EduKids.Models
{
    // --- ENUMLAR ---
    public enum UserRole { Admin = 0, Expert = 1, Parent = 2 }
    public enum AgeGroup { Age_0_3, Age_3_6, Age_6_12 }
    public enum Category { Bilişsel, Dil, Motor, Zeka }
    public enum AppointmentStatus { Pending, Approved, Rejected, Completed }
    public enum BlogPostStatus { Draft, Published }

    // --- KULLANICI (USER) ---
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public bool IsActive { get; set; } = true;

        // Uzmanlar için Yeni Alanlar
        public string? Title { get; set; }
        public string? Bio { get; set; }
        public string? ImageUrl { get; set; }

        // İlişkiler (Hem Eski Hem Yeni)
        public ICollection<ChildProfile>? Children { get; set; } // ESKİ
        public ICollection<GameGuide>? WrittenGuides { get; set; } // ESKİ (Expert ise)

        // Yeni İlişkiler
        [JsonIgnore]
        public ICollection<Appointment>? AppointmentsAsExpert { get; set; }
        [JsonIgnore]
        public ICollection<Appointment>? AppointmentsAsParent { get; set; }
        public ICollection<BlogPost>? BlogPosts { get; set; }

        // --- GÜNCELLENEN KISIM: MESAJ LİSTELERİ ---
        [JsonIgnore] // Döngüsel hatayı önlemek için
        public ICollection<Message>? SentMessages { get; set; }
        [JsonIgnore]
        public ICollection<Message>? ReceivedMessages { get; set; }
    }

    // --- ÜRÜN (PRODUCT) ---
    public class Product
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsExpertApproved { get; set; } = false; // Yeni

        public AgeGroup AgeGroup { get; set; }
        public Category Category { get; set; }

        // İlişkiler
        public ICollection<GameGuide>? GameGuides { get; set; } // ESKİ
        public ICollection<Comment>? Comments { get; set; } // ESKİ
    }

    // --- ESKİ SINIFLAR (GERİ GETİRİLDİ) ---

    public class ChildProfile
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("User")]
        public int ParentId { get; set; }
        [JsonIgnore]
        public User? Parent { get; set; }

        public string Name { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Interests { get; set; } = string.Empty;

        public ICollection<ChildProgress>? ProgressRecords { get; set; }
    }

    public class ChildProgress
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("ChildProfile")]
        public int ChildId { get; set; }

        public int CompletedSetId { get; set; }
        public string BadgeEarned { get; set; } = string.Empty;
    }

    public class GameGuide
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Product")]
        public int ProductId { get; set; }
        [JsonIgnore]
        public Product? Product { get; set; }

        [ForeignKey("User")]
        public int ExpertId { get; set; }
        [JsonIgnore]
        public User? Expert { get; set; }

        public string Content { get; set; } = string.Empty;
    }

    public class Comment
    {
        [Key]
        public int Id { get; set; }

        public int ProductId { get; set; }
        public int UserId { get; set; }
        public string Text { get; set; } = string.Empty;
        public int Rating { get; set; } // 1-5

        public string? ExpertReply { get; set; }
        public int? RepliedByExpertId { get; set; }
    }

    // --- YENİ SINIFLAR (RANDEVU SİSTEMİ) ---

    public class Appointment
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Expert")]
        public int ExpertId { get; set; }
        [JsonIgnore] // Döngüsel hatayı önlemek için
        public User? Expert { get; set; }

        [ForeignKey("Parent")]
        public int ParentId { get; set; }
        [JsonIgnore]
        public User? Parent { get; set; }

        public DateTime Date { get; set; }
        public string Time { get; set; } = string.Empty;

        public string ChildName { get; set; } = string.Empty;
        public int ChildAge { get; set; }
        public string Topic { get; set; } = string.Empty;

        public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;
    }

    public class ExpertAvailability
    {
        [Key]
        public int Id { get; set; }
        public int ExpertId { get; set; }
        public DateTime AvailableDate { get; set; }
        public string AvailableTime { get; set; } = string.Empty;
    }

    // --- GÜNCELLENEN KISIM: MESSAGE SINIFI ---
    public class Message
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Sender")]
        public int SenderId { get; set; }
        [JsonIgnore]
        public User? Sender { get; set; } // Navigation Property

        [ForeignKey("Receiver")]
        public int ReceiverId { get; set; }
        [JsonIgnore]
        public User? Receiver { get; set; } // Navigation Property

        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;
    }

    public class ExpertQuestion
    {
        [Key]
        public int Id { get; set; }
        public int ParentId { get; set; }
        public string ParentName { get; set; } = string.Empty;
        public string QuestionText { get; set; } = string.Empty;
        public string? ProductName { get; set; }

        public string? AnswerText { get; set; }
        public int? AnsweredByExpertId { get; set; }
        public DateTime AskedAt { get; set; } = DateTime.UtcNow;
    }
}