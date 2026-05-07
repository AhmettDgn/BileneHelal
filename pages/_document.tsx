import {
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';

/**
 * App Router kullanan projede production build'in beklediği minimal Document shim'i.
 * Route tanımlamaz; sadece Next.js pages runtime beklentisini karşılar.
 */
export default function Document() {
  return (
    <Html lang="tr">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
