package com.originhubs.HRMS.controller;

import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.model.Offboarding;
import com.originhubs.HRMS.service.EmployeeService;
import com.originhubs.HRMS.service.OffboardingService;
import com.originhubs.HRMS.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/offboarding")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
public class OffboardingController {

    private final OffboardingService offboardingService;
    private final EmployeeService employeeService;
    private final DashboardService dashboardService;

    @GetMapping("/list")
    public String listOffboardings(Model model) {
        List<Offboarding> offboardings = offboardingService.getAllOffboardings();
        model.addAttribute("offboardingList", offboardings);
        
        // Add offboarding statistics from DashboardService
        java.util.Map<String, Object> analytics = dashboardService.getDashboardAnalytics();
        model.addAttribute("totalOffboardings", analytics.get("totalOffboardings"));
        model.addAttribute("pendingOffboardings", analytics.get("pendingOffboardings"));
        model.addAttribute("inProgressOffboardings", analytics.get("inProgressOffboardings"));
        model.addAttribute("completedOffboardings", analytics.get("completedOffboardings"));
        
        return "offboarding/list";
    }

    @GetMapping("/initiate")
    public String showInitiateForm(Model model) {
        model.addAttribute("offboarding", new Offboarding());
        List<Employee> activeEmployees = employeeService.getEmployeesByStatus("ACTIVE");
        model.addAttribute("employees", activeEmployees);
        return "offboarding/initiate";
    }

    @PostMapping("/initiate")
    public String initiateOffboarding(@ModelAttribute Offboarding offboarding,
                                    @RequestParam Long employeeId,
                                    Authentication authentication,
                                    RedirectAttributes redirectAttributes) {
        try {
            Employee employee = employeeService.getEmployeeById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));

            offboarding.setEmployee(employee);
            offboarding.setInitiatedBy(authentication.getName());
            offboardingService.initiateOffboarding(offboarding);

            redirectAttributes.addFlashAttribute("success", "Offboarding initiated successfully");
            return "redirect:/offboarding/list";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error initiating offboarding: " + e.getMessage());
            return "redirect:/offboarding/initiate";
        }
    }

    @GetMapping("/view/{id}")
    public String viewOffboarding(@PathVariable Long id, Model model) {
        Offboarding offboarding = offboardingService.getOffboardingById(id)
                .orElseThrow(() -> new RuntimeException("Offboarding not found"));
        model.addAttribute("offboarding", offboarding);
        return "offboarding/view";
    }

    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id, Model model) {
        Offboarding offboarding = offboardingService.getOffboardingById(id)
                .orElseThrow(() -> new RuntimeException("Offboarding not found"));
        model.addAttribute("offboarding", offboarding);
        return "offboarding/edit";
    }

    @PostMapping("/edit/{id}")
    public String updateOffboarding(@PathVariable Long id,
                                  @ModelAttribute Offboarding offboarding,
                                  RedirectAttributes redirectAttributes) {
        try {
            offboardingService.updateOffboarding(id, offboarding);
            redirectAttributes.addFlashAttribute("success", "Offboarding updated successfully");
            return "redirect:/offboarding/view/" + id;
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error updating offboarding: " + e.getMessage());
            return "redirect:/offboarding/edit/" + id;
        }
    }

    @PostMapping("/{id}/revoke-access")
    public String revokeAccess(@PathVariable Long id,
                             @RequestParam(required = false) boolean revokeEmail,
                             @RequestParam(required = false) boolean revokeSlack,
                             RedirectAttributes redirectAttributes) {
        try {
            offboardingService.revokeAccess(id, revokeEmail, revokeSlack);
            redirectAttributes.addFlashAttribute("success", "Access revoked successfully");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error revoking access: " + e.getMessage());
        }
        return "redirect:/offboarding/view/" + id;
    }
}

