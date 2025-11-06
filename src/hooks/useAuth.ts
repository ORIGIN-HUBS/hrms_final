import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { login, logout, checkAuth, changePassword, updateProfile } from '@/store/slices/authSlice';
import { LoginRequest } from '@/types';
import { hasRole as checkRole } from '@/utils/helpers';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const handleLogin = async (credentials: LoginRequest) => {
    return dispatch(login(credentials));
  };
  
  const handleLogout = async () => {
    return dispatch(logout());
  };
  
  const handleCheckAuth = async () => {
    return dispatch(checkAuth());
  };
  
  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    return dispatch(changePassword({ currentPassword, newPassword, confirmPassword }));
  };

  const handleUpdateProfile = async (profileData: {
    fullName?: string;
    email?: string;
    username?: string;
  }) => {
    return dispatch(updateProfile(profileData));
  };
  
  const hasRole = (role: string | string[]) => {
    if (!user || !user.roles) return false;
    return checkRole(user.roles, role);
  };
  
  const isAdmin = () => hasRole('ROLE_ADMIN');
  const isHR = () => hasRole(['ROLE_ADMIN', 'ROLE_HR']);
  const isEmployee = () => hasRole('ROLE_EMPLOYEE');
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    checkAuth: handleCheckAuth,
    changePassword: handleChangePassword,
    updateProfile: handleUpdateProfile,
    hasRole,
    isAdmin,
    isHR,
    isEmployee,
  };
};

