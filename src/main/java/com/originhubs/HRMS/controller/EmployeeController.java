package com.originhubs.HRMS.controller;

import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.model.EmployeeDocument;
import com.originhubs.HRMS.model.User;
import com.originhubs.HRMS.service.DashboardService;
import com.originhubs.HRMS.service.EmployeeDocumentService;
import com.originhubs.HRMS.service.EmployeeService;
import com.originhubs.HRMS.service.UserService;
import com.originhubs.HRMS.validation.ValidationUtils;
import com.originhubs.HRMS.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/employee")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeDocumentService documentService;
    private final UserService userService;
    private final DashboardService dashboardService;

    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String listEmployees(Model model, @RequestParam(required = false) String search) {
        List<Employee> employees;
        if (search != null && !search.isEmpty()) {
            employees = employeeService.searchEmployees(search);
        } else {
            employees = employeeService.getAllEmployees();
        }
        model.addAttribute("employees", employees);
        model.addAttribute("search", search);
        
        // Add real employee statistics from DashboardService
        var employeeStats = dashboardService.getDashboardAnalytics();
        model.addAttribute("employeeStats", employeeStats);
        
        return "employee/list";
    }

    @GetMapping("/add")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String showAddForm(Model model) {
        model.addAttribute("employee", new Employee());
        return "employee/add";
    }

    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String addEmployee(@ModelAttribute Employee employee,
                            Authentication authentication,
                            RedirectAttributes redirectAttributes) {
        try {
            // Validate employee data
            ValidationUtils.validateName(employee.getFirstName(), "First name");
            ValidationUtils.validateName(employee.getLastName(), "Last name");
            ValidationUtils.validateEmail(employee.getWorkEmail(), "Work email");
            ValidationUtils.validateEmail(employee.getPersonalEmail(), "Personal email");
            ValidationUtils.validatePhone(employee.getContactNumber(), "Contact number");
            ValidationUtils.validateJoiningDate(employee.getJoiningDate());
            
            employee.setCreatedBy(authentication.getName());
            Employee savedEmployee = employeeService.createEmployee(employee);
            
            // Generate user credentials message
            String username = savedEmployee.getWorkEmail().substring(0, savedEmployee.getWorkEmail().indexOf("@"));
            String defaultPassword = savedEmployee.getEmployeeId().toLowerCase() + "123";
            
            String successMessage = String.format(
                "Employee added successfully!<br/>" +
                "<strong>Employee ID:</strong> %s<br/>" +
                "<strong>Work Email:</strong> %s<br/>" +
                "<strong>Login Credentials:</strong><br/>" +
                "Username: <code>%s</code><br/>" +
                "Temporary Password: <code>%s</code><br/>" +
                "<small class='text-warning'><i class='bi bi-exclamation-triangle'></i> " +
                "This is a temporary password. The employee will be required to change it on first login.</small><br/>" +
                "<small class='text-muted'>Please share these credentials with the employee securely.</small>",
                savedEmployee.getEmployeeId(),
                savedEmployee.getWorkEmail(),
                username,
                defaultPassword
            );
            
            redirectAttributes.addFlashAttribute("successHtml", successMessage);
            return "redirect:/employee/list";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error adding employee: " + e.getMessage());
            return "redirect:/employee/add";
        }
    }

    @GetMapping("/view/{id}")
    public String viewEmployee(@PathVariable Long id, Model model) {
        Employee employee = employeeService.getEmployeeById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));
        List<EmployeeDocument> documents = documentService.getDocumentsByEmployeeId(id);

        model.addAttribute("employee", employee);
        model.addAttribute("documents", documents);
        return "employee/view";
    }

    @GetMapping("/edit/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String showEditForm(@PathVariable Long id, Model model) {
        Employee employee = employeeService.getEmployeeById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        model.addAttribute("employee", employee);
        return "employee/edit";
    }

    @PostMapping("/edit/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String updateEmployee(@PathVariable Long id,
                               @ModelAttribute Employee employee,
                               RedirectAttributes redirectAttributes) {
        try {
            employeeService.updateEmployee(id, employee);
            redirectAttributes.addFlashAttribute("success", "Employee updated successfully");
            return "redirect:/employee/view/" + id;
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error updating employee: " + e.getMessage());
            return "redirect:/employee/edit/" + id;
        }
    }

    @PostMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteEmployee(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            employeeService.deleteEmployee(id);
            redirectAttributes.addFlashAttribute("success", "Employee deleted successfully");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error deleting employee: " + e.getMessage());
        }
        return "redirect:/employee/list";
    }

    @PostMapping("/{id}/documents/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public String uploadDocument(@PathVariable Long id,
                               @RequestParam("file") MultipartFile file,
                               @RequestParam("documentType") String documentType,
                               @RequestParam(value = "expiryDate", required = false) String expiryDate,
                               @RequestParam(value = "documentNumber", required = false) String documentNumber,
                               Authentication authentication,
                               RedirectAttributes redirectAttributes) {
        try {
            Employee employee = employeeService.getEmployeeById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));

            // Validate file
            if (file.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "Please select a file to upload.");
                return "redirect:/employee/" + id + "/documents/upload";
            }
            
            // Validate file size and type
            ValidationUtils.validateFileSize(file.getSize(), 10 * 1024 * 1024); // 10MB
            ValidationUtils.validateFileType(file.getOriginalFilename(), 
                new String[]{"pdf", "jpg", "jpeg", "png", "doc", "docx"});

            // Use the service method that supports more parameters
            documentService.saveEmployeeDocument(employee, file, documentType, expiryDate, documentNumber, authentication.getName());
            
            // After uploading documents, set employee status to ACTIVE
            if (!"ACTIVE".equals(employee.getStatus())) {
                employee.setStatus("ACTIVE");
                employeeService.updateEmployee(employee.getId(), employee);
            }
            
            redirectAttributes.addFlashAttribute("success", "Document uploaded successfully for " + employee.getFirstName() + " " + employee.getLastName() + "!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error uploading document: " + e.getMessage());
        }
        return "redirect:/employee/" + id + "/documents/upload";
    }

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN')")
    public String viewProfile(Authentication authentication, Model model) {
        try {
            // Get the logged-in user's information
            String username = authentication.getName();
            
            // Find the user by username to get their email
            User currentUser = userService.findByUsername(username);
            if (currentUser == null) {
                model.addAttribute("error", "User not found");
                return "redirect:/dashboard";
            }
            
            // Find the employee by work email matching the user's email
            Optional<Employee> employeeOpt = employeeService.findByWorkEmail(currentUser.getEmail());
            if (employeeOpt.isEmpty()) {
                model.addAttribute("error", "Employee profile not found. Please contact HR to link your account.");
                return "redirect:/dashboard";
            }
            
            Employee employee = employeeOpt.get();
            List<EmployeeDocument> documents = documentService.getDocumentsByEmployeeId(employee.getId());
            
            model.addAttribute("employee", employee);
            model.addAttribute("documents", documents);
            model.addAttribute("isProfileView", true);
            
            return "employee/view";
            
        } catch (Exception e) {
            model.addAttribute("error", "Error loading profile: " + e.getMessage());
            return "redirect:/dashboard";
        }
    }

    // Document listing for employees
    @GetMapping("/documents")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public String showEmployeeDocuments(Authentication authentication, Model model) {
        try {
            User currentUser = userService.findByUsername(authentication.getName());
            Optional<Employee> employeeOpt = employeeService.findByWorkEmail(currentUser.getEmail());
            
            if (employeeOpt.isEmpty()) {
                model.addAttribute("error", "Employee profile not found. Please contact HR.");
                return "redirect:/dashboard";
            }
            
            Employee employee = employeeOpt.get();
            List<EmployeeDocument> documents = documentService.getDocumentsByEmployeeId(employee.getId());
            
            model.addAttribute("employee", employee);
            model.addAttribute("documents", documents);
            model.addAttribute("documentTypes", getRequiredDocumentTypes());
            
            return "employee/documents";
            
        } catch (Exception e) {
            model.addAttribute("error", "Error loading documents: " + e.getMessage());
            return "redirect:/dashboard";
        }
    }

    // Document upload for employees
    @GetMapping("/documents/upload")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public String showDocumentUploadForm(Authentication authentication, Model model) {
        try {
            User currentUser = userService.findByUsername(authentication.getName());
            Optional<Employee> employeeOpt = employeeService.findByWorkEmail(currentUser.getEmail());
            
            if (employeeOpt.isEmpty()) {
                model.addAttribute("error", "Employee profile not found. Please contact HR.");
                return "redirect:/dashboard";
            }
            
            Employee employee = employeeOpt.get();
            List<EmployeeDocument> documents = documentService.getDocumentsByEmployeeId(employee.getId());
            
            model.addAttribute("employee", employee);
            model.addAttribute("documents", documents);
            model.addAttribute("documentTypes", getRequiredDocumentTypes());
            
            return "employee/document-upload";
            
        } catch (Exception e) {
            model.addAttribute("error", "Error loading documents: " + e.getMessage());
            return "redirect:/dashboard";
        }
    }

    @PostMapping("/documents/upload")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public String uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "expiryDate", required = false) String expiryDate,
            @RequestParam(value = "documentNumber", required = false) String documentNumber,
            Authentication authentication,
            RedirectAttributes redirectAttributes) {
        
        try {
            User currentUser = userService.findByUsername(authentication.getName());
            Optional<Employee> employeeOpt = employeeService.findByWorkEmail(currentUser.getEmail());
            
            if (employeeOpt.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "Employee profile not found.");
                return "redirect:/dashboard";
            }
            
            Employee employee = employeeOpt.get();
            
            // Validate file
            if (file.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "Please select a file to upload.");
                return "redirect:/employee/documents/upload";
            }
            
            // Save document
            documentService.saveEmployeeDocument(employee, file, documentType, expiryDate, documentNumber, currentUser.getUsername());
            redirectAttributes.addFlashAttribute("success", "Document uploaded successfully!");
            
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error uploading document: " + e.getMessage());
        }
        
        return "redirect:/employee/documents/upload";
    }

    // Document management for Admin/HR
    @GetMapping("/{id}/documents")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String viewEmployeeDocuments(@PathVariable Long id, Model model) {
        try {
            Employee employee = employeeService.getEmployeeById(id)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));
            List<EmployeeDocument> documents = documentService.getDocumentsByEmployeeId(id);
            
            model.addAttribute("employee", employee);
            model.addAttribute("documents", documents);
            model.addAttribute("documentTypes", getRequiredDocumentTypes());
            
            return "employee/documents";
            
        } catch (Exception e) {
            model.addAttribute("error", "Error loading employee documents: " + e.getMessage());
            return "redirect:/employee/list";
        }
    }

    // Document upload for specific employee (Admin/HR/Employee)
    @GetMapping("/{id}/documents/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public String showEmployeeDocumentUploadForm(@PathVariable Long id, Model model, Authentication authentication) {
        try {
            Employee employee = employeeService.getEmployeeById(id)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));
            List<EmployeeDocument> documents = documentService.getDocumentsByEmployeeId(id);
            
            model.addAttribute("employee", employee);
            model.addAttribute("documents", documents);
            model.addAttribute("documentTypes", getRequiredDocumentTypes());
            
            return "employee/document-upload";
            
        } catch (Exception e) {
            model.addAttribute("error", "Error loading employee documents: " + e.getMessage());
            return "redirect:/employee/list";
        }
    }



    @PostMapping("/documents/{documentId}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public String verifyDocument(
            @PathVariable Long documentId,
            @RequestParam("status") String status,
            @RequestParam(value = "notes", required = false) String notes,
            Authentication authentication,
            RedirectAttributes redirectAttributes) {
        
        try {
            documentService.verifyDocument(documentId, status, notes, authentication.getName());
            redirectAttributes.addFlashAttribute("success", "Document status updated successfully!");
            
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error updating document: " + e.getMessage());
        }
        
        return "redirect:/employee/" + documentService.getDocumentById(documentId).orElseThrow().getEmployee().getId() + "/documents";
    }

    @PostMapping("/{id}/generate-reset-link")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @ResponseBody
    public ResponseEntity<String> generatePasswordResetLink(@PathVariable Long id) {
        try {
            Employee employee = employeeService.getEmployeeById(id)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));
            
            String resetLink = employeeService.generatePasswordResetLinkForEmployee(employee);
            
            if (resetLink != null) {
                return ResponseEntity.ok("http://localhost:8080" + resetLink);
            } else {
                return ResponseEntity.badRequest().body("Failed to generate reset link");
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/documents/{documentId}/view")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Resource> viewDocument(@PathVariable Long documentId) {
        try {
            EmployeeDocument document = documentService.getDocumentById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            
            Path filePath = Paths.get("./uploads/employee-docs/" + document.getFileName());
            Resource resource = new FileSystemResource(filePath.toFile());
            
            if (resource.exists()) {
                String contentType = getContentType(document.getFileType(), document.getFileName());
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "inline; filename=\"" + document.getFileName() + "\"")
                        .body(resource);
            } else {
                throw new RuntimeException("File not found on disk");
            }
            
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/documents/{documentId}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long documentId) {
        try {
            EmployeeDocument document = documentService.getDocumentById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            
            Path filePath = Paths.get("./uploads/employee-docs/" + document.getFileName());
            Resource resource = new FileSystemResource(filePath.toFile());
            
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "attachment; filename=\"" + document.getFileName() + "\"")
                        .body(resource);
            } else {
                throw new RuntimeException("File not found on disk");
            }
            
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    private String getContentType(String fileType, String fileName) {
        if (fileType != null && !fileType.isEmpty()) {
            return fileType;
        }
        
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        switch (extension) {
            case "pdf":
                return "application/pdf";
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "doc":
                return "application/msword";
            case "docx":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            default:
                return "application/octet-stream";
        }
    }

    private List<String> getRequiredDocumentTypes() {
        return List.of(
            "DRIVERS_LICENSE",
            "SSN_CARD", 
            "PASSPORT",
            "VISA",
            "I9_FORM",
            "I20_FORM",
            "I94_FORM",
            "PHOTO_ID",
            "BANK_DETAILS",
            "EDUCATIONAL_CERTIFICATE",
            "PREVIOUS_EMPLOYMENT",
            "BACKGROUND_CHECK",
            "OTHER"
        );
    }
}

