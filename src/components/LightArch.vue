<script setup lang="ts">
/** Fairy-light arch: left column, top curve, right column */
const leftBulbs = 9;
const rightBulbs = 9;
const topBulbs = 15;

const topPositions = Array.from({ length: topBulbs }, (_, i) => {
  const t = i / (topBulbs - 1);
  const x = 6 + t * 88;
  const y = 8 + Math.sin(Math.PI * t) * 18;
  return { x, y, delay: `${i * 0.12}s` };
});
</script>

<template>
  <div class="light-arch" aria-hidden="true">
    <svg class="arch-wire" viewBox="0 0 100 40" preserveAspectRatio="none">
      <path
        d="M6 28 Q50 2 94 28"
        fill="none"
        stroke="currentColor"
        stroke-width="0.35"
      />
    </svg>

    <div class="strand strand-left">
      <span
        v-for="n in leftBulbs"
        :key="'L' + n"
        class="bulb"
        :style="{ '--delay': `${n * 0.15}s`, top: `${8 + n * 9}%` }"
      ></span>
      <div class="strand-line"></div>
    </div>

    <div class="strand strand-top">
      <span
        v-for="(pos, i) in topPositions"
        :key="'T' + i"
        class="bulb"
        :style="{ left: `${pos.x}%`, top: `${pos.y}%`, '--delay': pos.delay }"
      ></span>
    </div>

    <div class="strand strand-right">
      <span
        v-for="n in rightBulbs"
        :key="'R' + n"
        class="bulb"
        :style="{ '--delay': `${n * 0.15 + 0.2}s`, top: `${8 + n * 9}%` }"
      ></span>
      <div class="strand-line"></div>
    </div>
  </div>
</template>

<style scoped>
.light-arch {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
  color: color-mix(in srgb, var(--accent) 45%, transparent);
}

.arch-wire {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 42%;
}

.strand-left,
.strand-right {
  position: absolute;
  top: 0;
  width: 2.2rem;
  height: 78%;
}

.strand-left {
  left: 0.35rem;
}

.strand-right {
  right: 0.35rem;
}

.strand-line {
  position: absolute;
  top: 6%;
  left: 50%;
  width: 2px;
  height: 88%;
  margin-left: -1px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--accent) 55%, transparent),
    color-mix(in srgb, var(--accent) 6%, transparent)
  );
  border-radius: 999px;
}

.strand-top {
  position: absolute;
  inset: 0 0 auto;
  height: 42%;
}

.bulb {
  position: absolute;
  left: 50%;
  width: 0.72rem;
  height: 0.9rem;
  margin-left: -0.36rem;
  border-radius: 50% 50% 45% 45%;
  background: radial-gradient(circle at 35% 30%, #fff8f0, var(--accent) 45%, var(--accent-deep) 100%);
  box-shadow:
    0 0 8px color-mix(in srgb, var(--accent-soft) 95%, transparent),
    0 0 18px color-mix(in srgb, var(--accent) 65%, transparent),
    0 0 32px var(--glow);
  animation: twinkle 2.4s ease-in-out var(--delay) infinite;
}

.bulb::before {
  content: "";
  position: absolute;
  top: -0.22rem;
  left: 50%;
  width: 0.22rem;
  height: 0.28rem;
  background: #8a5a30;
  border-radius: 1px;
  transform: translateX(-50%);
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.55;
    transform: scale(0.92);
  }
  50% {
    opacity: 1;
    transform: scale(1.08);
  }
}
</style>
