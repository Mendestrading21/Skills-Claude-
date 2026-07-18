import { Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export async function copyToClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}

export async function readClipboard(): Promise<string> {
  return Clipboard.getStringAsync();
}

/**
 * Trigger a real file download on web. No-op on native (the caller offers a
 * clipboard copy instead — we never pretend a share happened).
 */
export function downloadOnWeb(filename: string, contents: string, mime: string): boolean {
  if (Platform.OS !== 'web') return false;
  const doc = (globalThis as { document?: Document }).document;
  const URLRef = (globalThis as { URL?: typeof URL }).URL;
  if (!doc || !URLRef) return false;
  const blob = new Blob([contents], { type: mime });
  const url = URLRef.createObjectURL(blob);
  const anchor = doc.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  doc.body.appendChild(anchor);
  anchor.click();
  doc.body.removeChild(anchor);
  URLRef.revokeObjectURL(url);
  return true;
}

export const isWeb = Platform.OS === 'web';
