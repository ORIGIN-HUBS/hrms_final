package com.originhubs.HRMS.repository;

import com.originhubs.HRMS.model.Role;
import com.originhubs.HRMS.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByRoles_Name(Role.RoleName roleName);
    
    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.name IN :roleNames")
    List<User> findUsersWithRoles(@Param("roleNames") List<Role.RoleName> roleNames);
    
    @Query("SELECT u FROM User u JOIN Employee e ON u.email = e.workEmail WHERE e.id = :employeeId")
    User findByEmployeeId(@Param("employeeId") Long employeeId);
}
