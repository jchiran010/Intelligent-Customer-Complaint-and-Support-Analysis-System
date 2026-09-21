package com.complaintsystem.controller;

import com.complaintsystem.dto.CategoryDto;
import com.complaintsystem.dto.ComplaintDtos;
import com.complaintsystem.service.AdminService;
import com.complaintsystem.service.ComplaintService;
import com.complaintsystem.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final AdminService adminService;

    public ComplaintController(ComplaintService complaintService, AdminService adminService) {
        this.complaintService = complaintService;
        this.adminService = adminService;
    }

    // Public active categories for dropdown
    @GetMapping("/categories/public")
    public ResponseEntity<List<CategoryDto>> getPublicCategories() {
        List<CategoryDto> active = adminService.getAllCategories().stream()
                .filter(c -> Boolean.TRUE.equals(c.getIsActive()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(active);
    }

    // ==========================================
    // USER COMPLAINT ENDPOINTS (ROLE_USER)
    // ==========================================

    @PostMapping("/user/complaints")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ComplaintDtos.ComplaintResponse> submitComplaint(
            @Valid @RequestBody ComplaintDtos.ComplaintCreateRequest req) {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new RuntimeException("Unauthenticated"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(complaintService.createComplaint(req, email));
    }

    @GetMapping("/user/complaints")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<ComplaintDtos.ComplaintResponse>> getMyComplaints(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new RuntimeException("Unauthenticated"));
        return ResponseEntity.ok(complaintService.getMyComplaints(email, status, search));
    }

    @GetMapping("/user/complaints/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ComplaintDtos.ComplaintResponse> getMyComplaintDetails(@PathVariable Long id) {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new RuntimeException("Unauthenticated"));
        return ResponseEntity.ok(complaintService.getMyComplaintDetails(id, email));
    }

    // ==========================================
    // ADMIN COMPLAINT ENDPOINTS (ROLE_ADMIN)
    // ==========================================

    @GetMapping("/admin/complaints")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ComplaintDtos.ComplaintResponse>> getAllComplaintsAdmin(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(complaintService.getAllComplaintsAdmin(status, priority, categoryId, search));
    }

    @GetMapping("/admin/complaints/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComplaintDtos.ComplaintResponse> getComplaintDetailsAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getComplaintDetailsAdmin(id));
    }

    @PutMapping("/admin/complaints/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComplaintDtos.ComplaintResponse> updateComplaintStatus(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintDtos.StatusUpdateRequest req) {
        String adminEmail = SecurityUtils.getCurrentUserEmail().orElse("admin");
        return ResponseEntity.ok(complaintService.updateStatus(id, req, adminEmail));
    }

    @PutMapping("/admin/complaints/{id}/priority")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComplaintDtos.ComplaintResponse> updateComplaintPriority(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintDtos.PriorityUpdateRequest req) {
        return ResponseEntity.ok(complaintService.updatePriority(id, req.getPriority()));
    }

    @PutMapping("/admin/complaints/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComplaintDtos.ComplaintResponse> assignComplaintStaff(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintDtos.AssignStaffRequest req) {
        return ResponseEntity.ok(complaintService.assignStaff(id, req.getAdminId()));
    }
}
