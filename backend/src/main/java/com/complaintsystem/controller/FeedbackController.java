package com.complaintsystem.controller;

import com.complaintsystem.dto.FeedbackDto;
import com.complaintsystem.service.FeedbackService;
import com.complaintsystem.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<FeedbackDto.FeedbackResponse> submitFeedback(@Valid @RequestBody FeedbackDto.FeedbackRequest req) {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new RuntimeException("Unauthenticated"));
        return ResponseEntity.status(HttpStatus.CREATED).body(feedbackService.submitFeedback(req, email));
    }

    @GetMapping("/my-feedback")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<FeedbackDto.FeedbackResponse>> getMyFeedback() {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new RuntimeException("Unauthenticated"));
        return ResponseEntity.ok(feedbackService.getMyFeedbacks(email));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackDto.FeedbackResponse>> getAllFeedback() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }
}
