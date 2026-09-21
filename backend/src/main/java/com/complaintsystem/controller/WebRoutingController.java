package com.complaintsystem.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Controller
public class WebRoutingController {

    private Path getFrontendPath() {
        File direct = new File("frontend");
        if (direct.exists()) {
            return direct.toPath().toAbsolutePath();
        }
        File parent = new File("../frontend");
        if (parent.exists()) {
            return parent.toPath().toAbsolutePath();
        }
        return Paths.get("frontend").toAbsolutePath();
    }

    private ResponseEntity<Resource> serveHtml(String relativePath) {
        Path path = getFrontendPath().resolve(relativePath).normalize();
        Resource resource = new FileSystemResource(path.toFile());
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }

    // ==========================================
    // UNIFIED HOMEPAGE & PORTAL HUB
    // ==========================================

    @GetMapping({"/", "/index.html"})
    @ResponseBody
    public ResponseEntity<Resource> unifiedHome() {
        return serveHtml("index.html");
    }

    @GetMapping({"/login", "/login.html"})
    @ResponseBody
    public ResponseEntity<Resource> unifiedLogin() {
        return serveHtml("login.html");
    }

    @GetMapping({"/app", "/app.html"})
    @ResponseBody
    public ResponseEntity<Resource> unifiedApp() {
        return serveHtml("app.html");
    }

    // ==========================================
    // ADMIN PORTAL STANDALONE PAGES
    // ==========================================

    @GetMapping({"/admin/login", "/admin/login.html"})
    @ResponseBody
    public ResponseEntity<Resource> adminLogin() {
        return serveHtml("admin/login.html");
    }

    @GetMapping({"/admin/dashboard", "/admin/dashboard.html"})
    @ResponseBody
    public ResponseEntity<Resource> adminDashboard() {
        return serveHtml("admin/dashboard.html");
    }

    @GetMapping({"/admin/complaints", "/admin/complaints.html"})
    @ResponseBody
    public ResponseEntity<Resource> adminComplaints() {
        return serveHtml("admin/complaints.html");
    }

    @GetMapping({"/admin/complaint-details", "/admin/complaint-details.html"})
    @ResponseBody
    public ResponseEntity<Resource> adminComplaintDetails() {
        return serveHtml("admin/complaint-details.html");
    }

    @GetMapping({"/admin/users", "/admin/users.html"})
    @ResponseBody
    public ResponseEntity<Resource> adminUsers() {
        return serveHtml("admin/users.html");
    }

    @GetMapping({"/admin/categories", "/admin/categories.html"})
    @ResponseBody
    public ResponseEntity<Resource> adminCategories() {
        return serveHtml("admin/categories.html");
    }

    @GetMapping({"/admin/analytics", "/admin/analytics.html"})
    @ResponseBody
    public ResponseEntity<Resource> adminAnalytics() {
        return serveHtml("admin/analytics.html");
    }

    @GetMapping({"/admin/reports", "/admin/reports.html"})
    @ResponseBody
    public ResponseEntity<Resource> adminReports() {
        return serveHtml("admin/reports.html");
    }

    @GetMapping({"/admin/notifications", "/admin/notifications.html"})
    @ResponseBody
    public ResponseEntity<Resource> adminNotifications() {
        return serveHtml("admin/notifications.html");
    }

    @GetMapping({"/admin/settings", "/admin/settings.html"})
    @ResponseBody
    public ResponseEntity<Resource> adminSettings() {
        return serveHtml("admin/settings.html");
    }

    // ==========================================
    // USER PORTAL STANDALONE PAGES
    // ==========================================

    @GetMapping({"/user/login", "/user/login.html"})
    @ResponseBody
    public ResponseEntity<Resource> userLogin() {
        return serveHtml("user/login.html");
    }

    @GetMapping({"/user/register", "/user/register.html"})
    @ResponseBody
    public ResponseEntity<Resource> userRegister() {
        return serveHtml("user/register.html");
    }

    @GetMapping({"/user/forgot-password", "/user/forgot-password.html"})
    @ResponseBody
    public ResponseEntity<Resource> userForgotPassword() {
        return serveHtml("user/forgot-password.html");
    }

    @GetMapping({"/user/dashboard", "/user/dashboard.html"})
    @ResponseBody
    public ResponseEntity<Resource> userDashboard() {
        return serveHtml("user/dashboard.html");
    }

    @GetMapping({"/user/submit-complaint", "/user/submit-complaint.html"})
    @ResponseBody
    public ResponseEntity<Resource> userSubmitComplaint() {
        return serveHtml("user/submit-complaint.html");
    }

    @GetMapping({"/user/my-complaints", "/user/my-complaints.html"})
    @ResponseBody
    public ResponseEntity<Resource> userMyComplaints() {
        return serveHtml("user/my-complaints.html");
    }

    @GetMapping({"/user/complaint-details", "/user/complaint-details.html"})
    @ResponseBody
    public ResponseEntity<Resource> userComplaintDetails() {
        return serveHtml("user/complaint-details.html");
    }

    @GetMapping({"/user/notifications", "/user/notifications.html"})
    @ResponseBody
    public ResponseEntity<Resource> userNotifications() {
        return serveHtml("user/notifications.html");
    }

    @GetMapping({"/user/feedback", "/user/feedback.html"})
    @ResponseBody
    public ResponseEntity<Resource> userFeedback() {
        return serveHtml("user/feedback.html");
    }

    @GetMapping({"/user/profile", "/user/profile.html"})
    @ResponseBody
    public ResponseEntity<Resource> userProfile() {
        return serveHtml("user/profile.html");
    }

    @GetMapping({"/user/settings", "/user/settings.html"})
    @ResponseBody
    public ResponseEntity<Resource> userSettings() {
        return serveHtml("user/settings.html");
    }
}
