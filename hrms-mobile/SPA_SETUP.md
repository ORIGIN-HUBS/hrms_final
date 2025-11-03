# HRMS SPA Refactor - Setup Guide

## 🎯 Overview
The HRMS mobile app has been refactored into a seamless Single Page Application (SPA) experience with:
- **Single screen layout** with dynamic content swapping
- **Modal overlays** for forms (Add/Edit screens)
- **Side panels** for detailed views
- **Smooth animations** using React Native Reanimated
- **Unified navigation** context for state management

## 🚀 Key Components

### 1. Navigation Context (`src/contexts/NavigationContext.tsx`)
- Manages global navigation state
- Handles breadcrumbs and view transitions
- Provides navigation actions

### 2. Main Layout (`src/components/layout/MainLayout.tsx`)
- Single container for entire app
- Header with breadcrumbs
- Sidebar (web) / Bottom tabs (mobile)
- Content area with smooth transitions

### 3. Overlay Managers
- **ModalManager**: Forms and quick actions
- **PanelManager**: Detailed views sliding from right
- **FloatingActionButton**: Context-aware quick actions

## 🔧 Usage Examples

### Navigate to Section
```tsx
import { useSPANavigation } from '@/hooks/useSPANavigation';

const { navigateToSection } = useSPANavigation();
navigateToSection('employees'); // Switch to employees section
```

### Open Modal (Forms)
```tsx
const { addEmployee, editEmployee } = useSPANavigation();
addEmployee(); // Opens employee form in modal
editEmployee('123'); // Opens edit form with employee ID
```

### Open Panel (Details)
```tsx
const { openPanel } = useSPANavigation();
openPanel('EmployeeView', { employeeId: '123' }); // Slides in from right
```

## 📱 Screen Types

### Modal Screens (Forms)
- EmployeeAdd/Edit
- ProjectAdd/Edit  
- TimesheetForm
- Quick actions

### Panel Screens (Details)
- EmployeeView
- ProjectView
- TimesheetView
- Settings

### Inline Screens (Main Content)
- Dashboard
- List screens
- Reports

## 🎨 Animations

All transitions use React Native Reanimated:
- **FadeIn**: Section switching (200ms)
- **SlideInUp**: Modal appearance (300ms)
- **SlideInRight**: Panel sliding (300ms)
- **Spring animations**: Floating action button

## 🔄 Migration Steps

1. **Replace navigation calls**:
   ```tsx
   // Old
   navigation.navigate('EmployeeView', { id })
   
   // New
   openPanel('EmployeeView', { employeeId: id })
   ```

2. **Update screen components**:
   ```tsx
   // Remove navigation prop dependency
   const MyScreen: React.FC = () => {
     const { openPanel } = useSPANavigation();
     // Use SPA navigation methods
   }
   ```

3. **Add to overlay managers**:
   - Add new screens to ModalManager or PanelManager
   - Define view type (modal/panel) based on screen purpose

## 🎯 Benefits

✅ **Seamless UX**: No jarring page transitions  
✅ **State Preservation**: Context maintains navigation state  
✅ **Performance**: Minimal re-renders with smart caching  
✅ **Responsive**: Adapts to web/mobile automatically  
✅ **Accessible**: Keyboard navigation and screen readers  
✅ **Modern Feel**: Notion/Slack-like experience  

## 🔧 Next Steps

1. Update remaining screens to use SPA navigation
2. Add keyboard shortcuts for power users
3. Implement scroll restoration
4. Add transition preferences
5. Optimize for larger screens (tablet/desktop)

The app now provides a fluid, modern experience while maintaining all existing functionality!