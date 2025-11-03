import { useNavigation } from '@/contexts/NavigationContext';

export const useSPANavigation = () => {
  const { openView, navigateToSection, closeView } = useNavigation();

  const openModal = (view: string, props?: any) => {
    openView(view, 'panel', props);
  };

  const openPanel = (view: string, props?: any) => {
    openView(view, 'panel', props);
  };

  const openDrawer = (view: string, props?: any) => {
    openView(view, 'drawer', props);
  };

  const navigateToEmployee = (employeeId?: string) => {
    if (employeeId) {
      openPanel('EmployeeView', { employeeId });
    } else {
      navigateToSection('employees');
    }
  };

  const navigateToProject = (projectId?: string) => {
    if (projectId) {
      openPanel('ProjectView', { projectId });
    } else {
      navigateToSection('projects');
    }
  };

  const addEmployee = () => {
    openModal('EmployeeAdd');
  };

  const editEmployee = (employeeId: string) => {
    openModal('EmployeeEdit', { employeeId });
  };

  const addProject = () => {
    openModal('ProjectAdd');
  };

  const addTimesheet = () => {
    openModal('TimesheetForm');
  };

  return {
    openModal,
    openPanel,
    openDrawer,
    closeView,
    navigateToSection,
    navigateToEmployee,
    navigateToProject,
    addEmployee,
    editEmployee,
    addProject,
    addTimesheet
  };
};