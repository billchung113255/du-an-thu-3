import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { colors, fonts, shadow } from '../theme/tokens';
import HomeScreen from '../screens/HomeScreen';
import SubjectsScreen from '../screens/SubjectsScreen';
import PracticeScreen from '../screens/PracticeScreen';
import TutorScreen from '../screens/TutorScreen';
import ProgressScreen from '../screens/ProgressScreen';
import TopicDetailScreen from '../screens/TopicDetailScreen';

/**
 * Student experience as a self-contained navigator.
 * Mounted by the root navigator after a Học viên signs in. Login lives at the
 * app root (shared with the tutor flow), so this tree starts at the tabs.
 */
export type StudentTabParamList = {
  Home: undefined;
  Subjects: undefined;
  Practice: undefined;
  Tutor: undefined;
  Progress: undefined;
};
export type StudentStackParamList = {
  Tabs: undefined;
  TopicDetail: { topicId: string };
};

const Tab = createBottomTabNavigator<StudentTabParamList>();
const Stack = createNativeStackNavigator<StudentStackParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
const TAB_ICON: Record<keyof StudentTabParamList, IoniconName> = {
  Home: 'home',
  Subjects: 'library',
  Practice: 'document-text',
  Tutor: 'sparkles',
  Progress: 'stats-chart',
};
const TAB_LABEL: Record<keyof StudentTabParamList, string> = {
  Home: 'Trang chủ',
  Subjects: 'Môn học',
  Practice: 'Luyện đề',
  Tutor: 'Gia sư AI',
  Progress: 'Tiến độ',
};

function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.slate2,
        tabBarLabelStyle: { fontFamily: fonts.sansSemi, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.line,
          height: Platform.OS === 'ios' ? 86 : 64,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          ...shadow.card,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const base = TAB_ICON[route.name];
          const name = (focused ? base : (`${base}-outline` as IoniconName)) as IoniconName;
          return <Ionicons name={name} size={size} color={color} />;
        },
        tabBarLabel: TAB_LABEL[route.name],
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Subjects" component={SubjectsScreen} />
      <Tab.Screen name="Practice" component={PracticeScreen} />
      <Tab.Screen name="Tutor" component={TutorScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
    </Tab.Navigator>
  );
}

export default function StudentNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
      <Stack.Screen name="Tabs" component={StudentTabs} />
      <Stack.Screen
        name="TopicDetail"
        component={TopicDetailScreen}
        options={{ presentation: 'card', animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
