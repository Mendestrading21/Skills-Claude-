import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  BackHeader,
  ConfirmSheet,
  GlassCard,
  Icon,
  type IconName,
  PrivacyBadge,
  RowDivider,
  Screen,
  SectionHeader,
  Segmented,
  Text,
} from '@/components';
import { APP_NAME, DISCLAIMERS, SUPPORTED_CURRENCIES } from '@/config/app';
import { t } from '@/i18n';
import { palette, useTheme } from '@/theme';
import { useAppStore } from '@/store';
import type { CurrencyCode } from '@/types';
import { ExportSheet } from './ExportSheet';
import { ImportSheet } from './ImportSheet';

export function SettingsScreen() {
  const router = useRouter();
  const prefs = useAppStore((s) => s.data.preferences);
  const setPreferences = useAppStore((s) => s.setPreferences);
  const loadDemo = useAppStore((s) => s.loadDemo);
  const resetAll = useAppStore((s) => s.resetAll);

  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDemo, setConfirmDemo] = useState(false);

  return (
    <Screen bottomInset={20}>
      <BackHeader title={t.settings.title} />

      {/* General */}
      <SectionHeader title="Général" />
      <GlassCard style={styles.block}>
        <View style={styles.rowCol}>
          <Text variant="body" weight="medium">
            {t.settings.baseCurrency}
          </Text>
          <View style={{ marginTop: 10 }}>
            <Segmented
              options={SUPPORTED_CURRENCIES.map((c) => ({ value: c, label: c }))}
              value={prefs.baseCurrency}
              onChange={(c) => setPreferences({ baseCurrency: c as CurrencyCode })}
            />
          </View>
        </View>
        <RowDivider />
        <StaticRow icon="info" title={t.settings.language} value="Français" />
      </GlassCard>

      {/* Appearance */}
      <SectionHeader title={t.settings.appearance} />
      <GlassCard style={styles.block}>
        <ToggleRow
          icon="shield"
          title={t.settings.reducedTransparency}
          subtitle="Surfaces opaques, sans flou."
          value={prefs.reducedTransparency}
          onChange={(v) => setPreferences({ reducedTransparency: v })}
        />
        <RowDivider />
        <StaticRow icon="info" title={t.settings.numberFormat} value="1 234.56" />
      </GlassCard>

      {/* Privacy & security */}
      <SectionHeader title={t.settings.privacy} />
      <GlassCard style={styles.block}>
        <ToggleRow
          icon="assistant"
          title={t.settings.remoteAssistant}
          subtitle="Désactivé. Aucun envoi distant sans votre accord."
          value={prefs.remoteAssistantEnabled}
          onChange={(v) => setPreferences({ remoteAssistantEnabled: v })}
        />
        <RowDivider />
        <ToggleRow
          icon="info"
          title={t.settings.analytics}
          subtitle="Aucune donnée financière n’est transmise."
          value={prefs.analyticsEnabled}
          onChange={(v) => setPreferences({ analyticsEnabled: v })}
        />
        <RowDivider />
        <ToggleRow
          icon="lock"
          title="Masquer les montants"
          subtitle="Remplace les montants affichés par des points."
          value={prefs.hideAmounts ?? false}
          onChange={(v) => setPreferences({ hideAmounts: v })}
        />
      </GlassCard>

      {/* Data */}
      <SectionHeader title={t.settings.data} />
      <GlassCard style={styles.block}>
        <ActionRow icon="download" title={t.settings.export} onPress={() => setExportFormat('json')} />
        <RowDivider />
        <ActionRow icon="download" title={t.settings.exportCsv} onPress={() => setExportFormat('csv')} />
        <RowDivider />
        <ActionRow icon="upload" title={t.settings.importData} onPress={() => setImportOpen(true)} />
        <RowDivider />
        <ActionRow icon="info" title={t.settings.loadDemo} onPress={() => setConfirmDemo(true)} />
        <RowDivider />
        <ActionRow icon="trash" title={t.settings.resetData} destructive onPress={() => setConfirmReset(true)} />
      </GlassCard>

      {/* About */}
      <SectionHeader title={t.settings.about} />
      <GlassCard style={styles.block}>
        <View style={styles.aboutHeader}>
          <Text variant="cardTitle">{APP_NAME}</Text>
          <PrivacyBadge label="v1.0 · Local" tone="muted" />
        </View>
        <Text variant="meta" tone="secondary" style={{ marginTop: 8, lineHeight: 20 }}>
          {t.settings.disclaimer}
        </Text>
        <Text variant="micro" tone="muted" style={{ marginTop: 10 }}>
          {DISCLAIMERS.privacy}
        </Text>
      </GlassCard>

      <ExportSheet visible={exportFormat != null} format={exportFormat ?? 'json'} onClose={() => setExportFormat(null)} />
      <ImportSheet visible={importOpen} onClose={() => setImportOpen(false)} />
      <ConfirmSheet
        visible={confirmDemo}
        title={t.settings.loadDemo}
        message="Cela remplacera les données actuelles par un jeu de démonstration."
        confirmLabel="Charger la démo"
        onConfirm={loadDemo}
        onClose={() => setConfirmDemo(false)}
      />
      <ConfirmSheet
        visible={confirmReset}
        title={t.settings.resetData}
        message={DISCLAIMERS.deletion}
        confirmLabel="Tout effacer"
        destructive
        onConfirm={() => {
          resetAll().then(() => router.replace('/onboarding'));
        }}
        onClose={() => setConfirmReset(false)}
      />
    </Screen>
  );
}

function RowShell({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceStrong }]}>
        <Icon name={icon} size={18} color={theme.colors.textSecondary} />
      </View>
      {children}
    </View>
  );
}

function ToggleRow({
  icon,
  title,
  subtitle,
  value,
  onChange,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <RowShell icon={icon}>
      <View style={styles.textCol}>
        <Text variant="body" weight="medium">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="micro" tone="muted" style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#2A2F38', true: palette.accentDark }}
        thumbColor={value ? palette.accent : '#8A90A0'}
      />
    </RowShell>
  );
}

function ActionRow({
  icon,
  title,
  destructive,
  onPress,
}: {
  icon: IconName;
  title: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      <RowShell icon={icon}>
        <Text variant="body" weight="medium" style={{ flex: 1 }} tone={destructive ? 'negative' : 'default'}>
          {title}
        </Text>
        <Icon name="chevronRight" size={18} color={theme.colors.textMuted} />
      </RowShell>
    </Pressable>
  );
}

function StaticRow({ icon, title, value }: { icon: IconName; title: string; value: string }) {
  return (
    <RowShell icon={icon}>
      <Text variant="body" weight="medium" style={{ flex: 1 }}>
        {title}
      </Text>
      <Text variant="meta" tone="secondary">
        {value}
      </Text>
    </RowShell>
  );
}

const styles = StyleSheet.create({
  block: { marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowCol: { paddingVertical: 12 },
  iconWrap: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  textCol: { flex: 1 },
  aboutHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
