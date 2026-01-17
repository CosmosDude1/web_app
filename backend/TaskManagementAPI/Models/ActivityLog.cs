using System.ComponentModel.DataAnnotations;

namespace TaskManagementAPI.Models
{
    public class ActivityLog
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Action { get; set; } = string.Empty; // Created, Updated, Deleted, StatusChanged, etc.
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        public ActivityType Type { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Foreign keys
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        public int? TaskId { get; set; }
        public int? ProjectId { get; set; }
        
        // Navigation properties
        public ApplicationUser User { get; set; } = null!;
        public Models.Task? Task { get; set; }
        public Project? Project { get; set; }
    }
    
    public enum ActivityType
    {
        Task = 0,
        Project = 1,
        User = 2,
        Other = 3
    }
}

