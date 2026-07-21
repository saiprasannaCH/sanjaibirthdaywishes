<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import type { ISourceOptions } from '@tsparticles/engine';
import confettiPkg from 'canvas-confetti';
import type { CreateTypes, Options as ConfettiOptions } from 'canvas-confetti';
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

const butterflySrc = (file: string) =>
  `${import.meta.env.BASE_URL}butterflies/${file}?v=3`;

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
const themesHidden = ref(false);
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

const sceneButterflies = [
  { id: 1, src: butterflySrc('butterfly-1.png'), x: -2, y: 8, size: 1.05, duration: 22, delay: 0, drift: 42 },
  { id: 2, src: butterflySrc('butterfly-2.png'), x: 88, y: 12, size: 0.95, duration: 26, delay: 2.5, drift: -38 },
  { id: 3, src: butterflySrc('butterfly-3.png'), x: -4, y: 42, size: 0.9, duration: 24, delay: 1.2, drift: 34 },
  { id: 4, src: butterflySrc('butterfly-4.png'), x: 90, y: 48, size: 1, duration: 28, delay: 3.8, drift: -36 },
  { id: 5, src: butterflySrc('butterfly-5.png'), x: 78, y: 28, size: 0.92, duration: 25, delay: 0.8, drift: 28 },
] as const;

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
let musicTrackIndex = 0;
let musicCutTimer: number | undefined;
/** Prevent onend from double-advancing when we intentionally stop/cut a track */
let musicSkipEnd = false;
let typingToken = 0;

const musicSrc = (file: string) =>
  `${import.meta.env.BASE_URL}music/${file
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')}`;

/** HBD 10s → Remo → Anbe → Love Bug → Dheema (then loops from Remo) */
const musicPlaylist: Array<{ file: string; maxMs?: number }> = [
  { file: 'Happy Birthday Instrumental.mp3', maxMs: 10000 },
  { file: 'remo_movie_love_bgm.mp3' },
  { file: 'anbe_en_anbe.mp3' },
  { file: 'love_bug_remo.mp3' },
  { file: 'dheema_instrumental_bgm (1).mp3' },
];

const MUSIC_LOOP_START = 1;

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

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/** Soft floating sparkles on pages */
const particleOptions = computed<ISourceOptions>(() => ({
  fullScreen: { enable: false },
  detectRetina: true,
  background: { color: 'transparent' },
  particles: {
    number: { value: 32, density: { enable: true } },
    color: { value: particleColorsByTheme[activePalette.value] },
    shape: { type: 'circle' },
    opacity: {
      value: { min: 0.15, max: 0.5 },
      animation: { enable: true, speed: 0.45, sync: false },
    },
    size: { value: { min: 1.5, max: 3.5 } },
    move: {
      enable: true,
      speed: { min: 0.1, max: 0.35 },
      direction: 'none',
      outModes: { default: 'out' },
    },
  },
}));

/** Resolve canvas-confetti across CJS/ESM shapes */
type ConfettiApi = CreateTypes & {
  create?: (canvas?: HTMLCanvasElement, opts?: { resize?: boolean; useWorker?: boolean }) => CreateTypes;
};

const confettiBase = (
  typeof confettiPkg === 'function'
    ? confettiPkg
    : (confettiPkg as { default: ConfettiApi }).default
) as ConfettiApi;

let partyCannon: CreateTypes | null = null;

function getParty(): CreateTypes {
  if (partyCannon) return partyCannon;
  if (typeof document === 'undefined') return confettiBase;

  let canvas = document.getElementById('hbd-sparkle-canvas') as HTMLCanvasElement | null;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'hbd-sparkle-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    Object.assign(canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '2147483646',
    });
    document.body.appendChild(canvas);
    window.addEventListener(
      'resize',
      () => {
        canvas!.width = window.innerWidth;
        canvas!.height = window.innerHeight;
      },
      { passive: true },
    );
  }

  // useWorker:false — workers were silently failing in this app
  partyCannon = confettiBase.create
    ? confettiBase.create(canvas, { resize: true, useWorker: false })
    : confettiBase;
  return partyCannon;
}

function shoot(opts: ConfettiOptions = {}) {
  try {
    getParty()({
      disableForReducedMotion: false,
      zIndex: 2147483646,
      colors: confettiColorsByTheme[activePalette.value],
      ...opts,
    });
  } catch {
    try {
      confettiBase({
        disableForReducedMotion: false,
        zIndex: 2147483646,
        colors: confettiColorsByTheme[activePalette.value],
        ...opts,
      });
    } catch {
      /* ignore */
    }
  }
}

function softConfetti(x = 0.5, y = 0.45) {
  shoot({
    particleCount: 55,
    spread: 70,
    startVelocity: 32,
    scalar: 0.95,
    origin: { x, y },
  });
}

/** Welcome sparkle blast — first screen on open / refresh */
function welcomeSprinkleBlast() {
  shoot({
    particleCount: 120,
    spread: 100,
    startVelocity: 48,
    scalar: 1,
    origin: { x: 0.5, y: 0.55 },
    shapes: ['circle', 'square'],
  });
  shoot({
    particleCount: 80,
    angle: 60,
    spread: 75,
    startVelocity: 55,
    origin: { x: 0, y: 0.7 },
    shapes: ['circle', 'square'],
  });
  shoot({
    particleCount: 80,
    angle: 120,
    spread: 75,
    startVelocity: 55,
    origin: { x: 1, y: 0.7 },
    shapes: ['circle', 'square'],
  });
  window.setTimeout(() => {
    shoot({
      particleCount: 100,
      spread: 120,
      startVelocity: 42,
      origin: { x: 0.5, y: 0.3 },
      shapes: ['circle', 'square'],
    });
  }, 200);
  window.setTimeout(() => {
    shoot({
      particleCount: 70,
      spread: 90,
      startVelocity: 36,
      origin: { x: 0.25, y: 0.5 },
      shapes: ['circle', 'square'],
    });
    shoot({
      particleCount: 70,
      spread: 90,
      startVelocity: 36,
      origin: { x: 0.75, y: 0.5 },
      shapes: ['circle', 'square'],
    });
  }, 450);
}

interface TapBuddy {
  id: number;
  x: number;
  y: number;
  kind: 'teddy' | 'panda';
  rotate: number;
}

const tapBuddies = ref<TapBuddy[]>([]);
let tapBuddyId = 0;
const TAP_BUDDY_KINDS: Array<'teddy' | 'panda'> = ['teddy', 'panda'];

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      'button, a, input, textarea, select, label, [role="button"], .cta, .nav-chip, .theme-ball, .theme-balls, .theme-toggle, .music-chip, .star, .balloon-slot, .photo-frame, .birthday-cake, .envelope, .no-btn, .yes-btn, .blow-btn',
    ),
  );
}

function spawnTapBuddy(event: MouseEvent | TouchEvent) {
  if (isInteractiveTarget(event.target)) return;

  const point =
    'touches' in event && event.touches[0]
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
      : { x: (event as MouseEvent).clientX, y: (event as MouseEvent).clientY };

  const id = ++tapBuddyId;
  const kind = TAP_BUDDY_KINDS[id % TAP_BUDDY_KINDS.length];
  tapBuddies.value = [
    ...tapBuddies.value.slice(-12),
    {
      id,
      x: point.x,
      y: point.y,
      kind,
      rotate: -8 + Math.random() * 16,
    },
  ];

  softConfetti(point.x / window.innerWidth, point.y / window.innerHeight);

  window.setTimeout(() => {
    tapBuddies.value = tapBuddies.value.filter((buddy) => buddy.id !== id);
  }, 1800);
}

function setTheme(next: ThemeId) {
  theme.value = next;
  try {
    localStorage.setItem('sanjai-theme', next);
  } catch {
    /* ignore */
  }
}

function clearMusicCutTimer() {
  if (musicCutTimer) {
    window.clearTimeout(musicCutTimer);
    musicCutTimer = undefined;
  }
}

function stopCurrentMusic() {
  clearMusicCutTimer();
  if (!music) return;
  musicSkipEnd = true;
  music.off('end');
  music.stop();
  music.unload();
  music = null;
}

function nextMusicTrack() {
  if (musicTrackIndex >= musicPlaylist.length - 1) {
    playMusicTrack(MUSIC_LOOP_START);
  } else {
    playMusicTrack(musicTrackIndex + 1);
  }
}

function playMusicTrack(index: number) {
  stopCurrentMusic();
  musicTrackIndex = index;
  const track = musicPlaylist[index];
  if (!track) return;

  const targetVolume = isMuted.value ? 0 : 0.35;
  musicSkipEnd = false;
  music = new Howl({
    src: [musicSrc(track.file)],
    html5: true,
    volume: 0,
    onend: () => {
      if (musicSkipEnd) return;
      nextMusicTrack();
    },
    onloaderror: () => {
      if (musicSkipEnd) return;
      nextMusicTrack();
    },
  });

  Howler.volume(0.8);
  music.play();
  music.fade(0, targetVolume, 900);

  if (track.maxMs) {
    musicCutTimer = window.setTimeout(() => {
      if (!music) return;
      musicSkipEnd = true;
      const current = music;
      current.fade(current.volume(), 0, 350);
      window.setTimeout(() => {
        if (music === current) {
          current.off('end');
          current.stop();
          current.unload();
          music = null;
        }
        nextMusicTrack();
      }, 360);
    }, track.maxMs);
  }
}

function initMusic() {
  if (music) return;
  playMusicTrack(0);
}

function toggleMusic() {
  isMuted.value = !isMuted.value;
  if (!music) return;
  const next = isMuted.value ? 0 : 0.35;
  const from = music.volume();
  music.fade(from, next, 400);
}

function toggleThemesHidden() {
  themesHidden.value = !themesHidden.value;
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
  if (next !== 'finale') stopFinaleCelebration();
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
    softConfetti(0.5, 0.4);
    softConfetti(0.3, 0.55);
    softConfetti(0.7, 0.55);
    void typeLetter();
    return;
  }

  if (next === 'constellation') {
    gsap.fromTo('.star-field', { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out' });
    return;
  }

  if (next === 'finale') {
    startFinaleCelebration();
    gsap.fromTo(
      '.finale-glow-title, .finale-panel',
      { opacity: 0, y: 26, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.85, stagger: 0.12, ease: 'power3.out' },
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

const CRACKER_TONES = ['gold', 'purple', 'cyan', 'blue', 'green'] as const;
type CrackerTone = (typeof CRACKER_TONES)[number];

interface SkyCracker {
  id: number;
  x: number;
  y: number;
  tone: CrackerTone;
  size: number;
}

const skyCrackers = ref<SkyCracker[]>([]);
let skyCrackerSeq = 0;
let finaleCrackerTimer: number | undefined;

function spawnSkyCracker(forced?: Partial<SkyCracker>) {
  const id = ++skyCrackerSeq;
  const tone = forced?.tone ?? CRACKER_TONES[id % CRACKER_TONES.length];
  const cracker: SkyCracker = {
    id,
    x: forced?.x ?? 10 + Math.random() * 80,
    y: forced?.y ?? 10 + Math.random() * 42,
    tone,
    size: forced?.size ?? 0.7 + Math.random() * 0.65,
  };
  skyCrackers.value = [...skyCrackers.value.slice(-10), cracker];
  window.setTimeout(() => {
    skyCrackers.value = skyCrackers.value.filter((item) => item.id !== id);
  }, 2400);
}

function startFinaleCelebration() {
  stopFinaleCelebration();
  skyCrackers.value = [];

  spawnSkyCracker({ x: 18, y: 28, tone: 'gold', size: 1.15 });
  window.setTimeout(() => spawnSkyCracker({ x: 78, y: 24, tone: 'purple', size: 1.05 }), 280);
  window.setTimeout(() => spawnSkyCracker({ x: 48, y: 36, tone: 'cyan', size: 1.2 }), 520);
  window.setTimeout(() => spawnSkyCracker({ x: 32, y: 18, tone: 'blue', size: 0.85 }), 780);
  window.setTimeout(() => spawnSkyCracker({ x: 65, y: 40, tone: 'green', size: 0.9 }), 980);

  finaleCrackerTimer = window.setInterval(() => {
    spawnSkyCracker();
    window.setTimeout(() => spawnSkyCracker(), 180);
    if (Math.random() > 0.35) {
      window.setTimeout(() => spawnSkyCracker(), 360);
    }
  }, 850);
}

function stopFinaleCelebration() {
  if (finaleCrackerTimer) {
    window.clearInterval(finaleCrackerTimer);
    finaleCrackerTimer = undefined;
  }
  skyCrackers.value = [];
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

  // Blast sparkles right after open / refresh
  void nextTick(() => {
    window.requestAnimationFrame(() => {
      welcomeSprinkleBlast();
      window.setTimeout(welcomeSprinkleBlast, 600);
    });
  });

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
  stopFinaleCelebration();
  stopCurrentMusic();
  partyCannon = null;
  document.getElementById('hbd-sparkle-canvas')?.remove();
});
</script>

<template>
  <div
    class="app-shell"
    :class="shellThemeClass"
    @click="spawnTapBuddy"
  >
    <vue-particles
      v-show="screen !== 'cake' && screen !== 'finale'"
      id="birthday-particles"
      class="particles-layer"
      :options="particleOptions"
    />
    <div class="blush blush-a" aria-hidden="true"></div>
    <div class="blush blush-b" aria-hidden="true"></div>
    <div class="soft-grid" aria-hidden="true"></div>

    <div class="tap-buddies" aria-hidden="true">
      <div
        v-for="buddy in tapBuddies"
        :key="buddy.id"
        class="tap-buddy"
        :class="`tap-buddy--${buddy.kind}`"
        :style="{
          left: `${buddy.x}px`,
          top: `${buddy.y}px`,
          '--spin': `${buddy.rotate}deg`,
        }"
      >
        <span class="tap-buddy-bubble">
          <!-- Soft cartoon teddy -->
          <svg v-if="buddy.kind === 'teddy'" class="tap-buddy-face" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="12" fill="#e8b892" />
            <circle cx="62" cy="18" r="12" fill="#e8b892" />
            <circle cx="18" cy="18" r="7" fill="#f6d4b8" />
            <circle cx="62" cy="18" r="7" fill="#f6d4b8" />
            <circle cx="40" cy="44" r="28" fill="#f0c4a0" />
            <ellipse cx="40" cy="52" rx="14" ry="11" fill="#f7d9c2" />
            <circle cx="30" cy="40" r="4.2" fill="#5a3d2b" />
            <circle cx="50" cy="40" r="4.2" fill="#5a3d2b" />
            <circle cx="31.4" cy="38.6" r="1.4" fill="#fff" />
            <circle cx="51.4" cy="38.6" r="1.4" fill="#fff" />
            <ellipse cx="40" cy="49" rx="4.5" ry="3.2" fill="#c47a5a" />
            <path d="M34 56 Q40 61 46 56" fill="none" stroke="#c47a5a" stroke-width="2" stroke-linecap="round" />
            <circle cx="22" cy="48" r="5" fill="#ffb6c8" opacity="0.7" />
            <circle cx="58" cy="48" r="5" fill="#ffb6c8" opacity="0.7" />
            <path d="M36 28 Q40 24 44 28" fill="none" stroke="#e8a878" stroke-width="2" stroke-linecap="round" />
          </svg>
          <!-- Soft cartoon panda -->
          <svg v-else class="tap-buddy-face" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="18" r="13" fill="#2f2f2f" />
            <circle cx="64" cy="18" r="13" fill="#2f2f2f" />
            <circle cx="40" cy="44" r="28" fill="#ffffff" />
            <ellipse cx="28" cy="40" rx="9" ry="11" fill="#2f2f2f" />
            <ellipse cx="52" cy="40" rx="9" ry="11" fill="#2f2f2f" />
            <circle cx="29" cy="40" r="3.6" fill="#ffffff" />
            <circle cx="53" cy="40" r="3.6" fill="#ffffff" />
            <circle cx="30" cy="39" r="1.5" fill="#2f2f2f" />
            <circle cx="54" cy="39" r="1.5" fill="#2f2f2f" />
            <ellipse cx="40" cy="50" rx="5" ry="3.5" fill="#2f2f2f" />
            <path d="M34 57 Q40 62 46 57" fill="none" stroke="#2f2f2f" stroke-width="2" stroke-linecap="round" />
            <circle cx="22" cy="52" r="5.5" fill="#ffb6c8" opacity="0.75" />
            <circle cx="58" cy="52" r="5.5" fill="#ffb6c8" opacity="0.75" />
          </svg>
          <span class="tap-buddy-heart">♡</span>
        </span>
        <span class="tap-buddy-hbd">HBD {{ RECIPIENT_NAME }}</span>
      </div>
    </div>

    <div class="theme-dock">
      <button
        class="theme-toggle"
        type="button"
        :aria-pressed="!themesHidden"
        :aria-label="themesHidden ? 'Show color themes' : 'Hide color themes'"
        :title="themesHidden ? 'Show colors' : 'Hide colors'"
        @click="toggleThemesHidden"
      >
        <svg v-if="themesHidden" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8" />
          <path d="M4 4l16 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="8" cy="10" r="3.2" fill="currentColor" opacity="0.9" />
          <circle cx="15" cy="9" r="2.8" fill="currentColor" opacity="0.75" />
          <circle cx="13" cy="15" r="3" fill="currentColor" opacity="0.85" />
        </svg>
      </button>

      <div
        v-show="!themesHidden"
        class="theme-balls"
        role="group"
        aria-label="Theme colors"
      >
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
      :aria-label="isMuted ? 'Unmute music' : 'Mute music'"
      :title="isMuted ? 'Unmute' : 'Mute'"
      @click="toggleMusic"
    >
      <!-- Speaker / mute icons -->
      <svg v-if="!isMuted" class="music-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M4 9v6h3.2L12 19.5V4.5L7.2 9H4zm11.5 3a3.5 3.5 0 0 0-1.7-3v6a3.5 3.5 0 0 0 1.7-3zm-1.7-6.9v1.6a5.5 5.5 0 0 1 0 10.6v1.6a7.1 7.1 0 0 0 0-13.8z"
        />
      </svg>
      <svg v-else class="music-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M4 9v6h3.2L12 19.5V4.5L7.2 9H4zm11.04-.96 1.27 1.27A3.45 3.45 0 0 1 17 12a3.5 3.5 0 0 1-.9 2.34l1.3 1.3A5.45 5.45 0 0 0 18.7 12a5.5 5.5 0 0 0-2.66-4.7zM12 4.5v1.7l6.9 6.9.9-.9L12 3.6zm7.8 13.1-1.4 1.4L4.2 4.8l1.4-1.4z"
        />
      </svg>
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
            <span class="letter-note">
              A birthday isn't just about growing older… It's a day to remember how many people you've made happy, and how beautifully your presence has changed their lives.
            </span>
            <span class="letter-note soft">
              Always keep smiling, because the people around you will also smile if you smile.
            </span>
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
    <section v-else-if="screen === 'photos'" class="screen photos-screen">
      <header class="section-head">
        <p class="kicker">Photo reel · {{ activePhoto + 1 }}/{{ photoFrames.length }}</p>
        <h2>Frames that feel like home</h2>
        <p class="lede compact">Swipe or tap the arrows</p>
      </header>

      <div class="photo-reel-stage">
        <div class="memory-butterflies" aria-hidden="true">
          <span
            v-for="b in sceneButterflies"
            :key="`photo-bf-${b.id}`"
            class="butterfly"
            :style="{
              '--bx': `${b.x}%`,
              '--by': `${b.y}%`,
              '--bsize': String(b.size),
              '--bdur': `${b.duration}s`,
              '--bdelay': `${b.delay}s`,
              '--bdrift': `${b.drift}px`,
            }"
          >
            <img class="butterfly-img" :src="b.src" alt="" draggable="false" />
          </span>
        </div>

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
    <section v-else-if="screen === 'memories'" class="screen memories-screen">
      <header class="section-head">
        <p class="kicker">Soft pages · {{ memoryIndex + 1 }}/{{ writtenMemories.length }}</p>
        <h2>Memories I keep from our time</h2>
      </header>

      <div class="memory-stage">
        <div class="memory-butterflies" aria-hidden="true">
          <span
            v-for="b in sceneButterflies"
            :key="`memory-bf-${b.id}`"
            class="butterfly"
            :style="{
              '--bx': `${b.x}%`,
              '--by': `${b.y}%`,
              '--bsize': String(b.size),
              '--bdur': `${b.duration}s`,
              '--bdelay': `${b.delay}s`,
              '--bdrift': `${b.drift}px`,
            }"
          >
            <img class="butterfly-img" :src="b.src" alt="" draggable="false" />
          </span>
        </div>

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
      <div class="finale-sky" aria-hidden="true">
        <div class="finale-stars"></div>
        <span class="finale-glow finale-glow-a"></span>
        <span class="finale-glow finale-glow-b"></span>
        <span class="finale-glow finale-glow-c"></span>

        <div
          v-for="cracker in skyCrackers"
          :key="cracker.id"
          class="sky-cracker"
          :class="`sky-cracker--${cracker.tone}`"
          :style="{
            left: `${cracker.x}%`,
            top: `${cracker.y}%`,
            '--fw-size': String(cracker.size),
          }"
        >
          <span class="sky-cracker-core"></span>
          <span
            v-for="ray in 28"
            :key="ray"
            class="sky-cracker-ray"
            :style="{ '--a': `${(360 / 28) * ray}deg` }"
          ></span>
          <span class="sky-cracker-trail"></span>
        </div>
      </div>

      <h2 class="finale-glow-title">Happy Birthday, {{ RECIPIENT_NAME }}</h2>

      <div class="finale-panel glass">
        <p class="lede">
          Happy Birthday, {{ RECIPIENT_NAME }}! 🎉

I don't think you realize how rare a person you are. In a world where people often judge, misunderstand, or pretend to be someone they're not, you choose to be genuine. You're kind, caring, honest, and you always try to see the good in people. That's something I truly admire about you.

I'm really glad our paths crossed. Every conversation with you has been comfortable, and your positive nature has made a difference in ways you probably don't even know. You have a way of making people feel heard and valued, and that's a beautiful quality to have.

On your special day, I just want to say thank you for being exactly who you are. Never lose your kindness or your beautiful heart. I hope this year brings you good health, endless happiness, success in everything you work for, and people who appreciate you as much as you deserve.

Keep smiling, keep being the amazing person you are, and may all your dreams come true.

Happy Birthday once again, {{ RECIPIENT_NAME }} Have the most wonderful year ahead. 🤍         </p>
        <p class="stamp finale-stamp">Celebrate you ♡</p>
        <div class="emoji-row" aria-hidden="true">
          <span>🎀</span><span>🌸</span><span>✨</span><span>🤍</span><span>💌</span>
        </div>
      </div>
    </section>
  </div>
</template>
