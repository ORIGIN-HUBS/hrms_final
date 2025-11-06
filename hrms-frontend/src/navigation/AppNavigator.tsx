import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import LoadingScreen from '../screens/LoadingScreen';

export default function AppNavigator() {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
}