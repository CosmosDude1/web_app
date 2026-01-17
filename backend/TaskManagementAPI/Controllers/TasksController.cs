using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagementAPI.Data;
using TaskManagementAPI.DTOs;
using TaskManagementAPI.Models;
using TaskManagementAPI.Services;

namespace TaskManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly INotificationService _notificationService;
        private readonly IActivityLogService _activityLogService;

        public TasksController(
            ApplicationDbContext context, 
            UserManager<ApplicationUser> userManager,
            INotificationService notificationService,
            IActivityLogService activityLogService)
        {
            _context = context;
            _userManager = userManager;
            _notificationService = notificationService;
            _activityLogService = activityLogService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetTasks()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var user = userId != null ? await _userManager.FindByIdAsync(userId) : null;
            var userRoles = user != null ? await _userManager.GetRolesAsync(user) : new List<string>();
            var isAdmin = userRoles.Contains("Admin");
            var isManager = userRoles.Contains("Yönetici");

            IQueryable<Models.Task> query = _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.CreatedByUser)
                .Include(t => t.Assignments)
                    .ThenInclude(a => a.AssignedToUser);

            // User role can only see tasks assigned to them
            if (!isAdmin && !isManager)
            {
                query = query.Where(t => t.Assignments.Any(a => a.AssignedToUserId == userId));
            }

            var tasks = await query
                .Select(t => new TaskDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    StartDate = t.StartDate,
                    DueDate = t.DueDate,
                    Status = t.Status,
                    Priority = t.Priority,
                    ProjectId = t.ProjectId,
                    ProjectName = t.Project.Name,
                    CreatedByUserName = $"{t.CreatedByUser.FirstName} {t.CreatedByUser.LastName}",
                    AssignedToUserNames = t.Assignments.Select(a => $"{a.AssignedToUser.FirstName} {a.AssignedToUser.LastName}").ToList(),
                    AssignedToUserIds = t.Assignments.Select(a => a.AssignedToUserId).ToList()
                })
                .ToListAsync();

            return Ok(tasks);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskDto>> GetTask(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var user = userId != null ? await _userManager.FindByIdAsync(userId) : null;
            var userRoles = user != null ? await _userManager.GetRolesAsync(user) : new List<string>();
            var isAdmin = userRoles.Contains("Admin");
            var isManager = userRoles.Contains("Yönetici");

            var task = await _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.CreatedByUser)
                .Include(t => t.Assignments)
                    .ThenInclude(a => a.AssignedToUser)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound();
            }

            // User role can only see tasks assigned to them
            if (!isAdmin && !isManager && !task.Assignments.Any(a => a.AssignedToUserId == userId))
            {
                return Forbid("You can only view tasks assigned to you");
            }

            var taskDto = new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                StartDate = task.StartDate,
                DueDate = task.DueDate,
                Status = task.Status,
                Priority = task.Priority,
                ProjectId = task.ProjectId,
                ProjectName = task.Project.Name,
                CreatedByUserName = $"{task.CreatedByUser.FirstName} {task.CreatedByUser.LastName}",
                AssignedToUserNames = task.Assignments.Select(a => $"{a.AssignedToUser.FirstName} {a.AssignedToUser.LastName}").ToList(),
                AssignedToUserIds = task.Assignments.Select(a => a.AssignedToUserId).ToList()
            };

            return Ok(taskDto);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Yönetici")]
        public async Task<ActionResult<TaskDto>> CreateTask([FromBody] CreateTaskDto dto)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var task = new Models.Task
            {
                Title = dto.Title,
                Description = dto.Description,
                StartDate = dto.StartDate,
                DueDate = dto.DueDate,
                Priority = dto.Priority,
                Status = Models.TaskStatus.ToDo,
                ProjectId = dto.ProjectId,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            // Assign users
            if (dto.AssignedToUserIds != null && dto.AssignedToUserIds.Any())
            {
                foreach (var assignedUserId in dto.AssignedToUserIds)
                {
                    var assignment = new TaskAssignment
                    {
                        TaskId = task.Id,
                        AssignedToUserId = assignedUserId,
                        AssignedAt = DateTime.UtcNow
                    };
                    _context.TaskAssignments.Add(assignment);
                }

                await _context.SaveChangesAsync();
            }

            // Create activity log
            try
            {
                await _activityLogService.CreateActivityLogAsync(
                    userId,
                    "Created",
                    $"Görev oluşturuldu: {task.Title}",
                    ActivityType.Task,
                    taskId: task.Id,
                    projectId: task.ProjectId
                );
            }
            catch (Exception ex)
            {
                // Log error but don't fail the request
                Console.WriteLine($"Error creating activity log: {ex.Message}");
            }

            // Create notifications for assigned users
            if (dto.AssignedToUserIds != null && dto.AssignedToUserIds.Any())
            {
                try
                {
                    var creator = await _userManager.FindByIdAsync(userId);
                    var creatorName = creator != null ? $"{creator.FirstName} {creator.LastName}" : "Bir kullanıcı";
                    
                    foreach (var assignedUserId in dto.AssignedToUserIds)
                    {
                        try
                        {
                            await _notificationService.CreateNotificationAsync(
                                assignedUserId,
                                "Yeni Görev Atandı",
                                $"{creatorName} size '{task.Title}' adlı görevi atadı.",
                                NotificationType.TaskAssigned,
                                taskId: task.Id,
                                projectId: task.ProjectId
                            );
                        }
                        catch (Exception ex)
                        {
                            // Log error but continue with other notifications
                            Console.WriteLine($"Error creating notification for user {assignedUserId}: {ex.Message}");
                        }
                    }
                }
                catch (Exception ex)
                {
                    // Log error but don't fail the request
                    Console.WriteLine($"Error creating notifications: {ex.Message}");
                }
            }

            var createdTask = await _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.CreatedByUser)
                .Include(t => t.Assignments)
                    .ThenInclude(a => a.AssignedToUser)
                .FirstOrDefaultAsync(t => t.Id == task.Id);

            var taskDto = new TaskDto
            {
                Id = createdTask!.Id,
                Title = createdTask.Title,
                Description = createdTask.Description,
                StartDate = createdTask.StartDate,
                DueDate = createdTask.DueDate,
                Status = createdTask.Status,
                Priority = createdTask.Priority,
                ProjectId = createdTask.ProjectId,
                ProjectName = createdTask.Project.Name,
                CreatedByUserName = $"{createdTask.CreatedByUser.FirstName} {createdTask.CreatedByUser.LastName}",
                AssignedToUserNames = createdTask.Assignments.Select(a => $"{a.AssignedToUser.FirstName} {a.AssignedToUser.LastName}").ToList(),
                AssignedToUserIds = createdTask.Assignments.Select(a => a.AssignedToUserId).ToList()
            };

            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, taskDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto dto)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var user = userId != null ? await _userManager.FindByIdAsync(userId) : null;
            var userRoles = user != null ? await _userManager.GetRolesAsync(user) : new List<string>();
            var isAdmin = userRoles.Contains("Admin");
            var isManager = userRoles.Contains("Yönetici");

            var task = await _context.Tasks
                .Include(t => t.Assignments)
                .FirstOrDefaultAsync(t => t.Id == id);
            
            if (task == null)
            {
                return NotFound();
            }

            // User can only update status of tasks assigned to them
            // Admin and Manager can update everything
            if (!isAdmin && !isManager)
            {
                if (!task.Assignments.Any(a => a.AssignedToUserId == userId))
                {
                    return Forbid("You can only update tasks assigned to you");
                }
                
                // User can only update status, not other fields
                var oldStatusForUser = task.Status;
                task.Status = dto.Status;
                task.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Create activity log
                if (userId != null)
                {
                    await _activityLogService.CreateActivityLogAsync(
                        userId,
                        "StatusChanged",
                        $"Görev durumu değiştirildi: {oldStatusForUser} → {dto.Status}",
                        ActivityType.Task,
                        taskId: task.Id,
                        projectId: task.ProjectId
                    );
                }

                // Create notification if status changed to Completed
                if (oldStatusForUser != dto.Status && dto.Status == Models.TaskStatus.Completed)
                {
                    var allUsersToNotify = task.Assignments.Select(a => a.AssignedToUserId).ToList();
                    if (task.CreatedByUserId != userId && !allUsersToNotify.Contains(task.CreatedByUserId))
                    {
                        allUsersToNotify.Add(task.CreatedByUserId);
                    }

                    var updaterUser = await _userManager.FindByIdAsync(userId);
                    var updaterUserName = updaterUser != null ? $"{updaterUser.FirstName} {updaterUser.LastName}" : "Bir kullanıcı";

                    foreach (var notifyUserId in allUsersToNotify)
                    {
                        await _notificationService.CreateNotificationAsync(
                            notifyUserId,
                            "Görev Tamamlandı",
                            $"{updaterUserName} '{task.Title}' adlı görevi tamamladı.",
                            NotificationType.TaskCompleted,
                            taskId: task.Id,
                            projectId: task.ProjectId
                        );
                    }
                }

                return NoContent();
            }

            // Admin and Manager can update everything including assignments
            var oldStatus = task.Status;
            var oldAssignedUserIds = task.Assignments.Select(a => a.AssignedToUserId).ToList();

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.StartDate = dto.StartDate;
            task.DueDate = dto.DueDate;
            task.Status = dto.Status;
            task.Priority = dto.Priority;
            task.UpdatedAt = DateTime.UtcNow;

            // Update user assignments (only Admin and Manager can do this)
            var existingAssignments = task.Assignments.ToList();
            _context.TaskAssignments.RemoveRange(existingAssignments);

            foreach (var assignedUserId in dto.AssignedToUserIds)
            {
                var assignment = new TaskAssignment
                {
                    TaskId = task.Id,
                    AssignedToUserId = assignedUserId,
                    AssignedAt = DateTime.UtcNow
                };
                _context.TaskAssignments.Add(assignment);
            }

            await _context.SaveChangesAsync();

            // Create activity log
            if (userId != null)
            {
                var statusChanged = oldStatus != dto.Status;
                var action = statusChanged ? "StatusChanged" : "Updated";
                var description = statusChanged 
                    ? $"Görev durumu değiştirildi: {oldStatus} → {dto.Status}" 
                    : $"Görev güncellendi: {task.Title}";
                
                await _activityLogService.CreateActivityLogAsync(
                    userId,
                    action,
                    description,
                    ActivityType.Task,
                    taskId: task.Id,
                    projectId: task.ProjectId
                );
            }

            // Create notifications
            var updater = await _userManager.FindByIdAsync(userId);
            var updaterName = updater != null ? $"{updater.FirstName} {updater.LastName}" : "Bir kullanıcı";

            // Notify about status change (especially if completed)
            if (oldStatus != dto.Status)
            {
                if (dto.Status == Models.TaskStatus.Completed)
                {
                    // Notify all assigned users and creator
                    var allUsersToNotify = dto.AssignedToUserIds.ToList();
                    if (task.CreatedByUserId != userId && !allUsersToNotify.Contains(task.CreatedByUserId))
                    {
                        allUsersToNotify.Add(task.CreatedByUserId);
                    }

                    foreach (var notifyUserId in allUsersToNotify)
                    {
                        await _notificationService.CreateNotificationAsync(
                            notifyUserId,
                            "Görev Tamamlandı",
                            $"'{task.Title}' adlı görev tamamlandı.",
                            NotificationType.TaskCompleted,
                            taskId: task.Id,
                            projectId: task.ProjectId
                        );
                    }
                }
                else
                {
                    // Notify assigned users about status update
                    foreach (var assignedUserId in dto.AssignedToUserIds)
                    {
                        await _notificationService.CreateNotificationAsync(
                            assignedUserId,
                            "Görev Güncellendi",
                            $"{updaterName} '{task.Title}' adlı görevin durumunu güncelledi.",
                            NotificationType.TaskUpdated,
                            taskId: task.Id,
                            projectId: task.ProjectId
                        );
                    }
                }
            }
            else
            {
                // Task updated (but status didn't change)
                foreach (var assignedUserId in dto.AssignedToUserIds)
                {
                    await _notificationService.CreateNotificationAsync(
                        assignedUserId,
                        "Görev Güncellendi",
                        $"{updaterName} '{task.Title}' adlı görevi güncelledi.",
                        NotificationType.TaskUpdated,
                        taskId: task.Id,
                        projectId: task.ProjectId
                    );
                }
            }

            // Notify newly assigned users
            var newAssignedUserIds = dto.AssignedToUserIds.Except(oldAssignedUserIds).ToList();
            foreach (var newUserId in newAssignedUserIds)
            {
                await _notificationService.CreateNotificationAsync(
                    newUserId,
                    "Yeni Görev Atandı",
                    $"{updaterName} size '{task.Title}' adlı görevi atadı.",
                    NotificationType.TaskAssigned,
                    taskId: task.Id,
                    projectId: task.ProjectId
                );
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var task = await _context.Tasks
                .Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == id);
            
            if (task == null)
            {
                return NotFound();
            }

            var taskTitle = task.Title;
            var projectId = task.ProjectId;

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            // Create activity log
            if (userId != null)
            {
                await _activityLogService.CreateActivityLogAsync(
                    userId,
                    "Deleted",
                    $"Görev silindi: {taskTitle}",
                    ActivityType.Task,
                    projectId: projectId
                );
            }

            return NoContent();
        }
    }
}

