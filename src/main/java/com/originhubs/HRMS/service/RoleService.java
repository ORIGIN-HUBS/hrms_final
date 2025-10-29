package com.originhubs.HRMS.service;

import com.originhubs.HRMS.model.Role;
import com.originhubs.HRMS.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;

    public List<Role> findAllRoles() {
        return roleRepository.findAll();
    }

    public Role findByName(Role.RoleName name) {
        return roleRepository.findByName(name).orElse(null);
    }

    public Role findById(Long id) {
        return roleRepository.findById(id).orElse(null);
    }

    public Role saveRole(Role role) {
        return roleRepository.save(role);
    }

    public void deleteRole(Long id) {
        roleRepository.deleteById(id);
    }

    public boolean existsByName(Role.RoleName name) {
        return roleRepository.findByName(name).isPresent();
    }
}