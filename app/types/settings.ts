export type SettingsTab = 'api-keys' | 'history' | 'attachments';

export interface SettingsTabPanelProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
} 