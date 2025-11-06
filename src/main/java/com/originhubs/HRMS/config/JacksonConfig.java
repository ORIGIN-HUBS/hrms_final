package com.originhubs.HRMS.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Handle Hibernate proxies
        Hibernate6Module hibernate6Module = new Hibernate6Module();
        hibernate6Module.disable(Hibernate6Module.Feature.USE_TRANSIENT_ANNOTATION);
        hibernate6Module.enable(Hibernate6Module.Feature.FORCE_LAZY_LOADING);
        mapper.registerModule(hibernate6Module);
        
        // Handle Java 8 time types (LocalDate, LocalDateTime, etc.)
        mapper.registerModule(new JavaTimeModule());
        
        return mapper;
    }
}