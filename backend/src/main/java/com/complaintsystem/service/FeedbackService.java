package com.complaintsystem.service;

import com.complaintsystem.dto.FeedbackDto;
import com.complaintsystem.entity.Complaint;
import com.complaintsystem.entity.Feedback;
import com.complaintsystem.entity.Notification;
import com.complaintsystem.entity.User;
import com.complaintsystem.exception.BadRequestException;
import com.complaintsystem.exception.ResourceNotFoundException;
import com.complaintsystem.exception.UnauthorizedException;
import com.complaintsystem.repository.ComplaintRepository;
import com.complaintsystem.repository.FeedbackRepository;
import com.complaintsystem.repository.NotificationRepository;
import com.complaintsystem.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public FeedbackService(FeedbackRepository feedbackRepository,
                           ComplaintRepository complaintRepository,
                           UserRepository userRepository,
                           NotificationRepository notificationRepository) {
        this.feedbackRepository = feedbackRepository;
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    public FeedbackDto.FeedbackResponse submitFeedback(FeedbackDto.FeedbackRequest req, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Complaint complaint = complaintRepository.findById(req.getComplaintId())
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + req.getComplaintId()));

        if (!complaint.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You can only submit feedback for your own complaints.");
        }

        if (feedbackRepository.findByComplaintId(complaint.getId()).isPresent()) {
            throw new BadRequestException("Feedback has already been submitted for this complaint.");
        }

        Feedback feedback = new Feedback(complaint, user, req.getRating(), req.getComments());
        Feedback saved = feedbackRepository.save(feedback);

        // Alert admin about customer feedback
        List<User> admins = userRepository.findByRole("ROLE_ADMIN");
        for (User admin : admins) {
            Notification adminNotif = new Notification(
                    admin,
                    "New Customer Feedback: " + complaint.getComplaintNumber(),
                    user.getName() + " gave a " + req.getRating() + "-star rating for complaint " + complaint.getComplaintNumber() + ".",
                    "INFO",
                    "/admin/complaint-details.html?id=" + complaint.getId()
            );
            notificationRepository.save(adminNotif);
        }

        return mapToResponse(saved);
    }

    public List<FeedbackDto.FeedbackResponse> getAllFeedbacks() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<FeedbackDto.FeedbackResponse> getMyFeedbacks(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));
        return feedbackRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private FeedbackDto.FeedbackResponse mapToResponse(Feedback f) {
        FeedbackDto.FeedbackResponse res = new FeedbackDto.FeedbackResponse();
        res.setId(f.getId());
        res.setComplaintId(f.getComplaint().getId());
        res.setComplaintNumber(f.getComplaint().getComplaintNumber());
        res.setComplaintTitle(f.getComplaint().getTitle());
        res.setUserId(f.getUser().getId());
        res.setUserName(f.getUser().getName());
        res.setRating(f.getRating());
        res.setComments(f.getComments());
        res.setCreatedAt(f.getCreatedAt());
        return res;
    }
}
