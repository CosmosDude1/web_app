using Microsoft.EntityFrameworkCore;
using TaskManagementAPI.Data;
using TaskManagementAPI.Models;

namespace TaskManagementAPI.Services
{
    public interface INotificationService
    {
        System.Threading.Tasks.Task CreateNotificationAsync(string userId, string title, string? message, NotificationType type, int? taskId = null, int? projectId = null);
        System.Threading.Tasks.Task MarkAsReadAsync(int notificationId);
        System.Threading.Tasks.Task<IEnumerable<Notification>> GetUserNotificationsAsync(string userId);
    }

    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;

        public NotificationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async System.Threading.Tasks.Task CreateNotificationAsync(string userId, string title, string? message, NotificationType type, int? taskId = null, int? projectId = null)
        {
            var notification = new Notification
            {
                UserId = userId,
                Title = title,
                Message = message,
                Type = type,
                TaskId = taskId,
                ProjectId = projectId,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }

        public async System.Threading.Tasks.Task MarkAsReadAsync(int notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification != null)
            {
                notification.IsRead = true;
                await _context.SaveChangesAsync();
            }
        }

        public async System.Threading.Tasks.Task<IEnumerable<Notification>> GetUserNotificationsAsync(string userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }
    }
}

