package com.originhubs.HRMS.config;

import com.originhubs.HRMS.security.CustomAuthenticationSuccessHandler;
import com.originhubs.HRMS.security.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.web.header.HeaderWriterFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final CustomAuthenticationSuccessHandler authenticationSuccessHandler;
    private final OncePerRequestFilter securityHeadersFilter;
    
    public SecurityConfig(CustomUserDetailsService userDetailsService, 
                         @Lazy CustomAuthenticationSuccessHandler authenticationSuccessHandler,
                         OncePerRequestFilter securityHeadersFilter) {
        this.userDetailsService = userDetailsService;
        this.authenticationSuccessHandler = authenticationSuccessHandler;
        this.securityHeadersFilter = securityHeadersFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
            .addFilterAfter(securityHeadersFilter, HeaderWriterFilter.class)
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .headers(headers -> headers
                .frameOptions().deny()
                .contentTypeOptions().and()
                .httpStrictTransportSecurity(hsts -> hsts
                    .maxAgeInSeconds(31536000)
                    .includeSubdomains(true)
                )
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login", "/css/**", "/js/**", "/images/**").permitAll()
                .requestMatchers("/auth/**").permitAll()
                // API endpoints - keep for potential future use
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/hr/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers("/api/employee/**").hasAnyRole("ADMIN", "HR", "EMPLOYEE")
                .requestMatchers("/api/**").hasAnyRole("ADMIN", "HR", "EMPLOYEE")
                // HTML page routes
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/hr/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers("/employee/**").hasAnyRole("ADMIN", "HR", "EMPLOYEE")
                // Self-service portal routes
                .requestMatchers("/self-service/admin/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers("/self-service/**").hasAnyRole("ADMIN", "HR", "EMPLOYEE")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .successHandler(authenticationSuccessHandler)
                .failureUrl("/login?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout=true")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            )
            .exceptionHandling(ex -> ex
                .accessDeniedPage("/access-denied")
            )
            .sessionManagement(session -> session
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
                .and()
                .sessionFixation().migrateSession()
                .invalidSessionUrl("/login?expired=true")
            );

        return http.build();
    }
}

