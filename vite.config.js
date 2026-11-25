import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // The admin dashboard (admin/index.html) runs in `npm run dev` only.
      // Add it here once it has a real Supabase login, so it is never public before then.
      input: { main: resolve(import.meta.dirname, 'index.html') },
    },
  },
});
