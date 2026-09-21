package com.complaintsystem.controller;

import com.complaintsystem.dto.AuthDtos;
import com.complaintsystem.entity.User;
import com.complaintsystem.repository.UserRepository;
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

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;

    public AdminAuthController(AuthenticationManager authenticationManager, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDtos.AuthResponse> adminLogin(@Valid @RequestBody AuthDtos.LoginRequest req,
                                                            HttpServletRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail().toLowerCase().trim(), req.getPassword())
            );

            // Verify ROLE_ADMIN
            boolean isAdmin = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(r -> r.equals("ROLE_ADMIN") || r.equals("ADMIN"));

            if (!isAdmin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                        AuthDtos.AuthResponse.error("Access denied. This account does not have administrator privileges.")
                );
            }

            // Bind to HTTP session
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            HttpSession session = request.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

            User user = userRepository.findByEmail(req.getEmail().toLowerCase().trim()).orElse(null);

            AuthDtos.AuthResponse response = new AuthDtos.AuthResponse(
                    true,
                    "Admin authentication successful",
                    "ADMIN",
                    "/admin/dashboard",
                    user != null ? user.getId() : null,
                    user != null ? user.getName() : "Administrator",
                    req.getEmail()
            );

            return ResponseEntity.ok(response);

        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    AuthDtos.AuthResponse.error("Invalid administrator email or password")
            );
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthDtos.AuthResponse> adminLogout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        AuthDtos.AuthResponse res = new AuthDtos.AuthResponse();
        res.setSuccess(true);
        res.setMessage("Admin logged out successfully");
        res.setRedirectUrl("/admin/login");
        return ResponseEntity.ok(res);
    }
}
