import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

/** GitHub Pages project site: /sanjaibirthdaywishes/ — Vercel/root uses '/' */
const base = process.env.VITE_BASE || '/';

export default defineConfig({
  plugins: [vue()],
  base,
});
