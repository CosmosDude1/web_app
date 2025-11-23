using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagementAPI.Data;
using TaskManagementAPI.DTOs;

namespace TaskManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CalendarController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CalendarController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("tasks")]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetTasksByDateRange(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            var query = _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.CreatedByUser)
                .Include(t => t.Assignments)
                    .ThenInclude(a => a.AssignedToUser)
                .AsQueryable();

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
                    AssignedToUserNames = t.Assignments.Select(a => $"{a.AssignedToUser.FirstName} {a.AssignedToUser.LastName}").ToList()
                })
                .ToListAsync();

            return Ok(tasks);
        }
    }
}

