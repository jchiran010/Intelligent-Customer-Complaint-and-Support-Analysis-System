package com.complaintsystem.dto;

import java.util.List;
import java.util.Map;

public class DashboardDtos {

    public static class AdminDashboardDto {
        private long totalComplaints;
        private long pendingComplaints;
        private long inProgressComplaints;
        private long resolvedComplaints;
        private long closedComplaints;
        private long highPriorityComplaints;
        private double resolutionRate;
        private double averageRating;
        private long totalUsers;
        private List<ComplaintDtos.ComplaintResponse> recentComplaints;
        private Map<String, Long> categoryDistribution;
        private Map<String, Long> statusDistribution;
        private Map<String, Long> priorityDistribution;
        private Map<String, Long> sentimentDistribution;

        public AdminDashboardDto() {}

        public long getTotalComplaints() { return totalComplaints; }
        public void setTotalComplaints(long totalComplaints) { this.totalComplaints = totalComplaints; }

        public long getPendingComplaints() { return pendingComplaints; }
        public void setPendingComplaints(long pendingComplaints) { this.pendingComplaints = pendingComplaints; }

        public long getInProgressComplaints() { return inProgressComplaints; }
        public void setInProgressComplaints(long inProgressComplaints) { this.inProgressComplaints = inProgressComplaints; }

        public long getResolvedComplaints() { return resolvedComplaints; }
        public void setResolvedComplaints(long resolvedComplaints) { this.resolvedComplaints = resolvedComplaints; }

        public long getClosedComplaints() { return closedComplaints; }
        public void setClosedComplaints(long closedComplaints) { this.closedComplaints = closedComplaints; }

        public long getHighPriorityComplaints() { return highPriorityComplaints; }
        public void setHighPriorityComplaints(long highPriorityComplaints) { this.highPriorityComplaints = highPriorityComplaints; }

        public double getResolutionRate() { return resolutionRate; }
        public void setResolutionRate(double resolutionRate) { this.resolutionRate = resolutionRate; }

        public double getAverageRating() { return averageRating; }
        public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

        public long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

        public List<ComplaintDtos.ComplaintResponse> getRecentComplaints() { return recentComplaints; }
        public void setRecentComplaints(List<ComplaintDtos.ComplaintResponse> recentComplaints) { this.recentComplaints = recentComplaints; }

        public Map<String, Long> getCategoryDistribution() { return categoryDistribution; }
        public void setCategoryDistribution(Map<String, Long> categoryDistribution) { this.categoryDistribution = categoryDistribution; }

        public Map<String, Long> getStatusDistribution() { return statusDistribution; }
        public void setStatusDistribution(Map<String, Long> statusDistribution) { this.statusDistribution = statusDistribution; }

        public Map<String, Long> getPriorityDistribution() { return priorityDistribution; }
        public void setPriorityDistribution(Map<String, Long> priorityDistribution) { this.priorityDistribution = priorityDistribution; }

        public Map<String, Long> getSentimentDistribution() { return sentimentDistribution; }
        public void setSentimentDistribution(Map<String, Long> sentimentDistribution) { this.sentimentDistribution = sentimentDistribution; }
    }

    public static class UserDashboardDto {
        private String userName;
        private long totalComplaints;
        private long pendingComplaints;
        private long inProgressComplaints;
        private long resolvedComplaints;
        private long unreadNotificationsCount;
        private List<ComplaintDtos.ComplaintResponse> recentComplaints;

        public UserDashboardDto() {}

        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }

        public long getTotalComplaints() { return totalComplaints; }
        public void setTotalComplaints(long totalComplaints) { this.totalComplaints = totalComplaints; }

        public long getPendingComplaints() { return pendingComplaints; }
        public void setPendingComplaints(long pendingComplaints) { this.pendingComplaints = pendingComplaints; }

        public long getInProgressComplaints() { return inProgressComplaints; }
        public void setInProgressComplaints(long inProgressComplaints) { this.inProgressComplaints = inProgressComplaints; }

        public long getResolvedComplaints() { return resolvedComplaints; }
        public void setResolvedComplaints(long resolvedComplaints) { this.resolvedComplaints = resolvedComplaints; }

        public long getUnreadNotificationsCount() { return unreadNotificationsCount; }
        public void setUnreadNotificationsCount(long unreadNotificationsCount) { this.unreadNotificationsCount = unreadNotificationsCount; }

        public List<ComplaintDtos.ComplaintResponse> getRecentComplaints() { return recentComplaints; }
        public void setRecentComplaints(List<ComplaintDtos.ComplaintResponse> recentComplaints) { this.recentComplaints = recentComplaints; }
    }

    public static class AnalyticsDto {
        private double slaCompliancePercentage;
        private double avgResolutionHours;
        private double customerSatisfactionScore;
        private Map<String, Long> sentimentBreakdown;
        private Map<String, Long> categoryVolume;
        private Map<String, Long> priorityBreakdown;
        private Map<String, Long> monthlyTrend;

        public AnalyticsDto() {}

        public double getSlaCompliancePercentage() { return slaCompliancePercentage; }
        public void setSlaCompliancePercentage(double slaCompliancePercentage) { this.slaCompliancePercentage = slaCompliancePercentage; }

        public double getAvgResolutionHours() { return avgResolutionHours; }
        public void setAvgResolutionHours(double avgResolutionHours) { this.avgResolutionHours = avgResolutionHours; }

        public double getCustomerSatisfactionScore() { return customerSatisfactionScore; }
        public void setCustomerSatisfactionScore(double customerSatisfactionScore) { this.customerSatisfactionScore = customerSatisfactionScore; }

        public Map<String, Long> getSentimentBreakdown() { return sentimentBreakdown; }
        public void setSentimentBreakdown(Map<String, Long> sentimentBreakdown) { this.sentimentBreakdown = sentimentBreakdown; }

        public Map<String, Long> getCategoryVolume() { return categoryVolume; }
        public void setCategoryVolume(Map<String, Long> categoryVolume) { this.categoryVolume = categoryVolume; }

        public Map<String, Long> getPriorityBreakdown() { return priorityBreakdown; }
        public void setPriorityBreakdown(Map<String, Long> priorityBreakdown) { this.priorityBreakdown = priorityBreakdown; }

        public Map<String, Long> getMonthlyTrend() { return monthlyTrend; }
        public void setMonthlyTrend(Map<String, Long> monthlyTrend) { this.monthlyTrend = monthlyTrend; }
    }
}
