<script setup lang="ts">
import { bouquetImage } from '../content';
</script>

<template>
  <div class="real-bouquet">
    <div class="bouquet-glow" aria-hidden="true"></div>
    <div class="photo-frame">
      <img
        class="bouquet-photo"
        :src="bouquetImage"
        alt="Bouquet of 2 sunflowers and 6 red roses in yellow wrap"
      />
    </div>
    <span class="sparkle s1" aria-hidden="true"></span>
    <span class="sparkle s2" aria-hidden="true"></span>
    <span class="sparkle s3" aria-hidden="true"></span>
  </div>
</template>

<style scoped>
.real-bouquet {
  position: relative;
  width: min(100%, 20rem);
  margin: 0.35rem auto 0.5rem;
}

.bouquet-glow {
  position: absolute;
  inset: 8% 4% 4%;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 30%, rgba(255, 204, 0, 0.28), transparent 50%),
    radial-gradient(circle at 50% 60%, rgba(220, 20, 60, 0.18), transparent 55%);
  filter: blur(24px);
  animation: glow 4s ease-in-out infinite;
  pointer-events: none;
}

.photo-frame {
  position: relative;
  z-index: 1;
  overflow: hidden;
  border-radius: 1.35rem;
  border: 1px solid var(--stroke);
  box-shadow:
    0 24px 50px rgba(0, 0, 0, 0.35),
    0 0 40px var(--glow);
  animation: float 5s ease-in-out infinite;
  transform-origin: center bottom;
}

.bouquet-photo {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  object-position: center;
}

.sparkle {
  position: absolute;
  z-index: 2;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: #ffe566;
  box-shadow: 0 0 12px #ffcc00;
  pointer-events: none;
  animation: twinkle 2.6s ease-in-out infinite;
}

.s1 {
  top: 12%;
  left: 10%;
}
.s2 {
  top: 18%;
  right: 12%;
  animation-delay: 0.9s;
}
.s3 {
  top: 40%;
  right: 6%;
  animation-delay: 1.7s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(-0.6deg);
  }
  50% {
    transform: translateY(-8px) rotate(0.6deg);
  }
}

@keyframes glow {
  0%,
  100% {
    opacity: 0.65;
  }
  50% {
    opacity: 1;
  }
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(0.7);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}
</style>
