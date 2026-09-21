package com.complaintsystem.service;

import com.complaintsystem.dto.ComplaintDtos;
import com.complaintsystem.entity.*;
import com.complaintsystem.exception.BadRequestException;
import com.complaintsystem.exception.ResourceNotFoundException;
import com.complaintsystem.exception.UnauthorizedException;
import com.complaintsystem.repository.*;
import com.complaintsystem.util.SentimentAnalyzerUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TicketRepository ticketRepository;
    private final NotificationRepository notificationRepository;

    public ComplaintService(ComplaintRepository complaintRepository,
                            UserRepository userRepository,
                            CategoryRepository categoryRepository,
                            TicketRepository ticketRepository,
                            NotificationRepository notificationRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.ticketRepository = ticketRepository;
        this.notificationRepository = notificationRepository;
    }

    // ==========================================
    // USER-SPECIFIC OPERATIONS (Strict Ownership)
    // ==========================================

    public ComplaintDtos.ComplaintResponse createComplaint(ComplaintDtos.ComplaintCreateRequest req, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + req.getCategoryId()));

        // INTELLIGENT SENTIMENT & PRIORITY ANALYSIS
        SentimentAnalyzerUtil.AnalysisResult analysis = SentimentAnalyzerUtil.analyze(req.getTitle(), req.getDescription());

        Complaint complaint = new Complaint();
        complaint.setTitle(req.getTitle().trim());
        complaint.setDescription(req.getDescription().trim());
        complaint.setUser(user);
        complaint.setCategory(category);
        complaint.setStatus("PENDING");

        // Set Sentiment
        complaint.setSentiment(analysis.getSentiment());
        complaint.setSentimentScore(analysis.getScore());

        // Set Priority (User selected or intelligent recommendation)
        if (req.getPriority() != null && !req.getPriority().trim().isEmpty()) {
            complaint.setPriority(req.getPriority().toUpperCase());
        } else {
            complaint.setPriority(analysis.getRecommendedPriority());
        }

        // Generate unique complaint number
        String complaintNumber = "CMP-" + Year.now().getValue() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        complaint.setComplaintNumber(complaintNumber);

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Automatically generate Support Ticket
        Ticket ticket = new Ticket();
        ticket.setTicketNumber("TCK-" + Year.now().getValue() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        ticket.setComplaint(savedComplaint);
        ticket.setStatus("OPEN");
        ticket.setEstimatedResolution(LocalDateTime.now().plusHours(category.getSlaHours()));
        ticketRepository.save(ticket);

        // Create User Notification
        Notification userNotif = new Notification(
                user,
                "Complaint Filed: " + complaintNumber,
                "Your complaint '" + savedComplaint.getTitle() + "' has been successfully lodged and assigned ticket " + ticket.getTicketNumber() + ".",
                "SUCCESS",
                "/user/complaint-details.html?id=" + savedComplaint.getId()
        );
        notificationRepository.save(userNotif);

        // If Critical or Very Negative, alert Admins
        if ("CRITICAL".equals(savedComplaint.getPriority()) || "VERY_NEGATIVE".equals(savedComplaint.getSentiment())) {
            List<User> admins = userRepository.findByRole("ROLE_ADMIN");
            for (User admin : admins) {
                Notification adminNotif = new Notification(
                        admin,
                        "URGENT Complaint Alert: " + complaintNumber,
                        "High severity / negative sentiment complaint filed by " + user.getName() + " in " + category.getName() + ".",
                        "ALERT",
                        "/admin/complaint-details.html?id=" + savedComplaint.getId()
                );
                notificationRepository.save(adminNotif);
            }
        }

        return mapToResponse(savedComplaint, ticket.getTicketNumber());
    }

    public List<ComplaintDtos.ComplaintResponse> getMyComplaints(String userEmail, String status, String search) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        List<Complaint> complaints = complaintRepository.searchComplaintsUser(user.getId(), 
                (status != null && !status.isEmpty()) ? status : null, 
                (search != null && !search.isEmpty()) ? search.trim() : null);

        return complaints.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ComplaintDtos.ComplaintResponse getMyComplaintDetails(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        // STRICT OWNERSHIP ENFORCEMENT: User can ONLY see their own complaint
        if (!complaint.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Access denied: You do not own this complaint.");
        }

        return mapToResponse(complaint);
    }

    // ==========================================
    // ADMIN-SPECIFIC OPERATIONS (Full Access)
    // ==========================================

    public List<ComplaintDtos.ComplaintResponse> getAllComplaintsAdmin(String status, String priority, Long categoryId, String search) {
        List<Complaint> complaints = complaintRepository.searchComplaintsAdmin(
                (status != null && !status.isEmpty()) ? status : null,
                (priority != null && !priority.isEmpty()) ? priority : null,
                categoryId,
                (search != null && !search.isEmpty()) ? search.trim() : null
        );

        return complaints.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ComplaintDtos.ComplaintResponse getComplaintDetailsAdmin(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
        return mapToResponse(complaint);
    }

    public ComplaintDtos.ComplaintResponse updateStatus(Long id, ComplaintDtos.StatusUpdateRequest req, String adminEmail) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        String oldStatus = complaint.getStatus();
        complaint.setStatus(req.getStatus().toUpperCase());
        if (req.getResolutionNotes() != null) {
            complaint.setResolutionNotes(req.getResolutionNotes().trim());
        }
        if ("RESOLVED".equalsIgnoreCase(req.getStatus()) || "CLOSED".equalsIgnoreCase(req.getStatus())) {
            complaint.setResolvedAt(LocalDateTime.now());
        }

        Complaint saved = complaintRepository.save(complaint);

        // Update linked ticket
        ticketRepository.findByComplaintId(complaint.getId()).ifPresent(ticket -> {
            if ("RESOLVED".equalsIgnoreCase(req.getStatus())) {
                ticket.setStatus("RESOLVED");
            } else if ("CLOSED".equalsIgnoreCase(req.getStatus())) {
                ticket.setStatus("CLOSED");
            } else if ("IN_PROGRESS".equalsIgnoreCase(req.getStatus())) {
                ticket.setStatus("IN_REVIEW");
            }
            ticketRepository.save(ticket);
        });

        // Notify user about status change
        Notification notif = new Notification(
                complaint.getUser(),
                "Complaint Status Updated: " + complaint.getComplaintNumber(),
                "Status updated from " + oldStatus + " to " + saved.getStatus() + "." +
                        (req.getResolutionNotes() != null ? " Notes: " + req.getResolutionNotes() : ""),
                "INFO",
                "/user/complaint-details.html?id=" + complaint.getId()
        );
        notificationRepository.save(notif);

        return mapToResponse(saved);
    }

    public ComplaintDtos.ComplaintResponse updatePriority(Long id, String priority) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        complaint.setPriority(priority.toUpperCase());
        Complaint saved = complaintRepository.save(complaint);
        return mapToResponse(saved);
    }

    public ComplaintDtos.ComplaintResponse assignStaff(Long id, Long adminId) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        User staff = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with id: " + adminId));

        complaint.setAssignedAdmin(staff);
        if ("PENDING".equals(complaint.getStatus())) {
            complaint.setStatus("IN_PROGRESS");
        }
        Complaint saved = complaintRepository.save(complaint);

        ticketRepository.findByComplaintId(complaint.getId()).ifPresent(ticket -> {
            ticket.setAssignedTo(staff.getName() + " (" + staff.getDepartment() + ")");
            ticket.setStatus("ASSIGNED");
            ticketRepository.save(ticket);
        });

        // Notify assigned staff
        Notification staffNotif = new Notification(
                staff,
                "Assigned Complaint: " + complaint.getComplaintNumber(),
                "You have been assigned to handle complaint '" + complaint.getTitle() + "'.",
                "INFO",
                "/admin/complaint-details.html?id=" + complaint.getId()
        );
        notificationRepository.save(staffNotif);

        return mapToResponse(saved);
    }

    private ComplaintDtos.ComplaintResponse mapToResponse(Complaint c) {
        return mapToResponse(c, null);
    }

    private ComplaintDtos.ComplaintResponse mapToResponse(Complaint c, String ticketNumber) {
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

        if (ticketNumber != null) {
            res.setTicketNumber(ticketNumber);
        } else {
            ticketRepository.findByComplaintId(c.getId()).ifPresent(t -> res.setTicketNumber(t.getTicketNumber()));
        }

        return res;
    }
}
