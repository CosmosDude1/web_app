using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagementAPI.Data;
using TaskManagementAPI.DTOs;
using TaskManagementAPI.Models;

namespace TaskManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public DashboardController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetStats()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var user = userId != null ? await _userManager.FindByIdAsync(userId) : null;
            var userRoles = user != null ? await _userManager.GetRolesAsync(user) : new List<string>();
            var isAdmin = userRoles.Contains("Admin");
            var isManager = userRoles.Contains("Yönetici");

            IQueryable<Project> projectsQuery = _context.Projects;
            IQueryable<Models.Task> tasksQuery = _context.Tasks;

            // User role can only see their own data
            if (!isAdmin && !isManager)
            {
                var userTaskIds = await _context.TaskAssignments
                    .Where(ta => ta.AssignedToUserId == userId)
                    .Select(ta => ta.TaskId)
                    .ToListAsync();

                var userProjectIds = await _context.Tasks
                    .Where(t => userTaskIds.Contains(t.Id))
                    .Select(t => t.ProjectId)
                    .Distinct()
                    .ToListAsync();

                projectsQuery = projectsQuery.Where(p => userProjectIds.Contains(p.Id) || p.CreatedByUserId == userId);
                tasksQuery = tasksQuery.Where(t => userTaskIds.Contains(t.Id));
            }

            var totalProjects = await projectsQuery.CountAsync();
            var totalTasks = await tasksQuery.CountAsync();
            var completedTasks = await tasksQuery.CountAsync(t => t.Status == Models.TaskStatus.Completed);
            var inProgressTasks = await tasksQuery.CountAsync(t => t.Status == Models.TaskStatus.InProgress);

            var projectStatusStats = await projectsQuery
                .GroupBy(p => p.Status)
                .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
                .ToListAsync();

            var taskStatusStats = await tasksQuery
                .GroupBy(t => t.Status)
                .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
                .ToListAsync();

            // Get upcoming tasks (due in next 7 days)
            var upcomingTasks = await tasksQuery
                .Where(t => t.DueDate.HasValue && 
                           t.DueDate.Value >= DateTime.UtcNow && 
                           t.DueDate.Value <= DateTime.UtcNow.AddDays(7) &&
                           t.Status != Models.TaskStatus.Completed)
                .Include(t => t.Project)
                .Include(t => t.Assignments)
                    .ThenInclude(a => a.AssignedToUser)
                .OrderBy(t => t.DueDate)
                .Take(10)
                .Select(t => new
                {
                    Id = t.Id,
                    Title = t.Title,
                    DueDate = t.DueDate,
                    Priority = t.Priority.ToString(),
                    ProjectName = t.Project.Name,
                    AssignedToUserNames = t.Assignments.Select(a => $"{a.AssignedToUser.FirstName} {a.AssignedToUser.LastName}").ToList()
                })
                .ToListAsync();

            // Get recent activities
            IQueryable<ActivityLog> activitiesQuery = _context.ActivityLogs.Include(a => a.User);

            // Filter activities for User role
            if (!isAdmin && !isManager)
            {
                var userTaskIdsForActivities = await _context.TaskAssignments
                    .Where(ta => ta.AssignedToUserId == userId)
                    .Select(ta => ta.TaskId)
                    .ToListAsync();

                activitiesQuery = activitiesQuery.Where(a => 
                    (a.TaskId.HasValue && userTaskIdsForActivities.Contains(a.TaskId.Value)) ||
                    (a.UserId == userId));
            }

            var recentActivities = await activitiesQuery
                .OrderByDescending(a => a.CreatedAt)
                .Take(10)
                .Select(a => new ActivityLogDto
                {
                    Id = a.Id,
                    Action = a.Action,
                    Description = a.Description,
                    Type = a.Type,
                    CreatedAt = a.CreatedAt,
                    UserName = $"{a.User.FirstName} {a.User.LastName}",
                    TaskId = a.TaskId,
                    ProjectId = a.ProjectId
                })
                .ToListAsync();

            return Ok(new
            {
                TotalProjects = totalProjects,
                TotalTasks = totalTasks,
                CompletedTasks = completedTasks,
                InProgressTasks = inProgressTasks,
                ProjectStatusStats = projectStatusStats,
                TaskStatusStats = taskStatusStats,
                UpcomingTasks = upcomingTasks,
                RecentActivities = recentActivities
            });
        }
    }
}

