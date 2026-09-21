package com.complaintsystem.service;

import com.complaintsystem.dto.CategoryDto;
import com.complaintsystem.dto.ComplaintDtos;
import com.complaintsystem.dto.DashboardDtos;
import com.complaintsystem.dto.UserProfileDto;
import com.complaintsystem.entity.Category;
import com.complaintsystem.entity.Complaint;
import com.complaintsystem.entity.User;
import com.complaintsystem.exception.BadRequestException;
import com.complaintsystem.exception.ResourceNotFoundException;
import com.complaintsystem.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final CategoryRepository categoryRepository;
    private final FeedbackRepository feedbackRepository;
    private final TicketRepository ticketRepository;

    public AdminService(UserRepository userRepository,
                        ComplaintRepository complaintRepository,
                        CategoryRepository categoryRepository,
                        FeedbackRepository feedbackRepository,
                        TicketRepository ticketRepository) {
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.categoryRepository = categoryRepository;
        this.feedbackRepository = feedbackRepository;
        this.ticketRepository = ticketRepository;
    }

    public DashboardDtos.AdminDashboardDto getDashboardStats() {
        DashboardDtos.AdminDashboardDto stats = new DashboardDtos.AdminDashboardDto();

        long total = complaintRepository.count();
        long pending = complaintRepository.countByStatus("PENDING");
        long inProgress = complaintRepository.countByStatus("IN_PROGRESS");
        long resolved = complaintRepository.countByStatus("RESOLVED");
        long closed = complaintRepository.countByStatus("CLOSED");
        long highPriority = complaintRepository.countByPriority("HIGH") + complaintRepository.countByPriority("CRITICAL");

        stats.setTotalComplaints(total);
        stats.setPendingComplaints(pending);
        stats.setInProgressComplaints(inProgress);
        stats.setResolvedComplaints(resolved);
        stats.setClosedComplaints(closed);
        stats.setHighPriorityComplaints(highPriority);
        stats.setTotalUsers(userRepository.countByRole("ROLE_USER"));

        double resolutionRate = total > 0 ? ((double) (resolved + closed) / total) * 100.0 : 0.0;
        stats.setResolutionRate(Math.round(resolutionRate * 10.0) / 10.0);

        Double avgRating = feedbackRepository.getAverageRating();
        stats.setAverageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);

        // Distributions
        Map<String, Long> statusMap = new HashMap<>();
        statusMap.put("PENDING", pending);
        statusMap.put("IN_PROGRESS", inProgress);
        statusMap.put("RESOLVED", resolved);
        statusMap.put("CLOSED", closed);
        stats.setStatusDistribution(statusMap);

        Map<String, Long> priorityMap = new HashMap<>();
        priorityMap.put("LOW", complaintRepository.countByPriority("LOW"));
        priorityMap.put("MEDIUM", complaintRepository.countByPriority("MEDIUM"));
        priorityMap.put("HIGH", complaintRepository.countByPriority("HIGH"));
        priorityMap.put("CRITICAL", complaintRepository.countByPriority("CRITICAL"));
        stats.setPriorityDistribution(priorityMap);

        Map<String, Long> sentimentMap = new HashMap<>();
        sentimentMap.put("POSITIVE", complaintRepository.countBySentiment("POSITIVE"));
        sentimentMap.put("NEUTRAL", complaintRepository.countBySentiment("NEUTRAL"));
        sentimentMap.put("NEGATIVE", complaintRepository.countBySentiment("NEGATIVE"));
        sentimentMap.put("VERY_NEGATIVE", complaintRepository.countBySentiment("VERY_NEGATIVE"));
        stats.setSentimentDistribution(sentimentMap);

        Map<String, Long> categoryMap = new HashMap<>();
        categoryRepository.findAll().forEach(cat -> {
            long count = complaintRepository.findByCategoryIdOrderByCreatedAtDesc(cat.getId()).size();
            categoryMap.put(cat.getName(), count);
        });
        stats.setCategoryDistribution(categoryMap);

        // Recent 5 complaints
        List<Complaint> recents = complaintRepository.findAllByOrderByCreatedAtDesc();
        List<ComplaintDtos.ComplaintResponse> recentResponses = recents.stream()
                .limit(5)
                .map(this::mapToComplaintResponse)
                .collect(Collectors.toList());
        stats.setRecentComplaints(recentResponses);

        return stats;
    }

    public List<UserProfileDto> getAllUsers() {
        return userRepository.findAll().stream().map(user -> {
            UserProfileDto dto = new UserProfileDto();
            dto.setId(user.getId());
            dto.setName(user.getName());
            dto.setEmail(user.getEmail());
            dto.setRole(user.getRole());
            dto.setPhone(user.getPhone());
            dto.setDepartment(user.getDepartment());
            dto.setAvatarUrl(user.getAvatarUrl());
            dto.setStatus(user.getStatus());
            dto.setCreatedAt(user.getCreatedAt());
            dto.setTotalComplaints(complaintRepository.countByUserId(user.getId()));
            return dto;
        }).collect(Collectors.toList());
    }

    public void updateUserStatus(Long userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setStatus(status);
        userRepository.save(user);
    }

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream().map(c -> {
            long count = complaintRepository.findByCategoryIdOrderByCreatedAtDesc(c.getId()).size();
            return new CategoryDto(c.getId(), c.getName(), c.getDescription(), c.getSlaHours(), c.getIcon(), c.getIsActive(), count);
        }).collect(Collectors.toList());
    }

    public CategoryDto createCategory(CategoryDto dto) {
        if (categoryRepository.findByName(dto.getName()).isPresent()) {
            throw new BadRequestException("Category with name '" + dto.getName() + "' already exists");
        }
        Category cat = new Category(dto.getName(), dto.getDescription(), dto.getSlaHours(), dto.getIcon());
        Category saved = categoryRepository.save(cat);
        return new CategoryDto(saved.getId(), saved.getName(), saved.getDescription(), saved.getSlaHours(), saved.getIcon(), saved.getIsActive(), 0);
    }

    public CategoryDto updateCategory(Long id, CategoryDto dto) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        cat.setName(dto.getName());
        cat.setDescription(dto.getDescription());
        cat.setSlaHours(dto.getSlaHours());
        if (dto.getIcon() != null) cat.setIcon(dto.getIcon());
        if (dto.getIsActive() != null) cat.setIsActive(dto.getIsActive());
        Category saved = categoryRepository.save(cat);
        long count = complaintRepository.findByCategoryIdOrderByCreatedAtDesc(saved.getId()).size();
        return new CategoryDto(saved.getId(), saved.getName(), saved.getDescription(), saved.getSlaHours(), saved.getIcon(), saved.getIsActive(), count);
    }

    public void deleteCategory(Long id) {
        if (!complaintRepository.findByCategoryIdOrderByCreatedAtDesc(id).isEmpty()) {
            throw new BadRequestException("Cannot delete category because it has linked complaints. Deactivate it instead.");
        }
        categoryRepository.deleteById(id);
    }

    private ComplaintDtos.ComplaintResponse mapToComplaintResponse(Complaint c) {
        ComplaintDtos.ComplaintResponse res = new ComplaintDtos.ComplaintResponse();
        res.setId(c.getId());
        res.setComplaintNumber(c.getComplaintNumber());
        res.setTitle(c.getTitle());
        res.setDescription(c.getDescription());
        res.setUserId(c.getUser().getId());
        res.setUserName(c.getUser().getName());
        res.setUserEmail(c.getUser().getEmail());
        res.setCategoryId(c.getCategory().getId());
        res.setCategoryName(c.getCategory().getName());
        if (c.getAssignedAdmin() != null) {
            res.setAssignedAdminId(c.getAssignedAdmin().getId());
            res.setAssignedAdminName(c.getAssignedAdmin().getName());
        }
        res.setPriority(c.getPriority());
        res.setStatus(c.getStatus());
        res.setSentiment(c.getSentiment());
        res.setSentimentScore(c.getSentimentScore());
        res.setResolutionNotes(c.getResolutionNotes());
        res.setResolvedAt(c.getResolvedAt());
        res.setCreatedAt(c.getCreatedAt());
        res.setUpdatedAt(c.getUpdatedAt());

        ticketRepository.findByComplaintId(c.getId()).ifPresent(t -> res.setTicketNumber(t.getTicketNumber()));
        return res;
    }
}
