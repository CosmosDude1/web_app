using System.ComponentModel.DataAnnotations;

namespace TaskManagementAPI.Models
{
    public class Attachment
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(500)]
        public string FileName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(1000)]
        public string FilePath { get; set; } = string.Empty;
        
        public long FileSize { get; set; }
        
        [StringLength(100)]
        public string? ContentType { get; set; }
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        
        // Foreign keys
        [Required]
        public int TaskId { get; set; }
        
        [Required]
        public string UploadedByUserId { get; set; } = string.Empty;
        
        // Navigation properties
        public Task Task { get; set; } = null!;
        public ApplicationUser UploadedByUser { get; set; } = null!;
    }
}

