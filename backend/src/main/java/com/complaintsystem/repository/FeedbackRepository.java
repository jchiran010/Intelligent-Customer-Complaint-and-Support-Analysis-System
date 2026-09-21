package com.complaintsystem.repository;

import com.complaintsystem.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Feedback> findByComplaintId(Long complaintId);
    List<Feedback> findAllByOrderByCreatedAtDesc();

    @Query("SELECT AVG(f.rating) FROM Feedback f")
    Double getAverageRating();
}
