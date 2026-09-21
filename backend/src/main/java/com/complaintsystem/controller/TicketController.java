package com.complaintsystem.controller;

import com.complaintsystem.entity.Ticket;
import com.complaintsystem.service.TicketService;
import com.complaintsystem.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/track/{ticketNumber}")
    public ResponseEntity<Ticket> trackTicket(@PathVariable String ticketNumber) {
        String email = SecurityUtils.getCurrentUserEmail().orElse(null);
        boolean isAdmin = SecurityUtils.hasRole("ROLE_ADMIN");
        return ResponseEntity.ok(ticketService.getTicketByNumber(ticketNumber, email, isAdmin));
    }

    @GetMapping("/complaint/{complaintId}")
    public ResponseEntity<Ticket> getTicketByComplaint(@PathVariable Long complaintId) {
        return ResponseEntity.ok(ticketService.getTicketByComplaintId(complaintId));
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<List<Ticket>> getMyTickets() {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new RuntimeException("Unauthenticated"));
        return ResponseEntity.ok(ticketService.getMyTickets(email));
    }
}
