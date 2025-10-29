package com.originhubs.HRMS.repository;

import com.originhubs.HRMS.model.Offboarding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OffboardingRepository extends JpaRepository<Offboarding, Long> {
    Optional<Offboarding> findByEmployeeId(Long employeeId);
    List<Offboarding> findByStatus(String status);
    boolean existsByEmployeeId(Long employeeId);
}

