using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduKids.Models
{
    // Enums for strict typing
    public enum UserRole { Admin, Expert, Parent }
    public enum AgeGroup { Age_0_3, Age_3_6, Age_6_12 }
    public enum Category { Bilişsel, Dil, Motor, Zeka }
    public enum SubscriptionType { Monthly, Quarterly, Yearly }

    public class User
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public bool IsActive { get; set; } = true; // For Expert approval logic

        // Navigation Properties
        public ICollection<ChildProfile>? Children { get; set; }
        public ICollection<GameGuide>? WrittenGuides { get; set; } // If Expert
    }

    public class Product
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        public int Stock { get; set; }

        public AgeGroup AgeGroup { get; set; }
        public Category Category { get; set; }

        public ICollection<GameGuide>? GameGuides { get; set; }
        public ICollection<Comment>? Comments { get; set; }
    }

    public class ChildProfile
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("User")]
        public int ParentId { get; set; }
        public User Parent { get; set; } = null!;

        public string Name { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Interests { get; set; } = string.Empty;

        // İsim çakışmasını önlemek için 'ChildProgress' olarak güncellendi
        public ICollection<ChildProgress>? ProgressRecords { get; set; }
    }

    // Yeni Eklenen Sınıf (İsim çakışmasını önlemek için ismi değiştirildi)
    public class ChildProgress
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("ChildProfile")]
        public int ChildId { get; set; }

        public int CompletedSetId { get; set; } // Tamamlanan ürün/set ID'si
        public string BadgeEarned { get; set; } = string.Empty;
    }

    public class GameGuide
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Product")]
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;

        [ForeignKey("User")]
        public int ExpertId { get; set; }
        public User Expert { get; set; } = null!;

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
}