package com.complaintsystem.repository;

import com.complaintsystem.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    
    // User-specific queries (strict ownership enforcement)
    List<Complaint> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Complaint> findByIdAndUserId(Long id, Long userId);
    Optional<Complaint> findByComplaintNumberAndUserId(String complaintNumber, Long userId);
    long countByUserId(Long userId);
    long countByUserIdAndStatus(Long userId, String status);

    // Global queries (Admin access)
    Optional<Complaint> findByComplaintNumber(String complaintNumber);
    List<Complaint> findAllByOrderByCreatedAtDesc();
    List<Complaint> findByStatusOrderByCreatedAtDesc(String status);
    List<Complaint> findByPriorityOrderByCreatedAtDesc(String priority);
    List<Complaint> findByCategoryIdOrderByCreatedAtDesc(Long categoryId);
    
    long countByStatus(String status);
    long countByPriority(String priority);
    long countBySentiment(String sentiment);

    // Filter and search
    @Query("SELECT c FROM Complaint c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:priority IS NULL OR c.priority = :priority) AND " +
           "(:categoryId IS NULL OR c.category.id = :categoryId) AND " +
           "(:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.complaintNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY c.createdAt DESC")
    List<Complaint> searchComplaintsAdmin(
            @Param("status") String status,
            @Param("priority") String priority,
            @Param("categoryId") Long categoryId,
            @Param("search") String search);

    @Query("SELECT c FROM Complaint c WHERE c.user.id = :userId AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.complaintNumber) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY c.createdAt DESC")
    List<Complaint> searchComplaintsUser(
            @Param("userId") Long userId,
            @Param("status") String status,
            @Param("search") String search);
}
