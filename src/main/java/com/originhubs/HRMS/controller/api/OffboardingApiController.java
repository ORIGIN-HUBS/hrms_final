package com.originhubs.HRMS.controller.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/offboarding")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8081"}, allowCredentials = "true")
public class OffboardingApiController {

    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Object> getOffboardings() {
        return ResponseEntity.ok(new ArrayList<>());
    }
}