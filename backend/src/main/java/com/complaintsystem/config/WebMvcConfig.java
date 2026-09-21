package com.complaintsystem.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private String getFrontendResourceUri() {
        File direct = new File("frontend");
        if (direct.exists()) {
            return direct.toPath().toAbsolutePath().toUri().toString();
        }
        File parent = new File("../frontend");
        if (parent.exists()) {
            return parent.toPath().toAbsolutePath().toUri().toString();
        }
        return Paths.get("frontend").toAbsolutePath().toUri().toString();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String frontendUri = getFrontendResourceUri();
        if (!frontendUri.endsWith("/")) {
            frontendUri += "/";
        }

        registry.addResourceHandler("/admin/css/**")
                .addResourceLocations(frontendUri + "admin/css/");

        registry.addResourceHandler("/admin/js/**")
                .addResourceLocations(frontendUri + "admin/js/");

        registry.addResourceHandler("/user/css/**")
                .addResourceLocations(frontendUri + "user/css/");

        registry.addResourceHandler("/user/js/**")
                .addResourceLocations(frontendUri + "user/js/");

        registry.addResourceHandler("/manifest.json")
                .addResourceLocations(frontendUri + "manifest.json");

        registry.addResourceHandler("/**")
                .addResourceLocations(frontendUri, "classpath:/static/");
    }
}
