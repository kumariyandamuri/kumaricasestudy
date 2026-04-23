package com.accenture.lkm.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost",         // Docker frontend (port 80)
                    "http://localhost:80",       // Docker frontend (explicit port)
                    "http://127.0.0.1",         // Docker frontend (IP)
                    "http://localhost:5173",    // Vite dev server
                    "http://localhost:5500",    // VS Code Live Server
                    "http://127.0.0.1:5500",   // VS Code Live Server (IP)
                    "null"                       // file:// origin
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
