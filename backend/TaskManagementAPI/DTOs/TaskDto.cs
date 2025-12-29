using TaskManagementAPI.Models;

namespace TaskManagementAPI.DTOs
{
    public class TaskDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public Models.TaskStatus Status { get; set; }
        public Models.TaskPriority Priority { get; set; }
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string CreatedByUserName { get; set; } = string.Empty;
        public List<string> AssignedToUserNames { get; set; } = new List<string>();
        public List<string> AssignedToUserIds { get; set; } = new List<string>();
    }

    public class CreateTaskDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public Models.TaskPriority Priority { get; set; } = TaskPriority.Medium;
        public int ProjectId { get; set; }
        public List<string> AssignedToUserIds { get; set; } = new List<string>();
    }

    public class UpdateTaskDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public Models.TaskStatus Status { get; set; }
        public Models.TaskPriority Priority { get; set; }
        public List<string> AssignedToUserIds { get; set; } = new List<string>();
    }
}

