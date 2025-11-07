import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

interface AlertContextType {
  showAlert: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlert({ visible: true, title, message, type });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, visible: false }));
  };

  const getAlertConfig = () => {
    switch (alert.type) {
      case 'success':
        return { color: '#28a745', icon: 'check-circle' as const };
      case 'error':
        return { color: '#dc3545', icon: 'error' as const };
      case 'warning':
        return { color: '#ffc107', icon: 'warning' as const };
      default:
        return { color: '#17a2b8', icon: 'info' as const };
    }
  };

  const config = getAlertConfig();

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal
        visible={alert.visible}
        transparent
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <View style={styles.overlay}>
          <View style={styles.alertContainer}>
            <View style={[styles.alertHeader, { backgroundColor: config.color }]}>
              <MaterialIcons name={config.icon} size={24} color="white" />
              <Text style={styles.alertTitle}>{alert.title}</Text>
            </View>
            <View style={styles.alertBody}>
              <Text style={styles.alertMessage}>{alert.message}</Text>
            </View>
            <View style={styles.alertFooter}>
              <TouchableOpacity style={[styles.alertButton, { backgroundColor: config.color }]} onPress={hideAlert}>
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    minWidth: 300,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    gap: 8,
  },
  alertTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  alertBody: {
    padding: 16,
  },
  alertMessage: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  alertFooter: {
    padding: 16,
    alignItems: 'flex-end',
  },
  alertButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
  },
  alertButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});