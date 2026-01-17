using Microsoft.AspNetCore.Identity;
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
        private readonly IEmailService _emailService;
        private readonly UserManager<ApplicationUser> _userManager;

        public NotificationService(
            ApplicationDbContext context, 
            IEmailService emailService,
            UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _emailService = emailService;
            _userManager = userManager;
        }

        public async System.Threading.Tasks.Task CreateNotificationAsync(string userId, string title, string? message, NotificationType type, int? taskId = null, int? projectId = null)
        {
            // 1. Bildirimi veritabanına kaydet
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

            // 2. E-posta gönderimi (arka planda hata alsa bile bildirim kaydı kalsın diye try-catch)
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user != null && !string.IsNullOrEmpty(user.Email))
                {
                    // Görev veya Proje detaylarını çekerek daha zengin bir email gönderilebilir
                    // Şimdilik basitçe başlık ve mesajı gönderiyoruz
                    string subject = $"TaskFlow Bildirimi: {title}";
                    string body = $@"
                        <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;'>
                            <h2 style='color: #6366f1; margin-bottom: 20px;'>{title}</h2>
                            <p style='color: #1e293b; font-size: 16px; line-height: 1.6;'>{message}</p>
                            <hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;'>
                            <p style='color: #64748b; font-size: 14px;'>Bu bir otomatik bildirimdir, lütfen cevaplamayınız.</p>
                            <a href='http://localhost:3000' style='display: inline-block; background-color: #6366f1; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;'>Sisteme Git</a>
                        </div>";

                    await _emailService.SendEmailAsync(user.Email, subject, body);
                }
            }
            catch (Exception ex)
            {
                // Email gönderim hatası bildirimin oluşmasını engellememeli
                Console.WriteLine($"E-posta gönderimi sırasında hata oluştu: {ex.Message}");
            }
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
