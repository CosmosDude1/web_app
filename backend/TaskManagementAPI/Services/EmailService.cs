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
                Console.WriteLine("E-posta sunucusu yapılandırılmadığı için gönderim atlandı.");
                return;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(senderName, senderEmail));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;

            // Modern HTML wrapper for all emails
            var htmlBody = $@"
                <html>
                <body style='margin:0; padding:0; background-color:#f8fafc; font-family:sans-serif;'>
                    <table width='100%' border='0' cellspacing='0' cellpadding='0'>
                        <tr>
                            <td align='center' style='padding: 20px 0;'>
                                <table width='600' border='0' cellspacing='0' cellpadding='0' style='background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);'>
                                    <tr>
                                        <td style='background-color:#6366f1; padding:20px; text-align:center;'>
                                            <h1 style='color:#ffffff; margin:0; font-size:24px; letter-spacing:-1px;'>TaskFlow</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style='padding:40px;'>
                                            {body}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style='background-color:#f1f5f9; padding:20px; text-align:center; color:#64748b; font-size:12px;'>
                                            &copy; {DateTime.Now.Year} TaskFlow Proje Yönetim Sistemi. Tüm hakları saklıdır.
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>";

            message.Body = new TextPart("html") { Text = htmlBody };

            using (var client = new SmtpClient())
            {
                try
                {
                    await client.ConnectAsync(smtpServer, smtpPort, SecureSocketOptions.StartTls);
                    if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
                    {
                        await client.AuthenticateAsync(username, password);
                    }
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Smtp hatası: {ex.Message}");
                    throw;
                }
            }
        }

        public async System.Threading.Tasks.Task SendTaskNotificationAsync(ApplicationUser user, Models.Task task, NotificationType type)
        {
            var subject = type switch
            {
                NotificationType.TaskAssigned => $"Yeni Görev Atandı: {task.Title}",
                NotificationType.TaskUpdated => $"Görev Güncellendi: {task.Title}",
                NotificationType.TaskCompleted => $"Görev Tamamlandı: {task.Title}",
                _ => $"Görev Bildirimi: {task.Title}"
            };

            var body = type switch
            {
                NotificationType.TaskAssigned => $@"
                    <h2 style='color:#1e293b; margin-top:0;'>Yeni Bir Göreviniz Var!</h2>
                    <p style='color:#475569; font-size:16px;'>Size yeni bir görev atandı: <strong>{task.Title}</strong></p>
                    <div style='background-color:#f8fafc; padding:15px; border-radius:8px; margin:20px 0;'>
                        <p style='margin:0; font-size:14px; color:#64748b;'><strong>Proje:</strong> {task.Project?.Name ?? "Belirtilmemiş"}</p>
                        <p style='margin:5px 0 0; font-size:14px; color:#64748b;'><strong>Bitiş:</strong> {task.DueDate?.ToShortDateString() ?? "Yok"}</p>
                    </div>",
                NotificationType.TaskUpdated => $@"
                    <h2 style='color:#1e293b; margin-top:0;'>Görev Güncellendi</h2>
                    <p style='color:#475569; font-size:16px;'><strong>{task.Title}</strong> başlıklı görevde değişiklikler yapıldı.</p>",
                NotificationType.TaskCompleted => $@"
                    <h2 style='color:#1e293b; margin-top:0;'>Tebrikler!</h2>
                    <p style='color:#475569; font-size:16px;'><strong>{task.Title}</strong> görevi başarıyla tamamlandı.</p>",
                _ => $@"
                    <h2 style='color:#1e293b; margin-top:0;'>Bildirim</h2>
                    <p style='color:#475569; font-size:16px;'>Görevinizle ilgili bir güncelleme var: <strong>{task.Title}</strong></p>"
            };

            await SendEmailAsync(user.Email!, subject, body);
        }
    }
}
