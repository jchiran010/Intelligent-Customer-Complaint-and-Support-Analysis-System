package com.complaintsystem.config;

import com.complaintsystem.entity.*;
import com.complaintsystem.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ComplaintRepository complaintRepository;
    private final TicketRepository ticketRepository;
    private final FeedbackRepository feedbackRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ComplaintRepository complaintRepository,
                           TicketRepository ticketRepository,
                           FeedbackRepository feedbackRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.complaintRepository = complaintRepository;
        this.ticketRepository = ticketRepository;
        this.feedbackRepository = feedbackRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Initialize Users if not present
        User admin = userRepository.findByEmail("admin@complaintsystem.com").orElseGet(() -> {
            User u = new User();
            u.setName("System Administrator");
            u.setEmail("admin@complaintsystem.com");
            u.setPassword(passwordEncoder.encode("Admin@123"));
            u.setRole("ROLE_ADMIN");
            u.setDepartment("IT Administration");
            u.setPhone("+1-800-555-0100");
            u.setStatus("ACTIVE");
            return userRepository.save(u);
        });

        User staff = userRepository.findByEmail("sarah.support@complaintsystem.com").orElseGet(() -> {
            User u = new User();
            u.setName("Sarah Jenkins (Support Lead)");
            u.setEmail("sarah.support@complaintsystem.com");
            u.setPassword(passwordEncoder.encode("Admin@123"));
            u.setRole("ROLE_ADMIN");
            u.setDepartment("Customer Support");
            u.setPhone("+1-800-555-0101");
            u.setStatus("ACTIVE");
            return userRepository.save(u);
        });

        User userJohn = userRepository.findByEmail("john.doe@example.com").orElseGet(() -> {
            User u = new User();
            u.setName("John Doe");
            u.setEmail("john.doe@example.com");
            u.setPassword(passwordEncoder.encode("User@123"));
            u.setRole("ROLE_USER");
            u.setDepartment("Customer");
            u.setPhone("+1-555-0199");
            u.setStatus("ACTIVE");
            return userRepository.save(u);
        });

        User userJane = userRepository.findByEmail("jane.smith@example.com").orElseGet(() -> {
            User u = new User();
            u.setName("Jane Smith");
            u.setEmail("jane.smith@example.com");
            u.setPassword(passwordEncoder.encode("User@123"));
            u.setRole("ROLE_USER");
            u.setDepartment("Customer");
            u.setPhone("+1-555-0198");
            u.setStatus("ACTIVE");
            return userRepository.save(u);
        });

        // 2. Initialize Categories
        Category catBilling = categoryRepository.findByName("Billing & Payments").orElseGet(() ->
                categoryRepository.save(new Category("Billing & Payments", "Issues regarding invoices, overcharges, unauthorized deductions, and payment gateways.", 24, "bi-credit-card")));

        Category catTech = categoryRepository.findByName("Technical & System Glitches").orElseGet(() ->
                categoryRepository.save(new Category("Technical & System Glitches", "Software bugs, application crashes, service downtime, and feature malfunctions.", 12, "bi-cpu")));

        Category catLogistics = categoryRepository.findByName("Delivery & Logistics").orElseGet(() ->
                categoryRepository.save(new Category("Delivery & Logistics", "Late delivery, missing packages, damaged goods upon arrival, and courier tracking.", 48, "bi-truck")));

        Category catQuality = categoryRepository.findByName("Product Quality & Defects").orElseGet(() ->
                categoryRepository.save(new Category("Product Quality & Defects", "Defective hardware, broken seals, missing parts, or non-functional items.", 72, "bi-box-seam")));

        Category catService = categoryRepository.findByName("Customer Service & Staff").orElseGet(() ->
                categoryRepository.save(new Category("Customer Service & Staff", "Complaints regarding agent behavior, unhelpful responses, or long wait times.", 36, "bi-person-badge")));

        Category catSecurity = categoryRepository.findByName("Account & Security").orElseGet(() ->
                categoryRepository.save(new Category("Account & Security", "Account lockouts, MFA issues, credential resets, and privacy concerns.", 8, "bi-shield-lock")));

        // 3. Initialize Sample Complaints if none exist
        if (complaintRepository.count() == 0) {
            // Complaint 1
            Complaint c1 = new Complaint();
            c1.setComplaintNumber("CMP-2026-0001");
            c1.setTitle("Double debited for subscription invoice #9821");
            c1.setDescription("I was charged twice on September 15 for my monthly SaaS enterprise subscription. Kindly refund the duplicate $199 deduction immediately as this has affected our company petty cash.");
            c1.setUser(userJohn);
            c1.setCategory(catBilling);
            c1.setAssignedAdmin(admin);
            c1.setPriority("HIGH");
            c1.setStatus("IN_PROGRESS");
            c1.setSentiment("VERY_NEGATIVE");
            c1.setSentimentScore(-0.85);
            c1.setResolutionNotes("Under review by finance department.");
            c1 = complaintRepository.save(c1);

            Ticket t1 = new Ticket();
            t1.setTicketNumber("TCK-2026-0001");
            t1.setComplaint(c1);
            t1.setStatus("IN_REVIEW");
            t1.setAssignedTo("Finance Desk - System Admin");
            t1.setEstimatedResolution(LocalDateTime.now().plusHours(24));
            ticketRepository.save(t1);

            notificationRepository.save(new Notification(userJohn, "Complaint In Progress", "Your complaint CMP-2026-0001 is being investigated by our Finance team.", "INFO", "/user/complaint-details.html?id=" + c1.getId()));

            // Complaint 2
            Complaint c2 = new Complaint();
            c2.setComplaintNumber("CMP-2026-0002");
            c2.setTitle("Mobile app crashes on checkout page");
            c2.setDescription("Whenever I click Proceed to Payment on the Android app (version 4.2), the application crashes to the home screen without any error code. I have tried clearing cache.");
            c2.setUser(userJohn);
            c2.setCategory(catTech);
            c2.setAssignedAdmin(staff);
            c2.setPriority("HIGH");
            c2.setStatus("PENDING");
            c2.setSentiment("NEGATIVE");
            c2.setSentimentScore(-0.62);
            c2 = complaintRepository.save(c2);

            Ticket t2 = new Ticket();
            t2.setTicketNumber("TCK-2026-0002");
            t2.setComplaint(c2);
            t2.setStatus("OPEN");
            t2.setAssignedTo("Mobile Engineering Team");
            t2.setEstimatedResolution(LocalDateTime.now().plusHours(12));
            ticketRepository.save(t2);

            notificationRepository.save(new Notification(userJohn, "Ticket Generated", "Support Ticket TCK-2026-0002 has been opened for your checkout issue.", "SUCCESS", "/user/complaint-details.html?id=" + c2.getId()));

            // Complaint 3
            Complaint c3 = new Complaint();
            c3.setComplaintNumber("CMP-2026-0003");
            c3.setTitle("Package arrived with torn seals and missing accessories");
            c3.setDescription("Order #ORD-7741 was delivered today. The outer packaging was completely ripped open and the power adapter was missing from the box.");
            c3.setUser(userJane);
            c3.setCategory(catQuality);
            c3.setAssignedAdmin(staff);
            c3.setPriority("MEDIUM");
            c3.setStatus("RESOLVED");
            c3.setSentiment("NEGATIVE");
            c3.setSentimentScore(-0.71);
            c3.setResolutionNotes("Replacement adapter dispatched via express courier tracking #EXP-99214. $15 store credit issued.");
            c3.setResolvedAt(LocalDateTime.now().minusHours(4));
            c3 = complaintRepository.save(c3);

            Ticket t3 = new Ticket();
            t3.setTicketNumber("TCK-2026-0003");
            t3.setComplaint(c3);
            t3.setStatus("RESOLVED");
            t3.setAssignedTo("Logistics Support - Sarah Jenkins");
            ticketRepository.save(t3);

            feedbackRepository.save(new Feedback(c3, userJane, 5, "Quick resolution! The replacement power adapter was shipped immediately. Appreciate the great support."));
            notificationRepository.save(new Notification(userJane, "Complaint Resolved", "Your complaint CMP-2026-0003 regarding order #ORD-7741 has been resolved.", "SUCCESS", "/user/complaint-details.html?id=" + c3.getId()));

            // Complaint 4
            Complaint c4 = new Complaint();
            c4.setComplaintNumber("CMP-2026-0004");
            c4.setTitle("Inquiry regarding corporate discount tier update");
            c4.setDescription("Our contract renewal is coming up next month and we wanted to confirm if the 20% team tier discount is still active on our profile.");
            c4.setUser(userJane);
            c4.setCategory(catBilling);
            c4.setAssignedAdmin(admin);
            c4.setPriority("LOW");
            c4.setStatus("CLOSED");
            c4.setSentiment("POSITIVE");
            c4.setSentimentScore(0.65);
            c4.setResolutionNotes("Confirmed with sales manager that 20% tier is locked in for the upcoming annual cycle.");
            c4.setResolvedAt(LocalDateTime.now().minusHours(24));
            c4 = complaintRepository.save(c4);

            Ticket t4 = new Ticket();
            t4.setTicketNumber("TCK-2026-0004");
            t4.setComplaint(c4);
            t4.setStatus("CLOSED");
            t4.setAssignedTo("Billing Desk - System Admin");
            ticketRepository.save(t4);

            feedbackRepository.save(new Feedback(c4, userJane, 4, "Fast answer to our billing contract inquiry. Thank you!"));

            // Complaint 5
            Complaint c5 = new Complaint();
            c5.setComplaintNumber("CMP-2026-0005");
            c5.setTitle("Unable to reset two-factor authentication after phone lost");
            c5.setDescription("I lost my work phone yesterday and need to reset Google Authenticator for my company portal account. Please verify my identity and assist immediately.");
            c5.setUser(userJohn);
            c5.setCategory(catSecurity);
            c5.setAssignedAdmin(admin);
            c5.setPriority("CRITICAL");
            c5.setStatus("IN_PROGRESS");
            c5.setSentiment("NEGATIVE");
            c5.setSentimentScore(-0.55);
            c5.setResolutionNotes("Identity verification initiated via secondary contact phone.");
            c5 = complaintRepository.save(c5);

            Ticket t5 = new Ticket();
            t5.setTicketNumber("TCK-2026-0005");
            t5.setComplaint(c5);
            t5.setStatus("ASSIGNED");
            t5.setAssignedTo("Security Response Team");
            ticketRepository.save(t5);

            notificationRepository.save(new Notification(admin, "Critical Complaint Alert", "New CRITICAL priority complaint CMP-2026-0005 has been lodged for Account & Security.", "ALERT", "/admin/complaint-details.html?id=" + c5.getId()));
        }
    }
}
