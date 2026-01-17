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
    public class CalendarController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public CalendarController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet("tasks")]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetTasksByDateRange(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var user = userId != null ? await _userManager.FindByIdAsync(userId) : null;
            var userRoles = user != null ? await _userManager.GetRolesAsync(user) : new List<string>();
            var isAdmin = userRoles.Contains("Admin");
            var isManager = userRoles.Contains("Yönetici");

            var query = _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.CreatedByUser)
                .Include(t => t.Assignments)
                    .ThenInclude(a => a.AssignedToUser)
                .AsQueryable();

            // User role can only see tasks assigned to them
            if (!isAdmin && !isManager)
            {
                query = query.Where(t => t.Assignments.Any(a => a.AssignedToUserId == userId));
            }

            if (startDate.HasValue)
            {
                query = query.Where(t => t.StartDate >= startDate.Value || (t.DueDate.HasValue && t.DueDate >= startDate.Value));
            }

            if (endDate.HasValue)
            {
                query = query.Where(t => t.StartDate <= endDate.Value || (t.DueDate.HasValue && t.DueDate <= endDate.Value));
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
    }
}

