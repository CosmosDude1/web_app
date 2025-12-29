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
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public TasksController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetTasks()
        {
            var tasks = await _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.CreatedByUser)
                .Include(t => t.Assignments)
                    .ThenInclude(a => a.AssignedToUser)
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
            var task = await _context.Tasks
                .Include(t => t.Assignments)
                .FirstOrDefaultAsync(t => t.Id == id);
            
            if (task == null)
            {
                return NotFound();
            }

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.StartDate = dto.StartDate;
            task.DueDate = dto.DueDate;
            task.Status = dto.Status;
            task.Priority = dto.Priority;
            task.UpdatedAt = DateTime.UtcNow;

            // Update user assignments
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

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

