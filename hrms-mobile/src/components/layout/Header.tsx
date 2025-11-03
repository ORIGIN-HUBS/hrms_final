import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@/contexts/NavigationContext';
import { useAuth } from '@/hooks/useAuth';
import CommandPalette from './CommandPalette';

const Header: React.FC = () => {
  const { state, goBack } = useNavigation();
  const { user, logout } = useAuth();
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  return (
    <View style={{
      height: 60,
      backgroundColor: '#667eea',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      ...Platform.select({
        web: { paddingTop: 0 },
        default: { paddingTop: 20, height: 80 }
      })
    }}>
      {state.breadcrumbs.length > 1 ? (
        <TouchableOpacity onPress={goBack} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => setShowCommandPalette(true)} style={{ marginRight: 12 }}>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      )}
      
      <View style={{ flex: 1 }}>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
          {state.breadcrumbs[state.breadcrumbs.length - 1]?.label}
        </Text>
        {state.breadcrumbs.length > 1 && (
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
            {state.breadcrumbs.slice(0, -1).map(b => b.label).join(' > ')}
          </Text>
        )}
      </View>

      <TouchableOpacity onPress={logout}>
        <Ionicons name="log-out-outline" size={24} color="white" />
      </TouchableOpacity>
      
      <CommandPalette 
        visible={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
      />
    </View>
  );
};

export default Header;