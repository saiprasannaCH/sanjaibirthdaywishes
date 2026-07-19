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
        stroke="rgba(255,154,60,0.35)"
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
  left: clamp(0.4rem, 3vw, 1.6rem);
}

.strand-right {
  right: clamp(0.4rem, 3vw, 1.6rem);
}

.strand-line {
  position: absolute;
  left: 50%;
  top: 6%;
  bottom: 4%;
  width: 1px;
  background: linear-gradient(180deg, rgba(255, 154, 60, 0.55), rgba(255, 154, 60, 0.06));
  transform: translateX(-50%);
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
  background: radial-gradient(circle at 35% 30%, #fff4e0, #ff9a3c 45%, #e8721a 100%);
  box-shadow:
    0 0 8px rgba(255, 192, 120, 0.95),
    0 0 18px rgba(255, 154, 60, 0.65),
    0 0 32px rgba(232, 114, 26, 0.35);
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
