package com.originhubs.HRMS.controller.api;

import com.originhubs.HRMS.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
// @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
public class DashboardApiController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getDashboardAnalytics() {
        try {
            Map<String, Object> analytics = dashboardService.getDashboardAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/employee-analytics/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or #employeeId == authentication.name")
    public ResponseEntity<Map<String, Object>> getEmployeeAnalytics(@PathVariable String employeeId) {
        try {
            Map<String, Object> analytics = dashboardService.getEmployeeSpecificAnalytics(employeeId);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}