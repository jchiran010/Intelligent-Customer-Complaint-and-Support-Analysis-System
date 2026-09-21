package com.complaintsystem.controller;

import com.complaintsystem.dto.AuthDtos;
import com.complaintsystem.entity.User;
import com.complaintsystem.repository.UserRepository;
import com.complaintsystem.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class UnifiedAuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;

    public UnifiedAuthController(AuthenticationManager authenticationManager, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDtos.AuthResponse> unifiedLogin(@Valid @RequestBody AuthDtos.LoginRequest req,
                                                              HttpServletRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail().toLowerCase().trim(), req.getPassword())
            );

            boolean isAdmin = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(r -> r.equals("ROLE_ADMIN") || r.equals("ADMIN"));

            String role = isAdmin ? "ADMIN" : "USER";

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            HttpSession session = request.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

            User user = userRepository.findByEmail(req.getEmail().toLowerCase().trim()).orElse(null);

            AuthDtos.AuthResponse response = new AuthDtos.AuthResponse(
                    true,
                    "Login successful as " + (isAdmin ? "Administrator" : "Customer"),
                    role,
                    "/app.html",
                    user != null ? user.getId() : null,
                    user != null ? user.getName() : "User",
                    req.getEmail()
            );

            return ResponseEntity.ok(response);

        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    AuthDtos.AuthResponse.error("Invalid email or password")
            );
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        return SecurityUtils.getCurrentUserEmail()
                .flatMap(userRepository::findByEmail)
                .map(user -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("authenticated", true);
                    data.put("id", user.getId());
                    data.put("name", user.getName());
                    data.put("email", user.getEmail());
                    data.put("role", user.getRole().replace("ROLE_", ""));
                    data.put("phone", user.getPhone());
                    data.put("department", user.getDepartment());
                    data.put("status", user.getStatus());
                    return ResponseEntity.ok(data);
                })
                .orElseGet(() -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("authenticated", false);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(data);
                });
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> unifiedLogout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Logged out successfully");
        res.put("redirectUrl", "/login.html");
        return ResponseEntity.ok(res);
    }
}
