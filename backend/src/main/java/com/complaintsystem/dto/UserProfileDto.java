package com.complaintsystem.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class UserProfileDto {

    private Long id;
    private String name;
    private String email;
    private String role;
    private String phone;
    private String department;
    private String avatarUrl;
    private String status;
    private LocalDateTime createdAt;
    private long totalComplaints;

    public UserProfileDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public long getTotalComplaints() { return totalComplaints; }
    public void setTotalComplaints(long totalComplaints) { this.totalComplaints = totalComplaints; }

    public static class UserUpdateRequest {
        @NotBlank(message = "Name cannot be blank")
        private String name;
        private String phone;
        private String department;
        private String avatarUrl;

        public UserUpdateRequest() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }

        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }

    public static class StatusChangeRequest {
        @NotBlank(message = "Status cannot be blank")
        private String status; // ACTIVE, SUSPENDED

        public StatusChangeRequest() {}

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
