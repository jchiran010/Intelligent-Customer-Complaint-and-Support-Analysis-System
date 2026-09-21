package com.complaintsystem.controller;

import com.complaintsystem.dto.AuthDtos;
import com.complaintsystem.entity.User;
import com.complaintsystem.service.UserService;
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
@RequestMapping("/api/user")
public class UserAuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    public UserAuthController(AuthenticationManager authenticationManager, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDtos.AuthResponse> userLogin(@Valid @RequestBody AuthDtos.LoginRequest req,
                                                           HttpServletRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail().toLowerCase().trim(), req.getPassword())
            );

            boolean isUser = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(r -> r.equals("ROLE_USER") || r.equals("USER"));

            // If an Admin logs in through User login, they can still be handled or directed properly
            String role = isUser ? "USER" : "ADMIN";
            String redirectUrl = isUser ? "/user/dashboard" : "/admin/dashboard";

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            HttpSession session = request.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

            User user = userService.getUserByEmail(req.getEmail().toLowerCase().trim());

            AuthDtos.AuthResponse response = new AuthDtos.AuthResponse(
                    true,
                    "Login successful",
                    role,
                    redirectUrl,
                    user.getId(),
                    user.getName(),
                    user.getEmail()
            );

            return ResponseEntity.ok(response);

        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    AuthDtos.AuthResponse.error("Invalid email or password")
            );
        }
    }

    @PostMapping("/register")
    public ResponseEntity<AuthDtos.AuthResponse> userRegister(@Valid @RequestBody AuthDtos.RegisterRequest req) {
        User user = userService.registerUser(req);
        AuthDtos.AuthResponse response = new AuthDtos.AuthResponse(
                true,
                "Registration successful! Please log in with your credentials.",
                "USER",
                "/user/login",
                user.getId(),
                user.getName(),
                user.getEmail()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthDtos.AuthResponse> userLogout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        AuthDtos.AuthResponse res = new AuthDtos.AuthResponse();
        res.setSuccess(true);
        res.setMessage("Logged out successfully");
        res.setRedirectUrl("/user/login");
        return ResponseEntity.ok(res);
    }
}
