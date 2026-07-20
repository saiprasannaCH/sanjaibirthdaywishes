<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import type { ISourceOptions } from '@tsparticles/engine';
import confetti from 'canvas-confetti';
import { gsap } from 'gsap';
import { Howl, Howler } from 'howler';
import LightArch from './components/LightArch.vue';
import RealBouquet from './components/RealBouquet.vue';
import BirthdayCake from './components/BirthdayCake.vue';
import {
  balloonWishes,
  bouquetMeaning,
  bouquetMessage,
  constellationNotes,
  letterLines,
  photoFrames,
  reasonCards,
  writtenMemories,
} from './content';
import {
  RECIPIENT_NAME,
  UNLOCK_AT,
  UNLOCK_DATE_LABEL,
  UNLOCK_TIME_LABEL,
} from './config';

/** Preview button only in local `npm run dev` */
const SHOW_PREVIEW_ENTER = import.meta.env.DEV;

type Screen =
  | 'intro'
  | 'trap'
  | 'reasons'
  | 'balloons'
  | 'photos'
  | 'memories'
  | 'bouquet'
  | 'cake'
  | 'letter'
  | 'constellation'
  | 'finale';

const screenOrder: Screen[] = [
  'intro',
  'trap',
  'reasons',
  'balloons',
  'photos',
  'memories',
  'bouquet',
  'cake',
  'letter',
  'constellation',
  'finale',
];

interface WishBalloon {
  id: number;
  emoji: string;
  label: string;
  wish: string;
  tint: string;
  popped: boolean;
}

const screen = ref<Screen>('intro');
const introPhase = ref<'sealed' | 'opening' | 'ready'>('sealed');
const envelopeOpen = ref(false);
const isMuted = ref(false);
const earlyPreview = ref(false);
const now = ref(Date.now());
const candlesLit = ref(true);

let countdownTimer: number | undefined;
const noOffset = ref({ x: 0, y: 0 });
const trapPrompt = ref('Would you like to see more?');
const reasonIndex = ref(0);
const activePhoto = ref(0);
const memoryIndex = ref(0);
const customMemory = ref('');
const savedCustomMemory = ref('');
const letterText = ref('');
const revealedStars = ref<number[]>([]);
const photoBroken = ref<Record<number, boolean>>({});
/** Themes: ember · pastel · blush · noir · midnight (navy+gold) · rose (cream+rose) */
type ThemeId = 'ember' | 'pastel' | 'blush' | 'noir' | 'midnight' | 'rose';
const theme = ref<ThemeId>('ember');
const THEME_IDS: ThemeId[] = ['ember', 'pastel', 'blush', 'noir', 'midnight', 'rose'];

const trapArenaRef = ref<HTMLElement | null>(null);
const noButtonRef = ref<HTMLButtonElement | null>(null);

const balloons = ref<WishBalloon[]>(
  balloonWishes.map((wish) => ({
    ...wish,
    popped: false,
  })),
);

const balloonTintsByTheme: Record<ThemeId, string[]> = {
  pastel: ['#c9b8e8', '#9b7bb8', '#7a5f9a', '#a8d9b8', '#7eb89a'],
  ember: ['#e8a05a', '#e87820', '#c45f10', '#e08a30', '#d97828'],
  blush: ['#ffd0dc', '#ff8fab', '#f0638a', '#ffb4c8', '#ff9eb5'],
  noir: ['#d4c4f0', '#b8a0d8', '#9b7bb8', '#7a5f9a', '#c9b8e8'],
  midnight: ['#f0d78c', '#d4a017', '#b8860b', '#c9a227', '#e8c547'],
  rose: ['#e8b4b8', '#c97b84', '#a85d66', '#d4a0a6', '#b87078'],
};

const particleColorsByTheme: Record<ThemeId, string[]> = {
  ember: ['#ffffff', '#e8a05a', '#e87820', '#c45f10'],
  pastel: ['#ffffff', '#e8dff5', '#c9b8e8', '#9b7bb8', '#a8d9b8'],
  blush: ['#ffffff', '#ffe4ec', '#ffd0dc', '#ff8fab', '#f0638a'],
  noir: ['#ffffff', '#e8dff5', '#d4c4f0', '#b8a0d8', '#9b7bb8'],
  midnight: ['#ffffff', '#f5e6b8', '#d4a017', '#b8860b', '#7a91c4'],
  rose: ['#ffffff', '#f7f1ea', '#e8b4b8', '#c97b84', '#a85d66'],
};

const confettiColorsByTheme: Record<ThemeId, string[]> = {
  ember: ['#ffffff', '#e8a05a', '#e87820', '#c45f10', '#e08a30'],
  pastel: ['#ffffff', '#e8dff5', '#c9b8e8', '#9b7bb8', '#a8d9b8', '#7eb89a', '#b8e6c8'],
  blush: ['#ffffff', '#fff5f8', '#ffd0dc', '#ff8fab', '#f0638a', '#ffb4c8'],
  noir: ['#ffffff', '#e8dff5', '#d4c4f0', '#b8a0d8', '#9b7bb8', '#7a5f9a'],
  midnight: ['#ffffff', '#f5e6b8', '#d4a017', '#b8860b', '#c9a227', '#3d5a80'],
  rose: ['#ffffff', '#f7f1ea', '#e8d5c4', '#c97b84', '#a85d66', '#d4a0a6'],
};

watch(
  theme,
  (next) => {
    const tints = balloonTintsByTheme[next];
    balloons.value.forEach((balloon, index) => {
      balloon.tint = tints[index % tints.length];
    });
  },
  { immediate: true },
);

let music: Howl | null = null;
let typingToken = 0;

const screenIndex = computed(() => screenOrder.indexOf(screen.value));
const totalScreens = screenOrder.length;
const poppedCount = computed(() => balloons.value.filter((b) => b.popped).length);
const allBalloonsPopped = computed(() => poppedCount.value === balloons.value.length);
const allStarsRevealed = computed(() => revealedStars.value.length === constellationNotes.length);
const canAdvanceReasons = computed(() => reasonIndex.value >= reasonCards.length - 1);
const canAdvanceMemories = computed(() => memoryIndex.value >= writtenMemories.length - 1);
const canGoBack = computed(() => screenIndex.value > 0);
/** Cake screen always stays lavender + mint */
const shellThemeClass = computed(() =>
  screen.value === 'cake' ? 'theme-pastel' : `theme-${theme.value}`,
);

const activePalette = computed(() => (screen.value === 'cake' ? 'pastel' : theme.value));

const isUnlocked = computed(() => earlyPreview.value || now.value >= UNLOCK_AT);

const countdown = computed(() => {
  const remaining = Math.max(0, UNLOCK_AT - now.value);
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    days,
    hours,
    minutes,
    seconds,
    pad: (n: number) => String(n).padStart(2, '0'),
  };
});

const particleOptions = computed<ISourceOptions>(() => ({
  fullScreen: { enable: false },
  detectRetina: true,
  background: { color: 'transparent' },
  particles: {
    number: { value: 32, density: { enable: true } },
    color: { value: particleColorsByTheme[activePalette.value] },
    shape: { type: 'circle' },
    opacity: {
      value: { min: 0.15, max: 0.55 },
      animation: { enable: true, speed: 0.45, sync: false },
    },
    size: { value: { min: 1.5, max: 4 } },
    move: {
      enable: true,
      speed: { min: 0.1, max: 0.4 },
      direction: 'none',
      outModes: { default: 'out' },
    },
  },
}));

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function softConfetti(x = 0.5, y = 0.45) {
  confetti({
    particleCount: 48,
    spread: 64,
    origin: { x, y },
    colors: confettiColorsByTheme[activePalette.value],
    zIndex: 50,
  });
}

function setTheme(next: ThemeId) {
  theme.value = next;
  try {
    localStorage.setItem('sanjai-theme', next);
  } catch {
    /* ignore */
  }
}

function initMusic() {
  if (music) return;
  music = new Howl({
    src: ['https://assets.mixkit.co/music/preview/mixkit-sleepy-cat-135.mp3'],
    loop: true,
    volume: 0,
    html5: true,
  });
  Howler.volume(0.75);
  music.play();
  music.fade(0, 0.3, 1400);
}

function toggleMusic() {
  isMuted.value = !isMuted.value;
  if (!music) return;
  music.fade(isMuted.value ? 0.3 : 0, isMuted.value ? 0 : 0.3, 400);
}

function enterPreview() {
  earlyPreview.value = true;
}

function applyUrlUnlock() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('enter') === '1' || params.get('preview') === '1') {
      earlyPreview.value = true;
    }
  } catch {
    /* ignore */
  }
}

async function openEnvelope() {
  if (!isUnlocked.value || introPhase.value !== 'sealed') return;
  introPhase.value = 'opening';
  envelopeOpen.value = true;
  initMusic();

  gsap.to('.seal', { scale: 0.2, opacity: 0, rotation: 28, duration: 0.45, ease: 'power2.in' });
  gsap.to('.flap', {
    rotateX: 180,
    duration: 0.85,
    ease: 'power3.inOut',
    transformOrigin: 'top center',
  });

  await wait(520);
  gsap.fromTo(
    '.letter-card',
    { y: 40, opacity: 0, scale: 0.94 },
    { y: -18, opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' },
  );
  softConfetti(0.5, 0.55);
  await wait(650);
  introPhase.value = 'ready';
}

async function goTo(next: Screen) {
  screen.value = next;
  await nextTick();

  if (next === 'trap') {
    trapPrompt.value = 'Would you like to see more?';
    await nextTick();
    const arena = trapArenaRef.value;
    const button = noButtonRef.value;
    if (arena && button) {
      const maxX = Math.max(0, arena.clientWidth - button.offsetWidth - 24);
      noOffset.value = { x: Math.min(maxX, Math.max(150, maxX * 0.58)), y: 78 };
    }
    gsap.fromTo('.trap-panel', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' });
    return;
  }

  if (next === 'reasons') {
    gsap.fromTo('.reason-card', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' });
    return;
  }

  if (next === 'balloons') {
    gsap.fromTo(
      '.balloon-slot',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.4)' },
    );
    return;
  }

  if (next === 'photos') {
    gsap.fromTo('.photo-stage', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    return;
  }

  if (next === 'memories') {
    gsap.fromTo('.memory-paper', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' });
    return;
  }

  if (next === 'bouquet') {
    gsap.fromTo('.real-bouquet', { opacity: 0, y: 30, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power3.out' });
    softConfetti(0.5, 0.55);
    return;
  }

  if (next === 'cake') {
    candlesLit.value = true;
    gsap.fromTo('.cake-panel', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
    return;
  }

  if (next === 'letter') {
    letterText.value = '';
    void typeLetter();
    return;
  }

  if (next === 'constellation') {
    gsap.fromTo('.star-field', { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out' });
    return;
  }

  if (next === 'finale') {
    softConfetti(0.5, 0.4);
    gsap.fromTo(
      '.finale-panel',
      { opacity: 0, y: 26, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power3.out' },
    );
  }
}

function goBack() {
  const idx = screenIndex.value;
  if (idx <= 0) return;
  void goTo(screenOrder[idx - 1]);
}

function continueFromIntro() {
  void goTo('trap');
}

function acceptMore() {
  void goTo('reasons');
}

function moveNoButton(event?: MouseEvent | TouchEvent) {
  const arena = trapArenaRef.value;
  const button = noButtonRef.value;
  if (!arena || !button) return;

  const arenaRect = arena.getBoundingClientRect();
  const btnRect = button.getBoundingClientRect();
  const padding = 10;
  const maxX = Math.max(0, arenaRect.width - btnRect.width - padding * 2);
  const maxY = Math.max(0, arenaRect.height - btnRect.height - padding * 2);

  let nextX = Math.random() * maxX;
  let nextY = Math.random() * maxY;

  if (event) {
    const point =
      'touches' in event
        ? { x: event.touches[0]?.clientX ?? 0, y: event.touches[0]?.clientY ?? 0 }
        : { x: event.clientX, y: event.clientY };
    const relativeX = point.x - arenaRect.left - btnRect.width / 2;
    const relativeY = point.y - arenaRect.top - btnRect.height / 2;
    nextX = Math.min(maxX, Math.max(0, relativeX + (Math.random() > 0.5 ? 130 : -130)));
    nextY = Math.min(maxY, Math.max(0, relativeY + (Math.random() > 0.5 ? 95 : -95)));
  }

  noOffset.value = { x: nextX, y: nextY };
  const teases = [
    'Nice try 😌',
    'Only YES works today',
    'The No keeps running',
    'Be sweet… tap YES',
    'Nope — try the other one',
  ];
  trapPrompt.value = teases[Math.floor(Math.random() * teases.length)];
}

function blockNoClick(event: Event) {
  event.preventDefault();
  event.stopPropagation();
  moveNoButton(event as MouseEvent);
}

function nextReason() {
  if (reasonIndex.value < reasonCards.length - 1) {
    reasonIndex.value += 1;
    gsap.fromTo('.reason-card', { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' });
  }
}

function popBalloon(balloon: WishBalloon, event: MouseEvent) {
  if (balloon.popped) return;
  balloon.popped = true;
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  softConfetti((rect.left + rect.width / 2) / window.innerWidth, (rect.top + rect.height / 2) / window.innerHeight);
}

function nextPhoto() {
  activePhoto.value = (activePhoto.value + 1) % photoFrames.length;
  gsap.fromTo('.polaroid', { opacity: 0.4, x: 18 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' });
}

function prevPhoto() {
  activePhoto.value = (activePhoto.value - 1 + photoFrames.length) % photoFrames.length;
  gsap.fromTo('.polaroid', { opacity: 0.4, x: -18 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' });
}

function goToPhoto(index: number) {
  if (index === activePhoto.value) return;
  activePhoto.value = index;
  gsap.fromTo('.polaroid', { opacity: 0.35, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' });
}

function onPhotoError(index: number) {
  photoBroken.value = { ...photoBroken.value, [index]: true };
}

function nextMemory() {
  if (memoryIndex.value < writtenMemories.length - 1) {
    memoryIndex.value += 1;
    gsap.fromTo('.memory-entry', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
  }
}

function prevMemory() {
  if (memoryIndex.value > 0) {
    memoryIndex.value -= 1;
    gsap.fromTo('.memory-entry', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' });
  }
}

function saveMemoryNote() {
  const note = customMemory.value.trim();
  if (!note) return;
  savedCustomMemory.value = note;
  customMemory.value = '';
  softConfetti(0.5, 0.7);
}

async function typeLetter() {
  const token = ++typingToken;
  letterText.value = '';
  const full = letterLines.join('\n');
  for (const character of full) {
    if (token !== typingToken) return;
    letterText.value += character;
    await wait(character === '\n' ? 280 : character === ' ' ? 22 : 34);
  }
}

function revealStar(index: number) {
  if (revealedStars.value.includes(index)) return;
  revealedStars.value = [...revealedStars.value, index];
  softConfetti(0.35 + Math.random() * 0.3, 0.35 + Math.random() * 0.2);
}

async function blowCandles() {
  if (!candlesLit.value) return;
  gsap.to('.flame', { scale: 1.5, opacity: 0, y: -20, stagger: 0.06, duration: 0.45, ease: 'power2.out' });
  await wait(480);
  candlesLit.value = false;
  softConfetti(0.5, 0.42);
  softConfetti(0.35, 0.5);
  softConfetti(0.65, 0.5);
}

onMounted(() => {
  applyUrlUnlock();
  try {
    const saved = localStorage.getItem('sanjai-theme');
    if (saved && THEME_IDS.includes(saved as ThemeId)) theme.value = saved as ThemeId;
  } catch {
    /* ignore */
  }

  countdownTimer = window.setInterval(() => {
    now.value = Date.now();
  }, 1000);

  gsap.fromTo(
    '.intro-title-line',
    { y: 36, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.85, stagger: 0.12, ease: 'power3.out', delay: 0.12 },
  );
  gsap.fromTo(
    '.countdown-panel, .envelope',
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.95, ease: 'power3.out', delay: 0.28 },
  );
});

onUnmounted(() => {
  if (countdownTimer) window.clearInterval(countdownTimer);
  music?.stop();
});
</script>

<template>
  <div class="app-shell" :class="shellThemeClass">
    <vue-particles
      v-show="screen !== 'cake'"
      id="birthday-particles"
      class="particles-layer"
      :options="particleOptions"
    />
    <div class="blush blush-a" aria-hidden="true"></div>
    <div class="blush blush-b" aria-hidden="true"></div>
    <div class="soft-grid" aria-hidden="true"></div>

    <div class="theme-balls" role="group" aria-label="Theme colors">
      <button
        class="theme-ball theme-ball-ember"
        type="button"
        :class="{ active: theme === 'ember' }"
        aria-label="Black and orange theme"
        title="Black & orange"
        @click="setTheme('ember')"
      ></button>
      <button
        class="theme-ball theme-ball-pastel"
        type="button"
        :class="{ active: theme === 'pastel' }"
        aria-label="Lavender and mint theme"
        title="Lavender & mint"
        @click="setTheme('pastel')"
      ></button>
      <button
        class="theme-ball theme-ball-blush"
        type="button"
        :class="{ active: theme === 'blush' }"
        aria-label="White and baby pink theme"
        title="White & baby pink"
        @click="setTheme('blush')"
      ></button>
      <button
        class="theme-ball theme-ball-noir"
        type="button"
        :class="{ active: theme === 'noir' }"
        aria-label="Lavender and black theme"
        title="Lavender & black"
        @click="setTheme('noir')"
      ></button>
      <button
        class="theme-ball theme-ball-midnight"
        type="button"
        :class="{ active: theme === 'midnight' }"
        aria-label="Navy and gold theme"
        title="Navy & gold"
        @click="setTheme('midnight')"
      ></button>
      <button
        class="theme-ball theme-ball-rose"
        type="button"
        :class="{ active: theme === 'rose' }"
        aria-label="Cream and rose theme"
        title="Cream & rose"
        @click="setTheme('rose')"
      ></button>
    </div>

    <button
      v-if="canGoBack"
      class="back-chip"
      type="button"
      @click="goBack"
    >
      ← Back
    </button>

    <button
      v-if="screen !== 'intro' || introPhase === 'ready'"
      class="music-chip"
      type="button"
      @click="toggleMusic"
    >
      {{ isMuted ? 'Unmute' : 'Mute' }}
    </button>

    <p v-if="screen !== 'intro'" class="screen-meter">{{ screenIndex + 1 }} / {{ totalScreens }}</p>

    <!-- 1. INTRO / LOCK GATE -->
    <section v-if="screen === 'intro'" class="screen intro-screen">
      <LightArch />

      <div class="intro-copy">
        <p class="kicker intro-title-line">A private little surprise</p>
        <h1 class="intro-heading">
          <span class="intro-title-line soft">For</span>
          <span class="intro-title-line name">{{ RECIPIENT_NAME }}</span>
        </h1>
        <p class="lede intro-title-line">
          {{
            isUnlocked
              ? 'Tap the seal. Let the day unfold, one soft screen at a time.'
              : `This surprise unlocks on ${UNLOCK_DATE_LABEL} at ${UNLOCK_TIME_LABEL}.`
          }}
        </p>
      </div>

      <div v-if="!isUnlocked" class="countdown-panel glass">
        <p class="kicker">Until the birthday begins</p>
        <div class="countdown-grid" aria-live="polite">
          <div class="count-cell">
            <strong>{{ countdown.pad(countdown.days) }}</strong>
            <span>Days</span>
          </div>
          <div class="count-cell">
            <strong>{{ countdown.pad(countdown.hours) }}</strong>
            <span>Hours</span>
          </div>
          <div class="count-cell">
            <strong>{{ countdown.pad(countdown.minutes) }}</strong>
            <span>Mins</span>
          </div>
          <div class="count-cell">
            <strong>{{ countdown.pad(countdown.seconds) }}</strong>
            <span>Secs</span>
          </div>
        </div>
        <p class="countdown-note">Opens automatically at {{ UNLOCK_TIME_LABEL }} on {{ UNLOCK_DATE_LABEL }}.</p>

        <button
          v-if="SHOW_PREVIEW_ENTER"
          class="ghost-btn preview-enter"
          type="button"
          @click="enterPreview"
        >
          Preview enter (dev only)
        </button>
      </div>

      <template v-else>
        <button
          class="envelope"
          type="button"
          :class="{ open: envelopeOpen }"
          :disabled="introPhase !== 'sealed'"
          aria-label="Open birthday envelope"
          @click="openEnvelope"
        >
          <div class="flap"></div>
          <div class="pocket"></div>
          <div class="seal">♡</div>
          <div class="letter-card" aria-hidden="true">
            <p>Happy Birthday</p>
            <strong>{{ RECIPIENT_NAME }}</strong>
            <span>something soft, made for you</span>
          </div>
        </button>

        <button v-if="introPhase === 'ready'" class="cta" type="button" @click="continueFromIntro">
          Begin the journey
        </button>
      </template>
    </section>

    <!-- 2. TRAP -->
    <section v-else-if="screen === 'trap'" class="screen">
      <div class="trap-panel glass">
        <p class="kicker">Honest question</p>
        <h2>{{ trapPrompt }}</h2>
        <p class="lede compact">Yes opens the next surprise. No is… emotionally unavailable.</p>
        <div ref="trapArenaRef" class="trap-arena">
          <button class="cta yes-btn" type="button" @click="acceptMore">Yes, show me</button>
          <button
            ref="noButtonRef"
            class="ghost-btn no-btn"
            type="button"
            :style="{ transform: `translate(${noOffset.x}px, ${noOffset.y}px)` }"
            @mouseenter="moveNoButton"
            @mousemove="moveNoButton"
            @touchstart.prevent="moveNoButton"
            @click="blockNoClick"
          >
            No
          </button>
        </div>
      </div>
    </section>

    <!-- 3. REASONS -->
    <section v-else-if="screen === 'reasons'" class="screen">
      <header class="section-head">
        <p class="kicker">Little truths · {{ reasonIndex + 1 }}/{{ reasonCards.length }}</p>
        <h2>Things that feel special about you</h2>
      </header>

      <article class="reason-card glass">
        <span class="reason-emoji">{{ reasonCards[reasonIndex].emoji }}</span>
        <h3>{{ reasonCards[reasonIndex].title }}</h3>
        <p>{{ reasonCards[reasonIndex].text }}</p>
      </article>

      <div class="row-actions">
        <button v-if="!canAdvanceReasons" class="cta" type="button" @click="nextReason">Next little truth</button>
        <button v-else class="cta" type="button" @click="goTo('balloons')">Continue</button>
      </div>
    </section>

    <!-- 4. BALLOONS -->
    <section v-else-if="screen === 'balloons'" class="screen balloons-screen">
      <header class="section-head">
        <p class="kicker">Pop to reveal · {{ poppedCount }}/5</p>
        <h2>Five soft balloons</h2>
        <p class="lede compact">Each wish is hiding right behind the balloon.</p>
      </header>

      <div class="balloon-stage">
        <button
          v-for="balloon in balloons"
          :key="balloon.id"
          class="balloon-slot"
          type="button"
          :class="{ popped: balloon.popped }"
          :style="{ '--tint': balloon.tint }"
          @click="popBalloon(balloon, $event)"
        >
          <div class="wish-behind">
            <span class="wish-emoji">{{ balloon.emoji }}</span>
            <span class="wish-label">{{ balloon.label }}</span>
            <p class="wish-text">{{ balloon.wish }}</p>
          </div>
          <div class="balloon-layer" aria-hidden="true">
            <div class="balloon-body">
              <span class="shine"></span>
              <span class="face">{{ balloon.emoji }}</span>
            </div>
            <div class="string"></div>
            <div class="pop-burst">✦</div>
          </div>
        </button>
      </div>

      <button v-if="allBalloonsPopped" class="cta" type="button" @click="goTo('photos')">See our moments</button>
    </section>

    <!-- 5. PHOTOS -->
    <section v-else-if="screen === 'photos'" class="screen">
      <header class="section-head">
        <p class="kicker">Photo reel · {{ activePhoto + 1 }}/{{ photoFrames.length }}</p>
        <h2>Frames that feel like home</h2>
        <p class="lede compact">Swipe or tap the arrows · add pictures in <code>public/photos</code></p>
      </header>

      <div class="photo-stage">
        <button class="nav-chip" type="button" aria-label="Previous photo" @click.stop="prevPhoto">←</button>

        <figure class="polaroid">
          <div class="photo-frame">
            <img
              v-if="!photoBroken[activePhoto]"
              :key="activePhoto"
              :src="photoFrames[activePhoto].src"
              :alt="photoFrames[activePhoto].caption"
              @error="onPhotoError(activePhoto)"
            />
            <div v-else class="photo-fallback">
              <span>{{ photoFrames[activePhoto].fallback }}</span>
              <p>Drop a photo here later</p>
            </div>
          </div>
          <figcaption>{{ photoFrames[activePhoto].caption }}</figcaption>
        </figure>

        <button class="nav-chip" type="button" aria-label="Next photo" @click.stop="nextPhoto">→</button>
      </div>

      <div class="photo-nav-mobile">
        <button class="nav-chip" type="button" @click.stop="prevPhoto">← Prev</button>
        <button class="nav-chip" type="button" @click.stop="nextPhoto">Next →</button>
      </div>

      <div class="photo-dots">
        <button
          v-for="(_, i) in photoFrames"
          :key="i"
          type="button"
          class="photo-dot"
          :class="{ on: i === activePhoto }"
          :aria-label="`Photo ${i + 1}`"
          @click="goToPhoto(i)"
        ></button>
      </div>

      <button class="cta" type="button" @click="goTo('memories')">Read the memories</button>
    </section>

    <!-- 6. MEMORIES -->
    <section v-else-if="screen === 'memories'" class="screen">
      <header class="section-head">
        <p class="kicker">Soft pages · {{ memoryIndex + 1 }}/{{ writtenMemories.length }}</p>
        <h2>Memories I keep from our time</h2>
      </header>

      <div class="memory-paper glass">
        <article class="memory-entry">
          <p class="memory-title">{{ writtenMemories[memoryIndex].title }}</p>
          <p class="memory-text">{{ writtenMemories[memoryIndex].text }}</p>
        </article>

        <div class="write-pad">
          <label for="memory-note">Add one more memory</label>
          <textarea
            id="memory-note"
            v-model="customMemory"
            rows="3"
            maxlength="220"
            placeholder="A moment you never want to forget…"
          ></textarea>
          <button class="ghost-btn" type="button" @click="saveMemoryNote">Save this memory</button>
          <p v-if="savedCustomMemory" class="saved-note">“{{ savedCustomMemory }}”</p>
        </div>
      </div>

      <div class="row-actions">
        <button
          v-if="memoryIndex > 0"
          class="ghost-btn"
          type="button"
          @click="prevMemory"
        >
          ← Prev memory
        </button>
        <button v-if="!canAdvanceMemories" class="cta" type="button" @click="nextMemory">Next memory</button>
        <button v-else class="cta" type="button" @click="goTo('bouquet')">A bouquet for you</button>
      </div>
    </section>

    <!-- 7. BOUQUET -->
    <section v-else-if="screen === 'bouquet'" class="screen">
      <div class="bouquet-panel glass">
        <p class="kicker">Fresh for you</p>
        <h2>This bouquet, for you</h2>
        <RealBouquet />
        <ul class="bouquet-meaning">
          <li v-for="item in bouquetMeaning" :key="item.text">
            <span>{{ item.emoji }}</span>{{ item.text }}
          </li>
        </ul>
        <p class="bouquet-message">{{ bouquetMessage }}</p>
        <button class="cta" type="button" @click="goTo('cake')">Now the cake</button>
      </div>
    </section>

    <!-- CAKE -->
    <section v-else-if="screen === 'cake'" class="screen cake-screen">
      <div class="cake-panel glass">
        <p class="kicker">Make a wish</p>
        <h2>For sleepy guy</h2>
        <p class="lede compact">A soft cake, lit candles, and wishes written just for you.</p>
        <BirthdayCake :candles-lit="candlesLit" @blow="blowCandles" />
        <button
          v-if="!candlesLit"
          class="cta"
          type="button"
          @click="goTo('letter')"
        >
          Open the letter
        </button>
      </div>
    </section>

    <!-- 8. LETTER -->
    <section v-else-if="screen === 'letter'" class="screen">
      <header class="section-head">
        <p class="kicker">A quiet letter</p>
        <h2>Words I wanted you to read</h2>
      </header>
      <div class="letter-sheet glass">
        <pre class="typewriter">{{ letterText }}<span class="cursor">|</span></pre>
      </div>
      <button class="cta" type="button" @click="goTo('constellation')">Catch the stars</button>
    </section>

    <!-- 9. CONSTELLATION -->
    <section v-else-if="screen === 'constellation'" class="screen">
      <header class="section-head">
        <p class="kicker">Tap every star · {{ revealedStars.length }}/{{ constellationNotes.length }}</p>
        <h2>A sky made of soft wishes</h2>
      </header>

      <div class="star-field">
        <button
          v-for="(note, index) in constellationNotes"
          :key="note"
          class="star"
          type="button"
          :class="{ lit: revealedStars.includes(index) }"
          :style="{ '--x': `${12 + (index % 3) * 32}%`, '--y': `${18 + Math.floor(index / 3) * 34}%` }"
          @click="revealStar(index)"
        >
          <span class="star-glyph">✦</span>
          <span v-if="revealedStars.includes(index)" class="star-note">{{ note }}</span>
        </button>
      </div>

      <button v-if="allStarsRevealed" class="cta" type="button" @click="goTo('finale')">Final surprise</button>
    </section>

    <!-- 10. FINALE -->
    <section v-else class="screen finale-screen">
      <div class="finale-panel glass">
        <p class="kicker">Last frame</p>
        <h2>Happy Birthday, {{ RECIPIENT_NAME }}</h2>
        <p class="lede">
          Happy Birthday, {{ RECIPIENT_NAME }}! 🎉

I don't think you realize how rare a person you are. In a world where people often judge, misunderstand, or pretend to be someone they're not, you choose to be genuine. You're kind, caring, honest, and you always try to see the good in people. That's something I truly admire about you.

I'm really glad our paths crossed. Every conversation with you has been comfortable, and your positive nature has made a difference in ways you probably don't even know. You have a way of making people feel heard and valued, and that's a beautiful quality to have.

On your special day, I just want to say thank you for being exactly who you are. Never lose your kindness or your beautiful heart. I hope this year brings you good health, endless happiness, success in everything you work for, and people who appreciate you as much as you deserve.

Keep smiling, keep being the amazing person you are, and may all your dreams come true.

Happy Birthday once again, {{ RECIPIENT_NAME }} Have the most wonderful year ahead. 🤍         </p>
        <p class="stamp">HBD {{ RECIPIENT_NAME }} ♡</p>
        <div class="emoji-row" aria-hidden="true">
          <span>🎀</span><span>🌸</span><span>✨</span><span>🤍</span><span>💌</span>
        </div>
      </div>
    </section>
  </div>
</template>
