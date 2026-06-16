import React from 'react';
import { useAuth } from '../app/AuthContext';
import RoleLoginScreen from '../screens/RoleLoginScreen';
import StudentNavigator from '../student/navigation/StudentNavigator';
import TutorNavigator from '../tutor/navigation/TutorNavigator';

/**
 * Top-level gate. No session → unified login. Otherwise mount the feature
 * module for the signed-in role. The NavigationContainer lives in App.tsx,
 * so each module only contributes its own stack of screens.
 */
export default function RootNavigator() {
  const { session } = useAuth();
  if (!session) return <RoleLoginScreen />;
  return session.role === 'tutor' ? <TutorNavigator /> : <StudentNavigator />;
}
