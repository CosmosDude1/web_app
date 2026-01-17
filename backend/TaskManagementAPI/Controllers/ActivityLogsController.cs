using Microsoft.AspNetCore.Authorization;
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
    public class ActivityLogsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ActivityLogsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("task/{taskId}")]
        public async Task<ActionResult<IEnumerable<ActivityLogDto>>> GetTaskActivityLogs(int taskId)
        {
            var logs = await _context.ActivityLogs
                .Where(a => a.TaskId == taskId)
                .Include(a => a.User)
                .OrderByDescending(a => a.CreatedAt)
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

            return Ok(logs);
        }

        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<IEnumerable<ActivityLogDto>>> GetProjectActivityLogs(int projectId)
        {
            var logs = await _context.ActivityLogs
                .Where(a => a.ProjectId == projectId)
                .Include(a => a.User)
                .OrderByDescending(a => a.CreatedAt)
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

            return Ok(logs);
        }

        [HttpGet("recent")]
        public async Task<ActionResult<IEnumerable<ActivityLogDto>>> GetRecentActivityLogs([FromQuery] int limit = 20)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var user = userId != null ? await _context.Users.FindAsync(userId) : null;
            
            if (user == null)
            {
                return Unauthorized();
            }

            // Get user's roles to determine what activities to show
            var userRoles = await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
                .ToListAsync();

            var isAdmin = userRoles.Contains("Admin");
            var isManager = userRoles.Contains("Yönetici");

            var query = _context.ActivityLogs
                .Include(a => a.User)
                .AsQueryable();

            // User role can only see activities related to their tasks
            if (!isAdmin && !isManager)
            {
                var userTaskIds = await _context.TaskAssignments
                    .Where(ta => ta.AssignedToUserId == userId)
                    .Select(ta => ta.TaskId)
                    .ToListAsync();

                query = query.Where(a => 
                    (a.TaskId.HasValue && userTaskIds.Contains(a.TaskId.Value)) ||
                    (a.UserId == userId)
                );
            }

            var logs = await query
                .OrderByDescending(a => a.CreatedAt)
                .Take(limit)
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

            return Ok(logs);
        }
    }
}

