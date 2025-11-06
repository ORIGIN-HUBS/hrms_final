import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProjectListScreen from '@/screens/projects/ProjectListScreen';
import ProjectAddScreen from '@/screens/projects/ProjectAddScreen';
import ProjectEditScreen from '@/screens/projects/ProjectEditScreen';
import ProjectViewScreen from '@/screens/projects/ProjectViewScreen';
import MyProjectsScreen from '@/screens/projects/MyProjectsScreen';

const Stack = createNativeStackNavigator();

const ProjectNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProjectList" component={ProjectListScreen} />
      <Stack.Screen name="MyProjects" component={MyProjectsScreen} />
      <Stack.Screen name="ProjectAdd" component={ProjectAddScreen} />
      <Stack.Screen name="ProjectEdit" component={ProjectEditScreen} />
      <Stack.Screen name="ProjectView" component={ProjectViewScreen} />
    </Stack.Navigator>
  );
};

export default ProjectNavigator;

