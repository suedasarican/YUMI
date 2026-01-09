using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema; // [NotMapped] için gerekli

namespace EduKids.Models
{
    public class BlogPost
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Category { get; set; } = "Genel";
        public string ImageUrl { get; set; } = string.Empty;

        // Enum yerine string tutabiliriz veya int (Frontend 'published' gönderiyor string olarak)
        public string Status { get; set; } = "draft";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int Views { get; set; } = 0;

        // YAZAR İLİŞKİSİ
        public int AuthorId { get; set; }
        public User? Author { get; set; } // ? işareti koyduk ki veri gelirken boş olabilir

        // ÜRÜN İLİŞKİSİ (Hata buradaydı muhtemelen)
        // Frontend'den gelen [1, 2, 3] gibi listeyi karşılamak için:
        [NotMapped]
        public List<int> RelatedProductIds { get; set; } = new List<int>();
    }
}