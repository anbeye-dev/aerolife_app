import { Tabs } from 'expo-router';
import { LayoutDashboard, Dumbbell, GraduationCap, Wallet, Settings } from 'lucide-react-native';
import { colors } from '@/lib/theme';
import { useSettingsStore } from '@/stores';
import { i18n } from '@/lib/i18n';

export default function TabLayout() {
  const language = useSettingsStore((state) => state.language);
  const t = i18n.translate(language);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.light.primary,
        tabBarInactiveTintColor: colors.light.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.light.surface,
          borderTopColor: colors.light.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.nav.home,
          tabBarIcon: ({ size, color }) => (
            <LayoutDashboard size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sport"
        options={{
          title: t.nav.sport,
          tabBarIcon: ({ size, color }) => (
            <Dumbbell size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="part66"
        options={{
          title: t.nav.part66,
          tabBarIcon: ({ size, color }) => (
            <GraduationCap size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: t.nav.budget,
          tabBarIcon: ({ size, color }) => (
            <Wallet size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.nav.settings,
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
