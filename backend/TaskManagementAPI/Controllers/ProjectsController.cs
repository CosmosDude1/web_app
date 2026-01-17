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
    public class ProjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IActivityLogService _activityLogService;

        public ProjectsController(
            ApplicationDbContext context, 
            UserManager<ApplicationUser> userManager,
            IActivityLogService activityLogService)
        {
            _context = context;
            _userManager = userManager;
            _activityLogService = activityLogService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectDto>>> GetProjects()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var user = userId != null ? await _userManager.FindByIdAsync(userId) : null;
            var userRoles = user != null ? await _userManager.GetRolesAsync(user) : new List<string>();
            var isAdmin = userRoles.Contains("Admin");
            var isManager = userRoles.Contains("Yönetici");

            IQueryable<Project> query = _context.Projects.Include(p => p.CreatedByUser);

            // User role can only see projects they created or are assigned to tasks in
            if (!isAdmin && !isManager)
            {
                // User can only see projects where they have tasks assigned
                var userTaskProjectIds = await _context.Tasks
                    .Include(t => t.Assignments)
                    .Where(t => t.Assignments.Any(a => a.AssignedToUserId == userId))
                    .Select(t => t.ProjectId)
                    .Distinct()
                    .ToListAsync();

                query = query.Where(p => p.CreatedByUserId == userId || userTaskProjectIds.Contains(p.Id));
            }

            var projects = await query
                .Select(p => new ProjectDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    Status = p.Status,
                    CreatedByUserName = $"{p.CreatedByUser.FirstName} {p.CreatedByUser.LastName}"
                })
                .ToListAsync();

            return Ok(projects);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectDto>> GetProject(int id)
        {
            var project = await _context.Projects
                .Include(p => p.CreatedByUser)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound();
            }

            var projectDto = new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                Status = project.Status,
                CreatedByUserName = $"{project.CreatedByUser.FirstName} {project.CreatedByUser.LastName}"
            };

            return Ok(projectDto);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Yönetici")]
        public async Task<ActionResult<ProjectDto>> CreateProject([FromBody] CreateProjectDto dto)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var project = new Project
            {
                Name = dto.Name,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = ProjectStatus.NotStarted,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            // Create activity log
            await _activityLogService.CreateActivityLogAsync(
                userId,
                "Created",
                $"Proje oluşturuldu: {project.Name}",
                ActivityType.Project,
                projectId: project.Id
            );

            var user = await _userManager.FindByIdAsync(userId);
            var projectDto = new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                Status = project.Status,
                CreatedByUserName = user != null ? $"{user.FirstName} {user.LastName}" : ""
            };

            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, projectDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Yönetici")]
        public async Task<IActionResult> UpdateProject(int id, [FromBody] UpdateProjectDto dto)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var user = userId != null ? await _userManager.FindByIdAsync(userId) : null;
            var userRoles = user != null ? await _userManager.GetRolesAsync(user) : new List<string>();
            var isAdmin = userRoles.Contains("Admin");

            var project = await _context.Projects.FindAsync(id);
            if (project == null)
            {
                return NotFound();
            }

            // Yönetici can only update their own projects, Admin can update any
            if (!isAdmin && project.CreatedByUserId != userId)
            {
                return Forbid("You can only update your own projects");
            }

            var oldStatus = project.Status;
            project.Name = dto.Name;
            project.Description = dto.Description;
            project.StartDate = dto.StartDate;
            project.EndDate = dto.EndDate;
            project.Status = dto.Status;
            project.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Create activity log
            var statusChanged = oldStatus != dto.Status;
            var action = statusChanged ? "StatusChanged" : "Updated";
            var description = statusChanged
                ? $"Proje durumu değiştirildi: {oldStatus} → {dto.Status}"
                : $"Proje güncellendi: {project.Name}";

            await _activityLogService.CreateActivityLogAsync(
                userId!,
                action,
                description,
                ActivityType.Project,
                projectId: project.Id
            );

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
            {
                return NotFound();
            }

            var projectName = project.Name;
            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            // Create activity log
            if (userId != null)
            {
                await _activityLogService.CreateActivityLogAsync(
                    userId,
                    "Deleted",
                    $"Proje silindi: {projectName}",
                    ActivityType.Project
                );
            }

            return NoContent();
        }
    }
}

