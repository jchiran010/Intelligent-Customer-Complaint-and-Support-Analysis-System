package com.complaintsystem.service;

import com.complaintsystem.entity.Ticket;
import com.complaintsystem.entity.User;
import com.complaintsystem.exception.ResourceNotFoundException;
import com.complaintsystem.exception.UnauthorizedException;
import com.complaintsystem.repository.TicketRepository;
import com.complaintsystem.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public Ticket getTicketByNumber(String ticketNumber, String userEmail, boolean isAdmin) {
        Ticket ticket = ticketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketNumber));

        if (!isAdmin) {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));
            if (!ticket.getComplaint().getUser().getId().equals(user.getId())) {
                throw new UnauthorizedException("You are not authorized to view this ticket.");
            }
        }

        return ticket;
    }

    public Ticket getTicketByComplaintId(Long complaintId) {
        return ticketRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found for complaint id: " + complaintId));
    }

    public List<Ticket> getMyTickets(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));
        return ticketRepository.findByComplaintUserIdOrderByCreatedAtDesc(user.getId());
    }
}
