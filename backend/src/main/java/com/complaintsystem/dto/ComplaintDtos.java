package com.complaintsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class ComplaintDtos {

    public static class ComplaintCreateRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Description is required")
        private String description;

        @NotNull(message = "Category is required")
        private Long categoryId;

        private String priority; // Can be manually selected or auto-detected

        public ComplaintCreateRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
    }

    public static class StatusUpdateRequest {
        @NotBlank(message = "Status is required")
        private String status;
        private String resolutionNotes;

        public StatusUpdateRequest() {}

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getResolutionNotes() { return resolutionNotes; }
        public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    }

    public static class PriorityUpdateRequest {
        @NotBlank(message = "Priority is required")
        private String priority;

        public PriorityUpdateRequest() {}

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
    }

    public static class AssignStaffRequest {
        @NotNull(message = "Admin or Staff ID is required")
        private Long adminId;

        public AssignStaffRequest() {}

        public Long getAdminId() { return adminId; }
        public void setAdminId(Long adminId) { this.adminId = adminId; }
    }

    public static class ComplaintResponse {
        private Long id;
        private String complaintNumber;
        private String title;
        private String description;
        private Long userId;
        private String userName;
        private String userEmail;
        private Long categoryId;
        private String categoryName;
        private Long assignedAdminId;
        private String assignedAdminName;
        private String priority;
        private String status;
        private String sentiment;
        private Double sentimentScore;
        private String resolutionNotes;
        private LocalDateTime resolvedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String ticketNumber;

        public ComplaintResponse() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getComplaintNumber() { return complaintNumber; }
        public void setComplaintNumber(String complaintNumber) { this.complaintNumber = complaintNumber; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }

        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

        public Long getAssignedAdminId() { return assignedAdminId; }
        public void setAssignedAdminId(Long assignedAdminId) { this.assignedAdminId = assignedAdminId; }

        public String getAssignedAdminName() { return assignedAdminName; }
        public void setAssignedAdminName(String assignedAdminName) { this.assignedAdminName = assignedAdminName; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getSentiment() { return sentiment; }
        public void setSentiment(String sentiment) { this.sentiment = sentiment; }

        public Double getSentimentScore() { return sentimentScore; }
        public void setSentimentScore(Double sentimentScore) { this.sentimentScore = sentimentScore; }

        public String getResolutionNotes() { return resolutionNotes; }
        public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

        public LocalDateTime getResolvedAt() { return resolvedAt; }
        public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

        public String getTicketNumber() { return ticketNumber; }
        public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }
    }
}
