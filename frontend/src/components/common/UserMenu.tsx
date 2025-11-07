import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';

interface UserMenuProps {
  onNavigate?: (screen: string) => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const initials = user?.username?.charAt(0).toUpperCase() || 'U';
  const displayName = user?.username || 'User';
  
  // Get user role and format it nicely
  const getRoleDisplay = () => {
    if (!user?.roles || user.roles.length === 0) return 'User';
    const role = user.roles[0].replace('ROLE_', '');
    // Capitalize first letter and lowercase the rest
    const formatted = role.charAt(0) + role.slice(1).toLowerCase();
    console.log('UserMenu - Raw role:', user.roles[0], 'Formatted:', formatted);
    return formatted;
  };
  
  const userRole = getRoleDisplay();
  console.log('UserMenu - Final userRole:', userRole, 'User roles:', user?.roles);

  const handleProfileClick = () => {
    setMenuVisible(false);
    onNavigate?.('Profile');
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
    if (Platform.OS === 'web') {
      window.location.href = '/';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.userInfo}
        onPress={() => setMenuVisible(!menuVisible)}
      >
        <View style={styles.userAvatar}>
          <Text style={styles.userInitials}>{initials}</Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userRole}>{userRole}</Text>
        </View>
        <MaterialIcons 
          name={menuVisible ? "arrow-drop-up" : "arrow-drop-down"} 
          size={24} 
          color={colors.text} 
        />
      </TouchableOpacity>

      {menuVisible && Platform.OS === 'web' && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998,
            }}
            onClick={() => setMenuVisible(false)}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            width: '200px',
            zIndex: 999,
            border: '1px solid #e0e0e0',
            padding: '8px 0',
          }}>
            <div
              onClick={handleProfileClick}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <MaterialIcons name="person" size={20} color={colors.text} />
              <span style={{ marginLeft: '12px', fontSize: '14px', color: colors.text }}>My Profile</span>
            </div>
            <div style={{ height: '1px', backgroundColor: '#e0e0e0', margin: '4px 0' }} />
            <div
              onClick={handleLogout}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <MaterialIcons name="logout" size={20} color={colors.danger} />
              <span style={{ marginLeft: '12px', fontSize: '14px', color: colors.danger }}>Logout</span>
            </div>
          </div>
        </>
      )}

      {menuVisible && Platform.OS !== 'web' && (
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleProfileClick}
              >
                <MaterialIcons name="person" size={20} color={colors.text} />
                <Text style={styles.menuText}>My Profile</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleLogout}
              >
                <MaterialIcons name="logout" size={20} color={colors.danger} />
                <Text style={[styles.menuText, { color: colors.danger }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    cursor: 'pointer' as any,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitials: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  userDetails: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  userRole: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  overlay: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dropdown: {
    position: 'absolute' as any,
    top: '100%',
    right: 0,
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    minWidth: 200,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'solid' as any,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    cursor: 'pointer' as any,
    minHeight: 44,
  },
  menuText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    minWidth: 200,
    overflow: 'hidden',
  },
});
