import React from 'react';
import { Platform, Pressable } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabBarButtonProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors } from '../theme/tokens';
import { Icon, IconName } from '../components/Icon';
import DashboardScreen from '../screens/DashboardScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import StudentsScreen from '../screens/StudentsScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import EarningsScreen from '../screens/EarningsScreen';
import StudentProfileScreen from '../screens/StudentProfileScreen';

/**
 * Tutor experience as a self-contained navigator.
 * Mounted by the root navigator after a Gia sư signs in.
 */
export type TutorTabParamList = {
  Dashboard: undefined;
  Schedule: undefined;
  Students: undefined;
  Resources: undefined;
  Earnings: undefined;
};
export type TutorStackParamList = {
  Main: undefined;
  StudentProfile: { studentId: string };
};

const Tab = createBottomTabNavigator<TutorTabParamList>();
const Stack = createNativeStackNavigator<TutorStackParamList>();

const TAB_ICON: Record<keyof TutorTabParamList, IconName> = {
  Dashboard: 'grid',
  Schedule: 'calendar',
  Students: 'users',
  Resources: 'book',
  Earnings: 'wallet',
};
const TAB_LABEL: Record<keyof TutorTabParamList, string> = {
  Dashboard: 'Tổng quan',
  Schedule: 'Lịch',
  Students: 'Học viên',
  Resources: 'Tài liệu',
  Earnings: 'Thu nhập',
};

function TabBarButton(props: BottomTabBarButtonProps) {
  const { children, onPress, accessibilityState, accessibilityLabel, testID, style } = props;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      android_ripple={null}
      style={style}
    >
      {children}
    </Pressable>
  );
}

function TutorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.slate2,
        tabBarButton: (props) => <TabBarButton {...props} />,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 1 },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 64,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        tabBarLabel: TAB_LABEL[route.name],
        tabBarIcon: ({ focused, size }) => (
          <Icon name={TAB_ICON[route.name]} size={size ?? 22} color={focused ? colors.gold : colors.slate2} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Students" component={StudentsScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
    </Tab.Navigator>
  );
}

export default function TutorNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TutorTabs} />
      <Stack.Screen
        name="StudentProfile"
        component={StudentProfileScreen}
        options={{ presentation: 'card', animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
