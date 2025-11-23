using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManagementAPI.Models
{
    public class Task
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [StringLength(2000)]
        public string? Description { get; set; }
        
        public DateTime StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        
        public TaskStatus Status { get; set; } = TaskStatus.ToDo;
        
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Foreign keys
        [Required]
        public int ProjectId { get; set; }
        
        [Required]
        public string CreatedByUserId { get; set; } = string.Empty;
        
        // Navigation properties
        public Project Project { get; set; } = null!;
        public ApplicationUser CreatedByUser { get; set; } = null!;
        public ICollection<TaskAssignment> Assignments { get; set; } = new List<TaskAssignment>();
        public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
    }
    
    public enum TaskStatus
    {
        ToDo = 0,
        InProgress = 1,
        InReview = 2,
        Completed = 3,
        Cancelled = 4
    }
    
    public enum TaskPriority
    {
        Low = 0,
        Medium = 1,
        High = 2,
        Critical = 3
    }
}

