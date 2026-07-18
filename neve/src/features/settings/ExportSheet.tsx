import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BottomSheet, Button, Text } from '@/components';
import { useAppStore } from '@/store';
import { exportJson, exportTransactionsCsv } from '@/data/exchange';
import { APP_SLUG } from '@/config/app';
import { useTheme } from '@/theme';
import { copyToClipboard, downloadOnWeb, isWeb } from './shareData';

export function ExportSheet({
  visible,
  format,
  onClose,
}: {
  visible: boolean;
  format: 'json' | 'csv';
  onClose: () => void;
}) {
  const theme = useTheme();
  const data = useAppStore((s) => s.data);
  const [status, setStatus] = useState<string | null>(null);

  const contents = format === 'json' ? exportJson(data) : exportTransactionsCsv(data);
  const filename = format === 'json' ? `${APP_SLUG}-export.json` : `${APP_SLUG}-transactions.csv`;
  const mime = format === 'json' ? 'application/json' : 'text/csv';

  const handleCopy = async () => {
    await copyToClipboard(contents);
    setStatus('Copié dans le presse-papier.');
  };

  const handleDownload = () => {
    const ok = downloadOnWeb(filename, contents, mime);
    setStatus(ok ? 'Téléchargement lancé.' : 'Téléchargement indisponible ici.');
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={`Exporter (${format.toUpperCase()})`}>
      <View style={{ gap: 16 }}>
        <Text variant="meta" tone="secondary">
          {format === 'json'
            ? 'Sauvegarde complète de vos données locales.'
            : 'Vos transactions au format tableur.'}
        </Text>
        <ScrollView
          style={[styles.preview, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
          contentContainerStyle={{ padding: 12 }}
        >
          <Text variant="micro" tone="muted" selectable style={styles.mono}>
            {contents.length > 4000 ? `${contents.slice(0, 4000)}\n… (${contents.length} caractères)` : contents}
          </Text>
        </ScrollView>
        {status ? (
          <Text variant="meta" tone="accent">
            {status}
          </Text>
        ) : null}
        <View style={{ gap: 10 }}>
          <Button label="Copier" onPress={handleCopy} />
          {isWeb ? <Button label="Télécharger" variant="secondary" onPress={handleDownload} /> : null}
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  preview: { maxHeight: 220, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
  mono: { fontFamily: 'monospace' as const, lineHeight: 16 },
});
