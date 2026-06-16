import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Subjects: undefined;
  Practice: undefined;
  Tutor: undefined;
  Progress: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<TabParamList> | undefined;
  TopicDetail: { topicId: string };
};

declare global {
  // Makes useNavigation() strongly typed across the app.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
