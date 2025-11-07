package com.originhubs.HRMS.controller.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/timesheets")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8081"}, allowCredentials = "true")
public class TimesheetApiController {

    @GetMapping("/approvals")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> getApprovals() {
        Map<String, Object> response = new HashMap<>();
        response.put("pendingTimesheets", new ArrayList<>());
        response.put("recentTimesheets", new ArrayList<>());
        response.put("pendingCount", 0);
        response.put("approvedToday", 0);
        response.put("rejectedToday", 0);
        response.put("totalEmployees", 0);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> approveTimesheet(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Timesheet approved successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> rejectTimesheet(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Timesheet rejected successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> getAllTimesheets() {
        Map<String, Object> response = new HashMap<>();
        response.put("timesheets", new ArrayList<>());
        response.put("stats", Map.of(
            "totalTimesheets", 0,
            "pendingApproval", 0,
            "approved", 0,
            "rejected", 0,
            "totalHours", 0
        ));
        return ResponseEntity.ok(response);
    }
}