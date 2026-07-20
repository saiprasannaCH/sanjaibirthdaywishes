import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  /** GitHub Pages: /sanjaibirthdaywishes/ — local/Vercel: / */
  const base = env.VITE_BASE || '/';

  return {
    plugins: [vue()],
    base,
  };
});
