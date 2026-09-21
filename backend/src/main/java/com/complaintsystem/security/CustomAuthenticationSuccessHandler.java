package com.complaintsystem.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(r -> r.equals("ROLE_ADMIN") || r.equals("ADMIN"));

        String redirectUrl = isAdmin ? "/admin/dashboard" : "/user/dashboard";

        String acceptHeader = request.getHeader("Accept");
        String requestedWith = request.getHeader("X-Requested-With");

        if ((acceptHeader != null && acceptHeader.contains("application/json")) ||
                "XMLHttpRequest".equalsIgnoreCase(requestedWith)) {
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            Map<String, Object> data = new HashMap<>();
            data.put("success", true);
            data.put("role", isAdmin ? "ADMIN" : "USER");
            data.put("redirectUrl", redirectUrl);
            data.put("message", "Authentication successful");
            response.getWriter().write(objectMapper.writeValueAsString(data));
        } else {
            response.sendRedirect(redirectUrl);
        }
    }
}
