package com.complaintsystem.service;

import com.complaintsystem.dto.AuthDtos;
import com.complaintsystem.dto.ComplaintDtos;
import com.complaintsystem.dto.DashboardDtos;
import com.complaintsystem.dto.UserProfileDto;
import com.complaintsystem.entity.Complaint;
import com.complaintsystem.entity.User;
import com.complaintsystem.exception.BadRequestException;
import com.complaintsystem.exception.ResourceNotFoundException;
import com.complaintsystem.repository.ComplaintRepository;
import com.complaintsystem.repository.NotificationRepository;
import com.complaintsystem.repository.TicketRepository;
import com.complaintsystem.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final NotificationRepository notificationRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       ComplaintRepository complaintRepository,
                       NotificationRepository notificationRepository,
                       TicketRepository ticketRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.notificationRepository = notificationRepository;
        this.ticketRepository = ticketRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public UserProfileDto getUserProfile(String email) {
        User user = getUserByEmail(email);
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
    }

    public UserProfileDto updateProfile(String email, UserProfileDto.UserUpdateRequest req) {
        User user = getUserByEmail(email);
        user.setName(req.getName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getDepartment() != null) user.setDepartment(req.getDepartment());
        if (req.getAvatarUrl() != null) user.setAvatarUrl(req.getAvatarUrl());
        User saved = userRepository.save(user);

        return getUserProfile(saved.getEmail());
    }

    public void changePassword(String email, AuthDtos.PasswordChangeRequest req) {
        User user = getUserByEmail(email);
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    public User registerUser(AuthDtos.RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }
        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole("ROLE_USER");
        user.setPhone(req.getPhone());
        user.setDepartment(req.getDepartment());
        user.setStatus("ACTIVE");
        return userRepository.save(user);
    }

    public DashboardDtos.UserDashboardDto getUserDashboardStats(String email) {
        User user = getUserByEmail(email);
        DashboardDtos.UserDashboardDto dto = new DashboardDtos.UserDashboardDto();
        dto.setUserName(user.getName());
        dto.setTotalComplaints(complaintRepository.countByUserId(user.getId()));
        dto.setPendingComplaints(complaintRepository.countByUserIdAndStatus(user.getId(), "PENDING"));
        dto.setInProgressComplaints(complaintRepository.countByUserIdAndStatus(user.getId(), "IN_PROGRESS"));
        dto.setResolvedComplaints(complaintRepository.countByUserIdAndStatus(user.getId(), "RESOLVED") +
                                  complaintRepository.countByUserIdAndStatus(user.getId(), "CLOSED"));
        dto.setUnreadNotificationsCount(notificationRepository.countByUserIdAndIsReadFalse(user.getId()));

        List<Complaint> myComplaints = complaintRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<ComplaintDtos.ComplaintResponse> recentResponses = myComplaints.stream()
                .limit(5)
                .map(this::mapToComplaintResponse)
                .collect(Collectors.toList());
        dto.setRecentComplaints(recentResponses);

        return dto;
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
