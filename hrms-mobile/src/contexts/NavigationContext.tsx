import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ViewType = 'modal' | 'panel' | 'drawer' | 'inline';
export type SectionType = 'dashboard' | 'employees' | 'projects' | 'timesheets' | 'profile' | 'settings';
export type WindowPosition = 'right' | 'left' | 'top' | 'bottom';

interface WindowView {
  id: string;
  component: string;
  position: WindowPosition;
  props: any;
  isMinimized: boolean;
}

interface NavigationState {
  activeSection: SectionType;
  windows: WindowView[];
  breadcrumbs: Array<{ label: string; section: SectionType; view?: string }>;
}

interface NavigationContextType {
  state: NavigationState;
  navigateToSection: (section: SectionType) => void;
  openView: (view: string, type: ViewType, props?: any) => void;
  closeView: (windowId?: string) => void;
  minimizeWindow: (windowId: string) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NavigationState>({
    activeSection: 'dashboard',
    windows: [],
    breadcrumbs: [{ label: 'Dashboard', section: 'dashboard' }]
  });

  const navigateToSection = (section: SectionType) => {
    if (section === 'dashboard') {
      setState(prev => ({
        ...prev,
        activeSection: 'dashboard',
        activeView: null,
        breadcrumbs: [{ label: 'Dashboard', section: 'dashboard' }]
      }));
    } else {
      openView(section.charAt(0).toUpperCase() + section.slice(1), 'panel', {});
    }
  };

  const openView = (view: string, type: ViewType, props: any = {}) => {
    const getNextPosition = (): WindowPosition => {
      const positions: WindowPosition[] = ['right', 'left', 'bottom', 'top'];
      const usedPositions = state.windows.map(w => w.position);
      return positions.find(pos => !usedPositions.includes(pos)) || 'right';
    };

    const existingWindow = state.windows.find(w => w.component === view);
    if (existingWindow) {
      setState(prev => ({
        ...prev,
        windows: prev.windows.map(w => 
          w.id === existingWindow.id ? { ...w, isMinimized: false, props } : w
        )
      }));
      return;
    }

    const newWindow: WindowView = {
      id: `${Date.now()}-${Math.random()}`,
      component: view,
      position: getNextPosition(),
      props,
      isMinimized: false
    };
    setState(prev => ({
      ...prev,
      windows: [...prev.windows, newWindow],
      breadcrumbs: [...prev.breadcrumbs, { label: view, section: prev.activeSection, view }]
    }));
  };

  const closeView = (windowId?: string) => {
    setState(prev => ({
      ...prev,
      windows: windowId ? prev.windows.filter(w => w.id !== windowId) : prev.windows.slice(0, -1),
      breadcrumbs: prev.breadcrumbs.slice(0, -1)
    }));
  };

  const minimizeWindow = (windowId: string) => {
    setState(prev => ({
      ...prev,
      windows: prev.windows.map(w => 
        w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
      )
    }));
  };

  const goBack = () => {
    if (state.windows.length > 0) {
      closeView();
    }
  };

  return (
    <NavigationContext.Provider value={{ state, navigateToSection, openView, closeView, minimizeWindow, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within NavigationProvider');
  return context;
};