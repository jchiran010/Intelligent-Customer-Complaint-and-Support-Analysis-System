package com.complaintsystem.controller;

import com.complaintsystem.dto.AuthDtos;
import com.complaintsystem.dto.DashboardDtos;
import com.complaintsystem.dto.UserProfileDto;
import com.complaintsystem.service.UserService;
import com.complaintsystem.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@PreAuthorize("hasRole('USER')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDtos.UserDashboardDto> getUserDashboard() {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new RuntimeException("Unauthenticated"));
        return ResponseEntity.ok(userService.getUserDashboardStats(email));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getUserProfile() {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new RuntimeException("Unauthenticated"));
        return ResponseEntity.ok(userService.getUserProfile(email));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(@Valid @RequestBody UserProfileDto.UserUpdateRequest req) {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new RuntimeException("Unauthenticated"));
        return ResponseEntity.ok(userService.updateProfile(email, req));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@Valid @RequestBody AuthDtos.PasswordChangeRequest req) {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new RuntimeException("Unauthenticated"));
        userService.changePassword(email, req);
        return ResponseEntity.ok(Map.of("success", true, "message", "Password changed successfully"));
    }
}
