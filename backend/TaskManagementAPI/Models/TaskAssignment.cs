using System.ComponentModel.DataAnnotations;

namespace TaskManagementAPI.Models
{
    public class TaskAssignment
    {
        public int Id { get; set; }
        
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        
        // Foreign keys
        [Required]
        public int TaskId { get; set; }
        
        [Required]
        public string AssignedToUserId { get; set; } = string.Empty;
        
        // Navigation properties
        public Task Task { get; set; } = null!;
        public ApplicationUser AssignedToUser { get; set; } = null!;
    }
}

