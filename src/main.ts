import { createApp } from 'vue';
import VueParticles from '@tsparticles/vue3';
import { loadSlim } from '@tsparticles/slim';
import App from './App.vue';
import './style.css';

createApp(App)
  .use(VueParticles, {
    init: async (engine) => {
      await loadSlim(engine);
    },
  })
  .mount('#app');
