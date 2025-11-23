using System.ComponentModel.DataAnnotations;

namespace TaskManagementAPI.Models
{
    public class Project
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(1000)]
        public string? Description { get; set; }
        
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        
        public ProjectStatus Status { get; set; } = ProjectStatus.NotStarted;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Foreign keys
        [Required]
        public string CreatedByUserId { get; set; } = string.Empty;
        
        // Navigation properties
        public ApplicationUser CreatedByUser { get; set; } = null!;
        public ICollection<Task> Tasks { get; set; } = new List<Task>();
    }
    
    public enum ProjectStatus
    {
        NotStarted = 0,
        InProgress = 1,
        Completed = 2,
        OnHold = 3,
        Cancelled = 4
    }
}

