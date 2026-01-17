using TaskManagementAPI.Models;

namespace TaskManagementAPI.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Message { get; set; }
        public NotificationType Type { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? TaskId { get; set; }
        public string? TaskTitle { get; set; }
        public int? ProjectId { get; set; }
        public string? ProjectName { get; set; }
    }
}

