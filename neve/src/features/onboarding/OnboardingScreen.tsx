import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  GlassCard,
  Icon,
  Logo,
  PrivacyBadge,
  ScreenBackground,
  Segmented,
  Text,
} from '@/components';
import { APP_NAME, DISCLAIMERS, SUPPORTED_CURRENCIES } from '@/config/app';
import { t } from '@/i18n';
import { useTheme } from '@/theme';
import { useAppStore } from '@/store';
import type { CurrencyCode } from '@/types';

const CATEGORIES = ['Comptes bancaires', '2e pilier', '3e pilier', 'Robo-trading', 'Espèces', 'Budget'];

export function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const loadDemo = useAppStore((s) => s.loadDemo);

  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState<CurrencyCode>('CHF');
  const [tracked, setTracked] = useState<string[]>(['Comptes bancaires', '2e pilier', '3e pilier', 'Robo-trading']);

  const steps = 5;

  const finish = (withDemo: boolean) => {
    if (withDemo) {
      loadDemo();
    } else {
      completeOnboarding({ baseCurrency: currency });
    }
    router.replace('/(tabs)');
  };

  const skip = () => {
    completeOnboarding({ baseCurrency: currency });
    router.replace('/(tabs)');
  };

  const toggleCategory = (c: string) =>
    setTracked((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <View style={styles.root}>
      <ScreenBackground />
      <View style={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 }]}>
        {/* Progress + skip */}
        <View style={styles.topBar}>
          <View style={styles.progress}>
            {Array.from({ length: steps }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  { backgroundColor: i <= step ? theme.colors.accent : theme.colors.surfaceStrong },
                ]}
              />
            ))}
          </View>
          {step < steps - 1 ? (
            <Pressable onPress={skip} hitSlop={8}>
              <Text variant="meta" tone="muted">
                {t.onboarding.skip}
              </Text>
            </Pressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <View style={styles.body}>
          {step === 0 && (
            <View style={styles.center}>
              <Logo size={72} />
              <Text variant="display" center style={{ marginTop: 24, fontSize: 30 }}>
                {APP_NAME}
              </Text>
              <Text variant="body" tone="secondary" center style={{ marginTop: 12, lineHeight: 24 }}>
                {t.onboarding.valueBody}
              </Text>
            </View>
          )}

          {step === 1 && (
            <View style={styles.center}>
              <StepTitle title={t.onboarding.currencyTitle} body={t.onboarding.currencyBody} />
              <View style={{ marginTop: 28 }}>
                <Segmented
                  options={SUPPORTED_CURRENCIES.map((c) => ({ value: c, label: c }))}
                  value={currency}
                  onChange={(c) => setCurrency(c as CurrencyCode)}
                />
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.center}>
              <StepTitle title={t.onboarding.categoriesTitle} body={t.onboarding.categoriesBody} />
              <View style={styles.chips}>
                {CATEGORIES.map((c) => {
                  const active = tracked.includes(c);
                  return (
                    <Pressable
                      key={c}
                      onPress={() => toggleCategory(c)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active ? theme.colors.accent : theme.colors.surface,
                          borderColor: active ? theme.colors.accent : theme.colors.border,
                        },
                      ]}
                    >
                      <Text variant="meta" weight="semibold" tone={active ? 'onAccent' : 'secondary'}>
                        {c}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.center}>
              <PrivacyBadge label="Confidentialité" tone="info" />
              <StepTitle title={t.onboarding.privacyTitle} body={DISCLAIMERS.privacy} />
              <GlassCard style={{ marginTop: 24 }}>
                <View style={styles.privacyRow}>
                  <Icon name="lock" size={20} color={theme.colors.info} />
                  <Text variant="meta" tone="secondary" style={{ flex: 1 }}>
                    Aucune donnée n’est envoyée sans votre consentement explicite.
                  </Text>
                </View>
              </GlassCard>
            </View>
          )}

          {step === 4 && (
            <View style={styles.center}>
              <StepTitle title={t.onboarding.startTitle} body={t.onboarding.startBody} />
              <View style={{ marginTop: 28, alignSelf: 'stretch', gap: 12 }}>
                <Button label={t.onboarding.startWithDemo} onPress={() => finish(true)} />
                <Button label={t.onboarding.startFresh} variant="secondary" onPress={() => finish(false)} />
              </View>
            </View>
          )}
        </View>

        {/* Nav */}
        {step < steps - 1 && (
          <View style={styles.nav}>
            {step > 0 ? (
              <Button label={t.onboarding.back} variant="ghost" fullWidth={false} onPress={() => setStep((s) => s - 1)} />
            ) : (
              <View />
            )}
            <Button label={t.onboarding.next} fullWidth={false} onPress={() => setStep((s) => s + 1)} style={{ minWidth: 160 }} />
          </View>
        )}
      </View>
    </View>
  );
}

function StepTitle({ title, body }: { title: string; body: string }) {
  return (
    <>
      <Text variant="screenTitle" center style={{ marginTop: 12 }}>
        {title}
      </Text>
      <Text variant="body" tone="secondary" center style={{ marginTop: 10, lineHeight: 23 }}>
        {body}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progress: { flexDirection: 'row', gap: 6 },
  progressDot: { width: 26, height: 4, borderRadius: 2 },
  body: { flex: 1, justifyContent: 'center' },
  center: { alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 28 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  privacyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
