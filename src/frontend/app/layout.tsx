import '@mantine/core/styles.css';
import { ColorSchemeScript } from '@mantine/core';
import '@mantine/carousel/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import Providers from './providers'; // adjust the path if needed
import DarkModeFloatingButton from '../components/DarkModeFloatingButton'; // adjust path

export const metadata = {
  title: 'Auth UI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 👇 This comment absorbs the whitespace that causes hydration mismatch */}
      {/* */}
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body style={{ margin: 0 }}>
        <Providers>
          {children}
          <DarkModeFloatingButton />
        </Providers>
      </body>
    </html>
  );
}