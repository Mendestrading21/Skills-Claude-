import { Redirect } from 'expo-router';

/**
 * Any unmatched path (e.g. when the app is hosted under an arbitrary base URL)
 * falls back to the root, which then routes to onboarding or the tabs.
 */
export default function NotFound() {
  return <Redirect href="/" />;
}
