import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet, Button, Text } from '@/components';
import { importJson } from '@/data/exchange';
import { useAppStore } from '@/store';
import { useTheme } from '@/theme';
import { haptics } from '@/services/haptics';
import { readClipboard } from './shareData';

export function ImportSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const replaceAll = useAppStore((s) => s.replaceAll);
  const [raw, setRaw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleClose = () => {
    setRaw('');
    setError(null);
    setDone(false);
    onClose();
  };

  const handlePaste = async () => {
    const text = await readClipboard();
    setRaw(text);
    setError(null);
  };

  const handleImport = () => {
    const result = importJson(raw);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    replaceAll(result.data);
    haptics.success();
    setDone(true);
    setTimeout(handleClose, 700);
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Importer des données">
      <View style={{ gap: 16 }}>
        <Text variant="meta" tone="secondary">
          Collez un export JSON de Névé. Les données seront validées avant remplacement.
        </Text>
        <TextInput
          value={raw}
          onChangeText={(v) => {
            setRaw(v);
            setError(null);
          }}
          multiline
          placeholder='{ "schemaVersion": 1, ... }'
          placeholderTextColor={theme.colors.textMuted}
          style={[
            styles.input,
            { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: error ? theme.colors.negative : theme.colors.border },
          ]}
        />
        {error ? (
          <Text variant="meta" tone="negative">
            {error}
          </Text>
        ) : null}
        {done ? (
          <Text variant="meta" tone="positive">
            Import réussi.
          </Text>
        ) : null}
        <View style={{ gap: 10 }}>
          <Button label="Coller depuis le presse-papier" variant="secondary" onPress={handlePaste} />
          <Button label="Importer et remplacer" onPress={handleImport} />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 140,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    fontSize: 13,
    textAlignVertical: 'top',
    fontFamily: 'monospace' as const,
  },
});
