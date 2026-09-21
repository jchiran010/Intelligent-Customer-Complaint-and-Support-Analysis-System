package com.complaintsystem.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {

        String uri = request.getRequestURI();
        String accept = request.getHeader("Accept");

        if (uri.startsWith("/api/") || (accept != null && accept.contains("application/json"))) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            Map<String, Object> data = new HashMap<>();
            data.put("success", false);
            data.put("status", 403);
            data.put("error", "Forbidden");
            data.put("message", "Access denied. You do not have permission to access this resource.");
            data.put("path", uri);
            data.put("timestamp", LocalDateTime.now().toString());
            response.getWriter().write(objectMapper.writeValueAsString(data));
        } else {
            if (uri.startsWith("/admin")) {
                response.sendRedirect("/admin/login?error=access_denied");
            } else {
                response.sendRedirect("/user/login?error=access_denied");
            }
        }
    }
}
