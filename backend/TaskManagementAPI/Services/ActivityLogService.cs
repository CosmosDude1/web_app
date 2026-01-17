using Microsoft.EntityFrameworkCore;
using TaskManagementAPI.Data;
using TaskManagementAPI.Models;

namespace TaskManagementAPI.Services
{
    public interface IActivityLogService
    {
        System.Threading.Tasks.Task CreateActivityLogAsync(
            string userId, 
            string action, 
            string? description, 
            ActivityType type, 
            int? taskId = null, 
            int? projectId = null);
        System.Threading.Tasks.Task<IEnumerable<ActivityLog>> GetActivityLogsAsync(int? taskId = null, int? projectId = null, int? limit = null);
    }

    public class ActivityLogService : IActivityLogService
    {
        private readonly ApplicationDbContext _context;

        public ActivityLogService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async System.Threading.Tasks.Task CreateActivityLogAsync(
            string userId, 
            string action, 
            string? description, 
            ActivityType type, 
            int? taskId = null, 
            int? projectId = null)
        {
            var activityLog = new ActivityLog
            {
                UserId = userId,
                Action = action,
                Description = description,
                Type = type,
                TaskId = taskId,
                ProjectId = projectId,
                CreatedAt = DateTime.UtcNow
            };

            _context.ActivityLogs.Add(activityLog);
            await _context.SaveChangesAsync();
        }

        public async System.Threading.Tasks.Task<IEnumerable<ActivityLog>> GetActivityLogsAsync(int? taskId = null, int? projectId = null, int? limit = null)
        {
            var query = _context.ActivityLogs
                .Include(a => a.User)
                .Include(a => a.Task)
                .Include(a => a.Project)
                .AsQueryable();

            if (taskId.HasValue)
            {
                query = query.Where(a => a.TaskId == taskId);
            }

            if (projectId.HasValue)
            {
                query = query.Where(a => a.ProjectId == projectId);
            }

            query = query.OrderByDescending(a => a.CreatedAt);

            if (limit.HasValue)
            {
                query = query.Take(limit.Value);
            }

            return await query.ToListAsync();
        }
    }
}

