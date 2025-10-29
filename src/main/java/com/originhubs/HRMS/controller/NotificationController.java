package com.originhubs.HRMS.controller;

import com.originhubs.HRMS.model.Notification;
import com.originhubs.HRMS.model.User;
import com.originhubs.HRMS.service.NotificationService;
import com.originhubs.HRMS.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping
    public String getNotifications(Model model, Authentication authentication) {
        User currentUser = userService.findByUsername(authentication.getName());
        List<Notification> notifications = notificationService.getUserNotifications(currentUser.getId());
        Long unreadCount = notificationService.getUnreadCount(currentUser.getId());

        model.addAttribute("notifications", notifications);
        model.addAttribute("unreadCount", unreadCount);
        
        return "notifications/list";
    }

    @GetMapping("/api/unread-count")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getUnreadCount(Authentication authentication) {
        User currentUser = userService.findByUsername(authentication.getName());
        Long unreadCount = notificationService.getUnreadCount(currentUser.getId());
        
        return ResponseEntity.ok(Map.of("unreadCount", unreadCount));
    }

    @GetMapping("/api/recent")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getRecentNotifications(Authentication authentication) {
        User currentUser = userService.findByUsername(authentication.getName());
        List<Notification> recentNotifications = notificationService.getRecentNotifications(currentUser.getId(), 5);
        
        return ResponseEntity.ok(Map.of("notifications", recentNotifications));
    }

    @PostMapping("/{id}/mark-read")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/mark-all-read")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> markAllAsRead(Authentication authentication) {
        User currentUser = userService.findByUsername(authentication.getName());
        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok(Map.of("success", true));
    }
}