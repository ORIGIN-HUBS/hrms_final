import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserListScreen from '@/screens/users/UserListScreen';
import UserAddScreen from '@/screens/users/UserAddScreen';
import UserEditScreen from '@/screens/users/UserEditScreen';
import UserViewScreen from '@/screens/users/UserViewScreen';

const Stack = createNativeStackNavigator();

const UserNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserList" component={UserListScreen} />
      <Stack.Screen name="UserAdd" component={UserAddScreen} />
      <Stack.Screen name="UserEdit" component={UserEditScreen} />
      <Stack.Screen name="UserView" component={UserViewScreen} />
    </Stack.Navigator>
  );
};

export default UserNavigator;

