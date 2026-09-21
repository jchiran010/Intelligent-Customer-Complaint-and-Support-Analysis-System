package com.complaintsystem.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final CustomAuthenticationSuccessHandler successHandler;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;

    public SecurityConfig(CustomUserDetailsService userDetailsService,
                          CustomAuthenticationSuccessHandler successHandler,
                          CustomAccessDeniedHandler accessDeniedHandler,
                          CustomAuthenticationEntryPoint authenticationEntryPoint) {
        this.userDetailsService = userDetailsService;
        this.successHandler = successHandler;
        this.accessDeniedHandler = accessDeniedHandler;
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // Enabled via custom header/cookie or disabled for clean REST API
            .userDetailsService(userDetailsService)
            .authorizeHttpRequests(auth -> auth
                // Public Static Assets & Routing
                .requestMatchers(
                    "/", "/index.html", "/manifest.json",
                    "/login", "/login.html",
                    "/app", "/app.html",
                    "/css/**", "/js/**", "/images/**",
                    "/admin/css/**", "/admin/js/**",
                    "/user/css/**", "/user/js/**"
                ).permitAll()

                // Public Auth Pages & Endpoints
                .requestMatchers(
                    "/admin/login", "/admin/login.html",
                    "/user/login", "/user/login.html",
                    "/user/register", "/user/register.html",
                    "/user/forgot-password.html",
                    "/api/admin/login",
                    "/api/user/login",
                    "/api/user/register",
                    "/api/auth/**",
                    "/api/categories/public"
                ).permitAll()

                // STRICT ADMIN ROUTES (ROLE_ADMIN only)
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // STRICT USER ROUTES (ROLE_USER only)
                .requestMatchers("/user/**").hasRole("USER")
                .requestMatchers("/api/user/**").hasRole("USER")

                // Shared Authenticated Routes
                .requestMatchers("/api/complaints/**").authenticated()
                .requestMatchers("/api/notifications/**").authenticated()
                .requestMatchers("/api/feedback/**").authenticated()
                .requestMatchers("/api/tickets/**").authenticated()

                // All other requests must be authenticated
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .accessDeniedHandler(accessDeniedHandler)
                .authenticationEntryPoint(authenticationEntryPoint)
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessUrl("/user/login?logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            );

        return http.build();
    }
}
