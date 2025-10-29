package com.originhubs.HRMS.controller;

import com.originhubs.HRMS.model.User;
import com.originhubs.HRMS.model.Role;
import com.originhubs.HRMS.service.UserService;
import com.originhubs.HRMS.service.RoleService;
import com.originhubs.HRMS.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.validation.Valid;
import java.util.List;

@Controller
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final RoleService roleService;
    private final DashboardService dashboardService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public String listUsers(Model model) {
        List<User> users = userService.findAllUsers();
        model.addAttribute("users", users);
        
        // Add user statistics from DashboardService
        java.util.Map<String, Object> userStats = dashboardService.getUserStatistics();
        model.addAllAttributes(userStats);
        
        return "user/list";
    }

    @GetMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public String showAddForm(Model model) {
        model.addAttribute("user", new User());
        model.addAttribute("roles", roleService.findAllRoles());
        return "user/add";
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public String addUser(@Valid @ModelAttribute User user, 
                         BindingResult result, 
                         @RequestParam(required = false) List<Long> roleIds,
                         Model model, 
                         RedirectAttributes redirectAttributes) {
        
        if (result.hasErrors()) {
            model.addAttribute("roles", roleService.findAllRoles());
            return "user/add";
        }

        if (userService.existsByUsername(user.getUsername())) {
            result.rejectValue("username", "error.username", "Username already exists");
            model.addAttribute("roles", roleService.findAllRoles());
            return "user/add";
        }

        if (userService.existsByEmail(user.getEmail())) {
            result.rejectValue("email", "error.email", "Email already exists");
            model.addAttribute("roles", roleService.findAllRoles());
            return "user/add";
        }

        userService.saveUser(user, roleIds);
        redirectAttributes.addFlashAttribute("successMessage", "User created successfully!");
        return "redirect:/users";
    }

    @GetMapping("/edit/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String showEditForm(@PathVariable Long id, Model model) {
        User user = userService.findById(id);
        if (user == null) {
            return "redirect:/users";
        }
        model.addAttribute("user", user);
        model.addAttribute("roles", roleService.findAllRoles());
        return "user/edit";
    }

    @PostMapping("/edit/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String editUser(@PathVariable Long id, 
                          @Valid @ModelAttribute User user,
                          BindingResult result,
                          @RequestParam(required = false) List<Long> roleIds,
                          Model model, 
                          RedirectAttributes redirectAttributes) {
        
        if (result.hasErrors()) {
            model.addAttribute("roles", roleService.findAllRoles());
            return "user/edit";
        }

        User existingUser = userService.findById(id);
        if (existingUser == null) {
            return "redirect:/users";
        }

        // Check for duplicate username (excluding current user)
        if (!existingUser.getUsername().equals(user.getUsername()) && 
            userService.existsByUsername(user.getUsername())) {
            result.rejectValue("username", "error.username", "Username already exists");
            model.addAttribute("roles", roleService.findAllRoles());
            return "user/edit";
        }

        // Check for duplicate email (excluding current user)
        if (!existingUser.getEmail().equals(user.getEmail()) && 
            userService.existsByEmail(user.getEmail())) {
            result.rejectValue("email", "error.email", "Email already exists");
            model.addAttribute("roles", roleService.findAllRoles());
            return "user/edit";
        }

        userService.updateUser(id, user, roleIds);
        redirectAttributes.addFlashAttribute("successMessage", "User updated successfully!");
        return "redirect:/users";
    }

    @PostMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        userService.deleteUser(id);
        redirectAttributes.addFlashAttribute("successMessage", "User deleted successfully!");
        return "redirect:/users";
    }

    @GetMapping("/view/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String viewUser(@PathVariable Long id, Model model) {
        User user = userService.findById(id);
        if (user == null) {
            return "redirect:/users";
        }
        model.addAttribute("user", user);
        return "user/view";
    }
}