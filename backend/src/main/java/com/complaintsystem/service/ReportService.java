package com.complaintsystem.service;

import com.complaintsystem.entity.Complaint;
import com.complaintsystem.repository.ComplaintRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReportService {

    private final ComplaintRepository complaintRepository;

    public ReportService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    public byte[] generateCsvReport(String status, String priority, Long categoryId, String search) {
        List<Complaint> complaints = complaintRepository.searchComplaintsAdmin(
                (status != null && !status.isEmpty()) ? status : null,
                (priority != null && !priority.isEmpty()) ? priority : null,
                categoryId,
                (search != null && !search.isEmpty()) ? search : null
        );

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out);

        // CSV Header
        writer.println("Complaint Number,Title,Category,Customer Name,Customer Email,Priority,Status,Sentiment,Score,Created At,Resolved At,Assigned Staff");

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        for (Complaint c : complaints) {
            String createdAt = c.getCreatedAt() != null ? c.getCreatedAt().format(dtf) : "";
            String resolvedAt = c.getResolvedAt() != null ? c.getResolvedAt().format(dtf) : "N/A";
            String staff = c.getAssignedAdmin() != null ? c.getAssignedAdmin().getName() : "Unassigned";

            writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%.2f\",\"%s\",\"%s\",\"%s\"%n",
                    c.getComplaintNumber(),
                    c.getTitle().replace("\"", "\"\""),
                    c.getCategory().getName().replace("\"", "\"\""),
                    c.getUser().getName().replace("\"", "\"\""),
                    c.getUser().getEmail(),
                    c.getPriority(),
                    c.getStatus(),
                    c.getSentiment(),
                    c.getSentimentScore() != null ? c.getSentimentScore() : 0.0,
                    createdAt,
                    resolvedAt,
                    staff.replace("\"", "\"\"")
            );
        }

        writer.flush();
        return out.toByteArray();
    }
}
