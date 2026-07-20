import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

/** GitHub Pages project site: /sanjaibirthdaywishes/ — Vercel/root uses '/' */
const base =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.VITE_BASE || '/';

export default defineConfig({
  plugins: [vue()],
  base,
});
