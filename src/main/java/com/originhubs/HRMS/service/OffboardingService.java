package com.originhubs.HRMS.service;

import com.originhubs.HRMS.model.Employee;
import com.originhubs.HRMS.model.Offboarding;
import com.originhubs.HRMS.repository.EmployeeRepository;
import com.originhubs.HRMS.repository.OffboardingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OffboardingService {

    private final OffboardingRepository offboardingRepository;
    private final EmployeeRepository employeeRepository;

    public List<Offboarding> getAllOffboardings() {
        return offboardingRepository.findAll();
    }

    public Optional<Offboarding> getOffboardingById(Long id) {
        return offboardingRepository.findById(id);
    }

    public Optional<Offboarding> getOffboardingByEmployeeId(Long employeeId) {
        return offboardingRepository.findByEmployeeId(employeeId);
    }

    public List<Offboarding> getOffboardingsByStatus(String status) {
        return offboardingRepository.findByStatus(status);
    }

    @Transactional
    public Offboarding initiateOffboarding(Offboarding offboarding) {
        Employee employee = employeeRepository.findById(offboarding.getEmployee().getId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        employee.setStatus("OFFBOARDING");
        employeeRepository.save(employee);

        return offboardingRepository.save(offboarding);
    }

    @Transactional
    public Offboarding updateOffboarding(Long id, Offboarding offboardingDetails) {
        Offboarding offboarding = offboardingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offboarding not found with id: " + id));

        offboarding.setResignationDate(offboardingDetails.getResignationDate());
        offboarding.setReasonForLeaving(offboardingDetails.getReasonForLeaving());
        offboarding.setLastWorkingDay(offboardingDetails.getLastWorkingDay());
        offboarding.setNoticePeriod(offboardingDetails.getNoticePeriod());
        offboarding.setAssetsToCollect(offboardingDetails.getAssetsToCollect());
        offboarding.setFeedbackAndSuggestions(offboardingDetails.getFeedbackAndSuggestions());
        offboarding.setFinalSettlement(offboardingDetails.getFinalSettlement());
        offboarding.setPendingSalary(offboardingDetails.getPendingSalary());
        offboarding.setSettlementStatus(offboardingDetails.getSettlementStatus());
        offboarding.setStatus(offboardingDetails.getStatus());

        if ("COMPLETED".equals(offboardingDetails.getStatus())) {
            offboarding.setCompletedAt(LocalDateTime.now());
            Employee employee = offboarding.getEmployee();
            employee.setStatus("TERMINATED");
            employee.setTerminationDate(offboarding.getLastWorkingDay());
            employeeRepository.save(employee);
        }

        return offboardingRepository.save(offboarding);
    }

    @Transactional
    public Offboarding revokeAccess(Long id, boolean revokeEmail, boolean revokeSlack) {
        Offboarding offboarding = offboardingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offboarding not found with id: " + id));

        if (revokeEmail) {
            offboarding.setEmailRevoked(true);
            offboarding.setEmailRevokedAt(LocalDateTime.now());
        }
        if (revokeSlack) {
            offboarding.setSlackRevoked(true);
            offboarding.setSlackRevokedAt(LocalDateTime.now());
        }

        return offboardingRepository.save(offboarding);
    }

    @Transactional
    public void deleteOffboarding(Long id) {
        offboardingRepository.deleteById(id);
    }
}

