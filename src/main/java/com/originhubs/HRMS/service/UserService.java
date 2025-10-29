package com.originhubs.HRMS.service;

import com.originhubs.HRMS.model.Role;
import com.originhubs.HRMS.model.User;
import com.originhubs.HRMS.repository.PasswordResetTokenRepository;
import com.originhubs.HRMS.repository.RoleRepository;
import com.originhubs.HRMS.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User findByEmployeeId(Long employeeId) {
        return userRepository.findByEmployeeId(employeeId);
    }

    public boolean existsByUsername(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    @Transactional
    public User saveUser(User user, List<Long> roleIds) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        
        // Encode password
        if (user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        
        // Set timestamps
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        // Set enabled to true by default
        user.setEnabled(true);
        
        // Set roles
        Set<Role> roles = new HashSet<>();
        if (roleIds != null && !roleIds.isEmpty()) {
            roles.addAll(roleRepository.findAllById(roleIds));
        }
        user.setRoles(roles);
        
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Long id, User updatedUser, List<Long> roleIds) {
        User existingUser = findById(id);
        if (existingUser == null) {
            return null;
        }
        
        // Update fields
        existingUser.setFullName(updatedUser.getFullName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setEnabled(updatedUser.isEnabled());
        existingUser.setUpdatedAt(LocalDateTime.now());
        
        // Update password only if provided
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        
        // Update roles
        Set<Role> roles = new HashSet<>();
        if (roleIds != null && !roleIds.isEmpty()) {
            roles.addAll(roleRepository.findAllById(roleIds));
        }
        existingUser.setRoles(roles);
        
        return userRepository.save(existingUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        // Find the user first
        User user = findById(id);
        if (user != null) {
            // Delete all password reset tokens for this user
            passwordResetTokenRepository.deleteAllByUser(user);
        }
        
        // Delete the user
        userRepository.deleteById(id);
    }

    public long getTotalUsers() {
        return userRepository.count();
    }

    public List<User> findByRoleName(Role.RoleName roleName) {
        return userRepository.findByRoles_Name(roleName);
    }
    
    @Transactional
    public void updateUserLastLogin(User user) {
        userRepository.save(user);
    }
    
    @Transactional
    public void updateUserPassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setIsTemporaryPassword(false); // No longer temporary
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}