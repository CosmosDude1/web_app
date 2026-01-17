using TaskManagementAPI.Models;

namespace TaskManagementAPI.DTOs
{
    public class ActivityLogDto
    {
        public int Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string? Description { get; set; }
        public ActivityType Type { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int? TaskId { get; set; }
        public int? ProjectId { get; set; }
    }
}

