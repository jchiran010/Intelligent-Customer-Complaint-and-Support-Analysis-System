package com.complaintsystem.repository;

import com.complaintsystem.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByTicketNumber(String ticketNumber);
    Optional<Ticket> findByComplaintId(Long complaintId);
    List<Ticket> findByComplaintUserIdOrderByCreatedAtDesc(Long userId);
    long countByStatus(String status);
}
