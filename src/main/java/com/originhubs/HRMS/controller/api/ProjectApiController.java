package com.originhubs.HRMS.controller.api;

import com.originhubs.HRMS.model.Project;
import com.originhubs.HRMS.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8081"}, allowCredentials = "true")
public class ProjectApiController {

    private static final Logger logger = LoggerFactory.getLogger(ProjectApiController.class);
    
    private final ProjectService projectService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<List<Project>> getAllProjects(@RequestParam(required = false) String search) {
        try {
            List<Project> projects;
            if (search != null && !search.isEmpty()) {
                projects = projectService.searchProjects(search);
            } else {
                projects = projectService.getAllProjects();
            }
            logger.info("Retrieved {} projects", projects.size());
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            logger.error("Error retrieving projects", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<Project> getProject(@PathVariable Long id) {
        try {
            Optional<Project> project = projectService.getProjectById(id);
            if (project.isPresent()) {
                return ResponseEntity.ok(project.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error retrieving project with id: " + id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<List<Project>> getProjectsByEmployee(@PathVariable Long employeeId) {
        try {
            List<Project> projects = projectService.getProjectsByEmployeeId(employeeId);
            logger.info("Retrieved {} projects for employee {}", projects.size(), employeeId);
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            logger.error("Error retrieving projects for employee: " + employeeId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Project> createProject(@RequestBody Project project, Authentication authentication) {
        try {
            // Set the creator
            project.setCreatedBy(authentication.getName());
            
            Project savedProject = projectService.createProject(project);
            logger.info("Created project with id: {}", savedProject.getId());
            return ResponseEntity.ok(savedProject);
        } catch (Exception e) {
            logger.error("Error creating project", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project project) {
        try {
            Project updatedProject = projectService.updateProject(id, project);
            logger.info("Updated project with id: {}", id);
            return ResponseEntity.ok(updatedProject);
        } catch (Exception e) {
            logger.error("Error updating project with id: " + id, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        try {
            projectService.deleteProject(id);
            logger.info("Deleted project with id: {}", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting project with id: " + id, e);
            return ResponseEntity.badRequest().build();
        }
    }
}