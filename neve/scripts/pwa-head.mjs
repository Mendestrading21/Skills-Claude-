/**
 * Shared PWA <head> injection used by both the dist post-build step and the
 * self-contained artifact generator. With `web.output: "single"` Expo emits a
 * bare SPA shell, so we bolt the PWA layer on afterwards: web-app manifest,
 * theme colour, iOS "Add to Home Screen" meta tags, and the service-worker
 * registration that makes Névé work offline.
 */

/** Meta/link tags injected into <head>. Uses absolute (/…) asset paths. */
export const PWA_HEAD_TAGS = `
    <meta name="application-name" content="Névé" />
    <meta name="theme-color" content="#07090D" />
    <meta name="color-scheme" content="dark" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Névé" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />`;

/** Inline service-worker registration script (path relative to site root). */
export const SW_REGISTER_SCRIPT = `
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('/sw.js').catch(function () {});
        });
      }
    </script>`;

/** A mobile-friendly viewport that supports iOS safe-area insets. */
const PWA_VIEWPORT =
  '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, shrink-to-fit=no" />';

/**
 * Inject the PWA head tags + SW registration into an Expo SPA index.html string.
 * Idempotent: if the manifest link is already present the input is returned as-is.
 */
export function injectPwa(html) {
  if (html.includes('rel="manifest"')) {
    return html;
  }

  let out = html;

  // Upgrade the default viewport to one that respects the notch/safe areas.
  out = out.replace(
    /<meta name="viewport"[^>]*\/>/,
    PWA_VIEWPORT,
  );

  // Set the document language to French.
  out = out.replace('<html lang="en">', '<html lang="fr">');

  // Insert head tags + SW registration just before </head>.
  out = out.replace('</head>', `${PWA_HEAD_TAGS}${SW_REGISTER_SCRIPT}\n  </head>`);

  return out;
}
