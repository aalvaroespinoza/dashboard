import React from 'react';
import { IOSSegmentedControl, SegmentTab } from '../../../components/ui/IOSSegmentedControl';

export type ReminderTab = 'listas' | 'hoy' | 'proximos' | 'completados';

interface SegmentedControlProps {
  selectedTab: ReminderTab;
  onTabChange: (tab: ReminderTab) => void;
  isDark?: boolean;
}

const TABS: SegmentTab<ReminderTab>[] = [
  { id: 'listas', label: 'Listas' },
  { id: 'hoy', label: 'Hoy' },
  { id: 'proximos', label: 'Próximos' },
  { id: 'completados', label: 'Completados' },
];

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  selectedTab,
  onTabChange,
  isDark,
}) => {
  return (
    <IOSSegmentedControl<ReminderTab>
      tabs={TABS}
      selectedTab={selectedTab}
      onTabChange={onTabChange}
      isDark={isDark}
    />
  );
};
