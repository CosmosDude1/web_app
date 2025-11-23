using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using TaskManagementAPI.Models;

namespace TaskManagementAPI.Services
{
    public interface IEmailService
    {
        System.Threading.Tasks.Task SendEmailAsync(string to, string subject, string body);
        System.Threading.Tasks.Task SendTaskNotificationAsync(ApplicationUser user, Models.Task task, NotificationType type);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async System.Threading.Tasks.Task SendEmailAsync(string to, string subject, string body)
        {
            var emailSettings = _configuration.GetSection("EmailSettings");
            var smtpServer = emailSettings["SmtpServer"];
            var smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");
            var senderEmail = emailSettings["SenderEmail"];
            var senderName = emailSettings["SenderName"];
            var username = emailSettings["Username"];
            var password = emailSettings["Password"];

            if (string.IsNullOrEmpty(smtpServer) || string.IsNullOrEmpty(senderEmail))
            {
                // Email not configured, skip sending
                return;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(senderName, senderEmail));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = body };

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync(smtpServer, smtpPort, SecureSocketOptions.StartTls);
                if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
                {
                    await client.AuthenticateAsync(username, password);
                }
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
        }

        public async System.Threading.Tasks.Task SendTaskNotificationAsync(ApplicationUser user, Models.Task task, NotificationType type)
        {
            var subject = type switch
            {
                NotificationType.TaskAssigned => $"New Task Assigned: {task.Title}",
                NotificationType.TaskUpdated => $"Task Updated: {task.Title}",
                NotificationType.TaskCompleted => $"Task Completed: {task.Title}",
                _ => $"Task Notification: {task.Title}"
            };

            var body = type switch
            {
                NotificationType.TaskAssigned => $"<h2>New Task Assigned</h2><p>You have been assigned a new task: <strong>{task.Title}</strong></p>",
                NotificationType.TaskUpdated => $"<h2>Task Updated</h2><p>The task <strong>{task.Title}</strong> has been updated.</p>",
                NotificationType.TaskCompleted => $"<h2>Task Completed</h2><p>The task <strong>{task.Title}</strong> has been completed.</p>",
                _ => $"<h2>Task Notification</h2><p>You have a notification regarding task: <strong>{task.Title}</strong></p>"
            };

            await SendEmailAsync(user.Email!, subject, body);
        }
    }
}

