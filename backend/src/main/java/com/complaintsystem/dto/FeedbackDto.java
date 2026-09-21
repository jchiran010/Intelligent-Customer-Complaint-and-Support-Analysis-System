package com.complaintsystem.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class FeedbackDto {

    public static class FeedbackRequest {
        @NotNull(message = "Complaint ID is required")
        private Long complaintId;

        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating cannot exceed 5")
        private Integer rating;

        private String comments;

        public FeedbackRequest() {}

        public Long getComplaintId() { return complaintId; }
        public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }

        public String getComments() { return comments; }
        public void setComments(String comments) { this.comments = comments; }
    }

    public static class FeedbackResponse {
        private Long id;
        private Long complaintId;
        private String complaintNumber;
        private String complaintTitle;
        private Long userId;
        private String userName;
        private Integer rating;
        private String comments;
        private LocalDateTime createdAt;

        public FeedbackResponse() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getComplaintId() { return complaintId; }
        public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

        public String getComplaintNumber() { return complaintNumber; }
        public void setComplaintNumber(String complaintNumber) { this.complaintNumber = complaintNumber; }

        public String getComplaintTitle() { return complaintTitle; }
        public void setComplaintTitle(String complaintTitle) { this.complaintTitle = complaintTitle; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }

        public String getComments() { return comments; }
        public void setComments(String comments) { this.comments = comments; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
