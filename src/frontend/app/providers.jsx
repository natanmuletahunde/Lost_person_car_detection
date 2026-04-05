'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

export default function Providers({ children }) {
  return (
    <MantineProvider
      theme={{ primaryColor: 'blue' }}
      defaultColorScheme="light"
    >
      <Notifications
        position="top-right"
        zIndex={9999}
        containerWidth={300}
        limit={3}
      />
      {children}
    </MantineProvider>
  );
}