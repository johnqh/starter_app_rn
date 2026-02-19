/**
 * Navigation type definitions
 */
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Stack param lists for each tab
export type HistoriesStackParamList = {
  HistoriesList: undefined;
  HistoryDetail: { historyId: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
};

// Root tab param list
export type RootTabParamList = {
  HistoriesTab: NavigatorScreenParams<HistoriesStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

// Screen props types
export type HistoriesListScreenProps = NativeStackScreenProps<HistoriesStackParamList, 'HistoriesList'>;
export type HistoryDetailScreenProps = NativeStackScreenProps<HistoriesStackParamList, 'HistoryDetail'>;
export type SettingsScreenProps = NativeStackScreenProps<SettingsStackParamList, 'Settings'>;

// Tab screen props
export type HistoriesTabProps = BottomTabScreenProps<RootTabParamList, 'HistoriesTab'>;
export type SettingsTabProps = BottomTabScreenProps<RootTabParamList, 'SettingsTab'>;

// Utility type for navigation prop
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
