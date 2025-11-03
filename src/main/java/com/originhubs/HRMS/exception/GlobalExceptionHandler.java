package com.originhubs.HRMS.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.servlet.http.HttpServletRequest;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ModelAndView handleResourceNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        log.error("Resource not found: {}", ex.getMessage());
        
        ModelAndView mav = new ModelAndView();
        if (request.getRequestURI().startsWith("/api/")) {
            mav.setViewName("error/api-error");
            mav.addObject("error", "Resource not found");
            mav.addObject("message", ex.getMessage());
            mav.setStatus(HttpStatus.NOT_FOUND);
        } else {
            mav.setViewName("error/404");
            mav.addObject("message", ex.getMessage());
        }
        return mav;
    }

    @ExceptionHandler(BindException.class)
    public ModelAndView handleBindException(BindException ex, HttpServletRequest request, RedirectAttributes redirectAttributes) {
        log.error("Binding error: {}", ex.getMessage());
        
        StringBuilder errorMessage = new StringBuilder("Validation errors: ");
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errorMessage.append(error.getField()).append(" - ").append(error.getDefaultMessage()).append("; ")
        );
        
        redirectAttributes.addFlashAttribute("error", errorMessage.toString());
        return new ModelAndView("redirect:" + (request.getHeader("Referer") != null ? request.getHeader("Referer") : "/dashboard"));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ModelAndView handleDataIntegrityViolation(DataIntegrityViolationException ex, HttpServletRequest request, RedirectAttributes redirectAttributes) {
        log.error("Data integrity violation: {}", ex.getMessage());
        
        String userMessage = "Operation failed due to data constraints. Please check for duplicate entries or missing required data.";
        redirectAttributes.addFlashAttribute("error", userMessage);
        return new ModelAndView("redirect:" + (request.getHeader("Referer") != null ? request.getHeader("Referer") : "/dashboard"));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ModelAndView handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex, HttpServletRequest request, RedirectAttributes redirectAttributes) {
        log.error("File upload size exceeded: {}", ex.getMessage());
        
        String userMessage = "File size exceeds the maximum allowed limit of 10MB.";
        redirectAttributes.addFlashAttribute("error", userMessage);
        return new ModelAndView("redirect:" + (request.getHeader("Referer") != null ? request.getHeader("Referer") : "/dashboard"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ModelAndView handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        log.error("Access denied: {}", ex.getMessage());
        return new ModelAndView("access-denied");
    }

    @ExceptionHandler(Exception.class)
    public ModelAndView handleGenericException(Exception ex, HttpServletRequest request, RedirectAttributes redirectAttributes) {
        log.error("Unexpected error occurred", ex);
        
        redirectAttributes.addFlashAttribute("error", "An unexpected error occurred. Please try again later.");
        return new ModelAndView("redirect:/dashboard");
    }
}