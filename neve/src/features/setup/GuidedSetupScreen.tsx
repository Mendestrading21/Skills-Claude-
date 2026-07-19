import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  Avatar,
  BackHeader,
  Button,
  CurrencyAmountInput,
  Field,
  GlassCard,
  Icon,
  OptionGroup,
  Screen,
  SectionHeader,
  Text,
} from '@/components';
import { SUPPORTED_CURRENCIES } from '@/config/app';
import { parseAmountToMinor } from '@/domain/money';
import { computeNetWorth, valuePositions, type PortfolioContext } from '@/domain';
import { haptics } from '@/services/haptics';
import { useAppStore } from '@/store';
import { useTheme } from '@/theme';
import type { AccountKind, AssetClass, Category, CurrencyCode } from '@/types';
import { accountEmoji, categoryEmoji } from '@/utils/emoji';
import { nowIso } from '@/utils/date';

type AccountDraft = { id: number; name: string; kind: AccountKind; balance: string };
type BillDraft = { id: number; name: string; amount: string };

const KIND_OPTIONS: { value: AccountKind; label: string }[] = [
  { value: 'bank', label: 'Banque' },
  { value: 'cash', label: 'Espèces' },
  { value: 'pension', label: 'Prévoyance' },
  { value: 'brokerage', label: 'Titres' },
  { value: 'real_estate', label: 'Immobilier' },
  { value: 'other', label: 'Autre' },
];

const KIND_CLASS: Record<AccountKind, AssetClass> = {
  bank: 'cash',
  cash: 'cash',
  pension: 'pension',
  brokerage: 'fund',
  crypto: 'crypto',
  real_estate: 'real_estate',
  other: 'other',
};

const BILL_PRESETS = ['Loyer', 'Assurance maladie', 'Téléphone', 'Internet', 'Transport', 'Abonnements'];

let seq = 100;
const nextId = () => seq++;

/** Map a fixed-bill name to one of the default expense categories. */
function matchCategory(name: string, cats: Category[]): string | undefined {
  const find = (re: RegExp) => cats.find((c) => c.kind === 'expense' && re.test(c.name))?.id;
  if (/loyer|logement|hypoth|rent|assurance/i.test(name)) return find(/logement/i);
  if (/transport|train|bus|essence|voiture|cff|abo/i.test(name)) return find(/transport/i);
  if (/aliment|course|repas/i.test(name)) return find(/aliment/i);
  if (/loisir|sport|cinéma|cinema|jeu/i.test(name)) return find(/loisir/i);
  return find(/autre/i);
}

export function GuidedSetupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const store = useAppStore();

  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState<CurrencyCode>('CHF');
  const [accounts, setAccounts] = useState<AccountDraft[]>([
    { id: nextId(), name: 'Compte courant', kind: 'bank', balance: '' },
    { id: nextId(), name: 'Épargne', kind: 'bank', balance: '' },
  ]);
  const [salary, setSalary] = useState('');
  const [bills, setBills] = useState<BillDraft[]>([]);

  const updateAccount = (id: number, patch: Partial<AccountDraft>) =>
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const removeAccount = (id: number) => setAccounts((prev) => prev.filter((a) => a.id !== id));

  const updateBill = (id: number, patch: Partial<BillDraft>) =>
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const removeBill = (id: number) => setBills((prev) => prev.filter((b) => b.id !== id));

  const finish = () => {
    // Start from a clean slate with the chosen currency.
    store.resetAll().then(() => {
      store.setPreferences({ baseCurrency: currency, onboarded: true, demoMode: false });

      let firstAccountId: string | undefined;
      for (const a of accounts) {
        if (!a.name.trim()) continue;
        const account = store.addAccount({ name: a.name.trim(), kind: a.kind, currency });
        if (!firstAccountId) firstAccountId = account.id;
        const minor = parseAmountToMinor(a.balance);
        const asset = store.addAsset({
          name: a.name.trim(),
          assetClass: KIND_CLASS[a.kind],
          quoteCurrency: currency,
          pricingMode: 'manual',
        });
        store.addPosition({
          accountId: account.id,
          assetId: asset.id,
          quantityDecimal: '1',
          manualValueMinor: minor && minor > 0 ? minor : 0,
          manualValueCurrency: currency,
          openedAt: nowIso(),
        });
      }

      const cats = useAppStore.getState().data.categories;
      const incomeCat = cats.find((c) => c.kind === 'income')?.id;

      const salaryMinor = parseAmountToMinor(salary);
      if (salaryMinor && salaryMinor > 0) {
        // Recurring template for future months + this month's actual income.
        store.addRecurring({
          label: 'Salaire', type: 'income', amountMinor: salaryMinor, currency,
          categoryId: incomeCat, frequency: 'monthly', nextDate: nowIso(), isActive: true,
        });
        if (firstAccountId) {
          store.addTransaction({
            accountId: firstAccountId, type: 'income', amountMinor: salaryMinor, currency,
            categoryId: incomeCat, occurredAt: nowIso(), note: 'Salaire',
          });
        }
      }

      for (const b of bills) {
        const minor = parseAmountToMinor(b.amount);
        if (!b.name.trim() || !minor || minor <= 0) continue;
        const catId = matchCategory(b.name, cats);
        store.addRecurring({
          label: b.name.trim(), type: 'expense', amountMinor: minor, currency,
          categoryId: catId, frequency: 'monthly', nextDate: nowIso(), isActive: true,
        });
        if (firstAccountId) {
          store.addTransaction({
            accountId: firstAccountId, type: 'expense', amountMinor: minor, currency,
            categoryId: catId, occurredAt: nowIso(), note: b.name.trim(),
          });
        }
      }

      // Seed a first history point from the entered balances.
      const data = useAppStore.getState().data;
      const ctx: PortfolioContext = { assets: data.assets, quotes: data.quotes, fxRates: data.fxRates, baseCurrency: currency };
      const nw = computeNetWorth(valuePositions(data.positions, ctx), data.assets, data.liabilities, currency, data.fxRates);
      store.captureSnapshot({
        capturedAt: nowIso(),
        baseCurrency: currency,
        assetsMinor: nw.assetsMinor,
        liabilitiesMinor: nw.liabilitiesMinor,
        netWorthMinor: nw.netWorthMinor,
        breakdown: {},
      });

      haptics.success();
      router.replace('/(tabs)');
    });
  };

  return (
    <Screen bottomInset={20}>
      <BackHeader title="Configurer mes comptes" />

      {/* Steps indicator */}
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i <= step ? theme.colors.accent : theme.colors.surfaceStrong }]}
          />
        ))}
      </View>

      {step === 0 && (
        <GlassCard padding="lg" style={styles.block}>
          <Text variant="sectionTitle">Votre devise principale</Text>
          <Text variant="meta" tone="secondary" style={{ marginTop: 6 }}>
            Tous vos totaux seront affichés dans cette devise.
          </Text>
          <View style={{ marginTop: 18 }}>
            <OptionGroup
              options={SUPPORTED_CURRENCIES.map((c) => ({ value: c, label: c }))}
              value={currency}
              onChange={(c) => setCurrency(c as CurrencyCode)}
            />
          </View>
        </GlassCard>
      )}

      {step === 1 && (
        <>
          <SectionHeader
            title="Vos comptes"
            actionLabel="+ Ajouter"
            onAction={() => setAccounts((p) => [...p, { id: nextId(), name: '', kind: 'bank', balance: '' }])}
          />
          <Text variant="meta" tone="secondary" style={{ marginBottom: 12 }}>
            Renseignez le solde actuel de chaque compte (banque, épargne, 2e/3e pilier, titres…).
          </Text>
          {accounts.map((a) => (
            <GlassCard key={a.id} style={styles.block}>
              <View style={styles.rowHead}>
                <Avatar emoji={accountEmoji(a.name, a.kind)} size={34} />
                <View style={{ flex: 1 }}>
                  <Field label="" value={a.name} onChangeText={(v) => updateAccount(a.id, { name: v })} placeholder="Nom du compte" />
                </View>
                <Pressable onPress={() => removeAccount(a.id)} hitSlop={8} accessibilityLabel="Retirer">
                  <Icon name="close" size={18} color={theme.colors.textMuted} />
                </Pressable>
              </View>
              <View style={{ marginTop: 12 }}>
                <OptionGroup options={KIND_OPTIONS} value={a.kind} onChange={(k) => updateAccount(a.id, { kind: k })} />
              </View>
              <View style={{ marginTop: 12 }}>
                <Field
                  label={`Solde actuel (${currency})`}
                  value={a.balance}
                  onChangeText={(v) => updateAccount(a.id, { balance: v })}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                />
              </View>
            </GlassCard>
          ))}
        </>
      )}

      {step === 2 && (
        <>
          <GlassCard padding="lg" style={styles.block}>
            <Text variant="sectionTitle">💰 Votre revenu mensuel</Text>
            <View style={{ marginTop: 12 }}>
              <CurrencyAmountInput
                label="Salaire net / mois"
                amount={salary}
                onAmountChange={setSalary}
                currency={currency}
                onCurrencyChange={setCurrency}
                currencies={[currency]}
              />
            </View>
          </GlassCard>

          <SectionHeader
            title="🔁 Vos charges fixes"
            actionLabel="+ Ajouter"
            onAction={() => setBills((p) => [...p, { id: nextId(), name: '', amount: '' }])}
          />
          <View style={styles.presets}>
            {BILL_PRESETS.map((name) => (
              <Pressable
                key={name}
                onPress={() => setBills((p) => [...p, { id: nextId(), name, amount: '' }])}
                style={[styles.preset, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
              >
                <Text variant="meta" tone="secondary">
                  + {name}
                </Text>
              </Pressable>
            ))}
          </View>
          {bills.map((b) => (
            <GlassCard key={b.id} style={styles.block}>
              <View style={styles.rowHead}>
                <Avatar emoji={categoryEmoji(b.name, 'expense')} size={34} />
                <View style={{ flex: 1 }}>
                  <Field label="" value={b.name} onChangeText={(v) => updateBill(b.id, { name: v })} placeholder="Ex. Loyer" />
                </View>
                <Pressable onPress={() => removeBill(b.id)} hitSlop={8} accessibilityLabel="Retirer">
                  <Icon name="close" size={18} color={theme.colors.textMuted} />
                </Pressable>
              </View>
              <View style={{ marginTop: 12 }}>
                <Field
                  label={`Montant / mois (${currency})`}
                  value={b.amount}
                  onChangeText={(v) => updateBill(b.id, { amount: v })}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                />
              </View>
            </GlassCard>
          ))}
        </>
      )}

      {/* Navigation */}
      <View style={styles.nav}>
        {step > 0 ? (
          <Button label="Retour" variant="ghost" fullWidth={false} onPress={() => setStep((s) => s - 1)} />
        ) : (
          <View style={{ flex: 1 }} />
        )}
        {step < 2 ? (
          <Button label="Continuer" fullWidth={false} style={{ minWidth: 160 }} onPress={() => setStep((s) => s + 1)} />
        ) : (
          <Button label="Terminer" fullWidth={false} style={{ minWidth: 160 }} onPress={finish} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { marginBottom: 16 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  dot: { width: 26, height: 4, borderRadius: 2 },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  preset: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
});
