package com.complaintsystem.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        String uri = request.getRequestURI();
        String accept = request.getHeader("Accept");

        if (uri.startsWith("/api/") || (accept != null && accept.contains("application/json"))) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            Map<String, Object> data = new HashMap<>();
            data.put("success", false);
            data.put("status", 401);
            data.put("error", "Unauthorized");
            data.put("message", "Authentication required. Please log in.");
            data.put("path", uri);
            data.put("timestamp", LocalDateTime.now().toString());
            response.getWriter().write(objectMapper.writeValueAsString(data));
        } else {
            if (uri.startsWith("/admin")) {
                response.sendRedirect("/admin/login");
            } else {
                response.sendRedirect("/user/login");
            }
        }
    }
}
