package com.originhubs.HRMS.controller.api;

import com.originhubs.HRMS.model.Timesheet;
import com.originhubs.HRMS.service.TimesheetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timesheets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class TimesheetApiController {

    private final TimesheetService timesheetService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<List<Timesheet>> getAllTimesheets() {
        List<Timesheet> timesheets = timesheetService.getAllTimesheets();
        return ResponseEntity.ok(timesheets);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<Timesheet> getTimesheet(@PathVariable Long id) {
        try {
            List<Timesheet> timesheets = timesheetService.getAllTimesheets();
            return timesheets.stream()
                .filter(t -> t.getId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}