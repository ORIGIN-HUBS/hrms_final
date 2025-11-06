package com.originhubs.HRMS.service;

import com.originhubs.HRMS.model.Project;
import com.originhubs.HRMS.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    public List<Project> getProjectsByStatus(String status) {
        return projectRepository.findByStatus(status);
    }

    public List<Project> getProjectsByEmployeeId(Long employeeId) {
        return projectRepository.findByEmployeeId(employeeId);
    }

    public List<Project> getActiveProjectsForEmployee(Long employeeId) {
        return projectRepository.findByEmployeeIdAndStatus(employeeId, "ACTIVE");
    }

    public List<Project> findAllActive() {
        return projectRepository.findByStatus("ACTIVE");
    }

    public List<Project> searchProjects(String keyword) {
        return projectRepository.searchProjects(keyword);
    }

    @Transactional
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProject(Long id, Project projectDetails) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        project.setProjectName(projectDetails.getProjectName());
        project.setJobTitle(projectDetails.getJobTitle());
        project.setVendorCompanyName(projectDetails.getVendorCompanyName());
        project.setPocName(projectDetails.getPocName());
        project.setPocTitle(projectDetails.getPocTitle());
        project.setPocEmail(projectDetails.getPocEmail());
        project.setPocPhone(projectDetails.getPocPhone());
        project.setAgreementTerms(projectDetails.getAgreementTerms());
        project.setVendorLocation(projectDetails.getVendorLocation());
        project.setClientCompanyName(projectDetails.getClientCompanyName());
        project.setClientLocation(projectDetails.getClientLocation());
        project.setWorkMode(projectDetails.getWorkMode());
        project.setVendorPayRate(projectDetails.getVendorPayRate());
        project.setCandidatePayRate(projectDetails.getCandidatePayRate());
        project.setProjectStartDate(projectDetails.getProjectStartDate());
        project.setProjectEndDate(projectDetails.getProjectEndDate());
        project.setExtensionDate(projectDetails.getExtensionDate());
        project.setStatus(projectDetails.getStatus());
        project.setEmployee(projectDetails.getEmployee());

        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    public long countByStatus(String status) {
        return projectRepository.countByStatus(status);
    }
}

