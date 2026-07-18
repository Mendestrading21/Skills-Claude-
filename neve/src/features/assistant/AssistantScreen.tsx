import React, { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackHeader, GlassCard, Icon, PrivacyBadge, ScreenBackground, Text } from '@/components';
import { t } from '@/i18n';
import { useTheme } from '@/theme';
import { answerLocally, SUGGESTED_QUESTIONS } from '@/services/assistant';
import { selectAssistantContext, useAppStore } from '@/store';
import { haptics } from '@/services/haptics';

type Message = { id: string; role: 'user' | 'assistant'; text: string };

let msgCounter = 0;
const nextId = () => `m${msgCounter++}`;

export function AssistantScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const data = useAppStore((s) => s.data);
  const ctx = useMemo(() => selectAssistantContext(data), [data]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId(),
      role: 'assistant',
      text: `Bonjour. Je peux expliquer vos chiffres à partir de vos données locales. ${t.assistant.disclaimer}`,
    },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const send = (question: string) => {
    const q = question.trim();
    if (!q) return;
    haptics.light();
    const reply = answerLocally(q, ctx);
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'user', text: q },
      { id: nextId(), role: 'assistant', text: reply.text },
    ]);
    setInput('');
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <View style={styles.root}>
      <ScreenBackground />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <BackHeader title={t.assistant.title} />
          <View style={styles.badgeRow}>
            <PrivacyBadge label={t.assistant.localMode} tone="info" />
            <Text variant="micro" tone="muted">
              {t.assistant.subtitle}
            </Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m) => (
            <View
              key={m.id}
              style={[
                styles.bubble,
                m.role === 'user'
                  ? { alignSelf: 'flex-end', backgroundColor: theme.colors.accent }
                  : { alignSelf: 'flex-start', backgroundColor: theme.colors.surfaceStrong, borderColor: theme.colors.border, borderWidth: StyleSheet.hairlineWidth },
              ]}
            >
              <Text variant="body" tone={m.role === 'user' ? 'onAccent' : 'default'} style={{ lineHeight: 21 }}>
                {m.text}
              </Text>
            </View>
          ))}

          {/* Suggested questions */}
          <View style={styles.suggestions}>
            <Text variant="micro" tone="muted" style={{ marginBottom: 8 }}>
              {t.assistant.suggested}
            </Text>
            <View style={styles.chips}>
              {SUGGESTED_QUESTIONS.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => send(s.label)}
                  style={[styles.chip, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                >
                  <Text variant="meta" tone="secondary">
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 10, borderTopColor: theme.colors.border }]}>
          <GlassCard padding="none" radius="control" style={styles.inputWrap}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t.assistant.placeholder}
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.input, { color: theme.colors.text }]}
              onSubmitEditing={() => send(input)}
              returnKeyType="send"
            />
            <Pressable
              onPress={() => send(input)}
              accessibilityRole="button"
              accessibilityLabel="Envoyer"
              style={[styles.sendBtn, { backgroundColor: input.trim() ? theme.colors.accent : theme.colors.surfaceStrong }]}
            >
              <Icon name="arrowUp" size={20} color={input.trim() ? theme.colors.onAccent : theme.colors.textMuted} />
            </Pressable>
          </GlassCard>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingHorizontal: 20 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: -6, marginBottom: 6 },
  messages: { paddingHorizontal: 20, paddingBottom: 20, gap: 10 },
  bubble: { maxWidth: '86%', borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14 },
  suggestions: { marginTop: 16 },
  chips: { gap: 8 },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, alignSelf: 'flex-start' },
  inputBar: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  inputWrap: { flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingRight: 6, paddingVertical: 6 },
  input: { flex: 1, fontSize: 16, paddingVertical: 8 },
  sendBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
});
