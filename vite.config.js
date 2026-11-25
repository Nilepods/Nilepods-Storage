import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        // Studio admin: email-link sign-in; access is checked by the database (staff table).
        admin: resolve(import.meta.dirname, 'admin/index.html'),
      },
    },
  },
});
