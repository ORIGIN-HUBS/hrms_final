package com.originhubs.HRMS.controller;

import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.model.Project;
import com.originhubs.HRMS.model.ProjectDocument;
import com.originhubs.HRMS.service.EmployeeService;
import com.originhubs.HRMS.service.ProjectDocumentService;
import com.originhubs.HRMS.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/project")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
public class ProjectController {

    private final ProjectService projectService;
    private final EmployeeService employeeService;
    private final ProjectDocumentService documentService;
    private final com.originhubs.HRMS.service.DashboardService dashboardService;

    @GetMapping("/list")
    public String listProjects(Model model, @RequestParam(required = false) String search) {
        List<Project> projects;
        if (search != null && !search.isEmpty()) {
            projects = projectService.searchProjects(search);
        } else {
            projects = projectService.getAllProjects();
        }
        
        // Add project statistics
        java.util.Map<String, Object> projectStats = dashboardService.getProjectStatistics();
        
        model.addAttribute("projects", projects);
        model.addAttribute("search", search);
        model.addAttribute("projectStats", projectStats);
        return "project/list";
    }

    @GetMapping("/add")
    public String showAddForm(Model model) {
        model.addAttribute("project", new Project());
        model.addAttribute("employees", employeeService.getAllEmployees());
        return "project/add";
    }

    @PostMapping("/add")
    public String addProject(@ModelAttribute Project project,
                           Authentication authentication,
                           RedirectAttributes redirectAttributes) {
        try {
            project.setCreatedBy(authentication.getName());
            projectService.createProject(project);
            redirectAttributes.addFlashAttribute("success", "Project added successfully");
            return "redirect:/project/list";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error adding project: " + e.getMessage());
            return "redirect:/project/add";
        }
    }

    @GetMapping("/view/{id}")
    public String viewProject(@PathVariable Long id, Model model) {
        Project project = projectService.getProjectById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        List<ProjectDocument> documents = documentService.getDocumentsByProjectId(id);

        model.addAttribute("project", project);
        model.addAttribute("documents", documents);
        return "project/view";
    }

    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id, Model model) {
        Project project = projectService.getProjectById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        model.addAttribute("project", project);
        model.addAttribute("employees", employeeService.getAllEmployees());
        return "project/edit";
    }

    @PostMapping("/edit/{id}")
    public String updateProject(@PathVariable Long id,
                              @ModelAttribute Project project,
                              RedirectAttributes redirectAttributes) {
        try {
            projectService.updateProject(id, project);
            redirectAttributes.addFlashAttribute("success", "Project updated successfully");
            return "redirect:/project/view/" + id;
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error updating project: " + e.getMessage());
            return "redirect:/project/edit/" + id;
        }
    }

    @PostMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteProject(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            projectService.deleteProject(id);
            redirectAttributes.addFlashAttribute("success", "Project deleted successfully");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error deleting project: " + e.getMessage());
        }
        return "redirect:/project/list";
    }

    @PostMapping("/{id}/documents/upload")
    public String uploadDocument(@PathVariable Long id,
                               @RequestParam("file") MultipartFile file,
                               @RequestParam("documentType") String documentType,
                               Authentication authentication,
                               RedirectAttributes redirectAttributes) {
        try {
            Project project = projectService.getProjectById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            ProjectDocument document = new ProjectDocument();
            document.setProject(project);
            document.setDocumentType(documentType);
            document.setUploadedBy(authentication.getName());

            documentService.uploadDocument(document, file);
            redirectAttributes.addFlashAttribute("success", "Document uploaded successfully");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error uploading document: " + e.getMessage());
        }
        return "redirect:/project/view/" + id;
    }
}

