using System.ComponentModel.DataAnnotations;

namespace TaskManagementAPI.Models
{
    public class Notification
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [StringLength(1000)]
        public string? Message { get; set; }
        
        public NotificationType Type { get; set; }
        
        public bool IsRead { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Foreign keys
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        public int? TaskId { get; set; }
        public int? ProjectId { get; set; }
        
        // Navigation properties
        public ApplicationUser User { get; set; } = null!;
        public Task? Task { get; set; }
        public Project? Project { get; set; }
    }
    
    public enum NotificationType
    {
        TaskAssigned = 0,
        TaskUpdated = 1,
        TaskCompleted = 2,
        ProjectUpdated = 3,
        CommentAdded = 4,
        Other = 5
    }
}

