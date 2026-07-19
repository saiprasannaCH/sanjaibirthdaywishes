<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { gsap } from 'gsap';

const props = defineProps<{
  candlesLit: boolean;
}>();

const emit = defineEmits<{
  blow: [];
}>();

const cakeRef = ref<HTMLElement | null>(null);

onMounted(() => {
  gsap.fromTo(
    cakeRef.value,
    { y: 36, opacity: 0, scale: 0.92 },
    { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.4)' },
  );
});

function requestBlow() {
  if (!props.candlesLit) return;
  emit('blow');
}
</script>

<template>
  <div ref="cakeRef" class="birthday-cake" :class="{ blown: !candlesLit }">
    <div class="cake-aura" aria-hidden="true"></div>

    <div class="candles" aria-hidden="true">
      <span v-for="n in 5" :key="n" class="candle" :style="{ '--i': n }">
        <i v-if="candlesLit" class="flame">
          <i class="flame-core"></i>
        </i>
        <i class="wick"></i>
      </span>
    </div>

    <div class="tier tier-top">
      <div class="frosting-drip"></div>
      <p class="cake-wish">sweet dreams &amp; soft days</p>
      <p class="cake-name">sleepy guy</p>
    </div>

    <div class="tier tier-mid">
      <div class="frosting-drip drip-alt"></div>
      <div class="pearl-row" aria-hidden="true">
        <span v-for="p in 11" :key="p"></span>
      </div>
      <p class="cake-line">Happy Birthday</p>
    </div>

    <div class="tier tier-base">
      <div class="frosting-drip"></div>
      <p class="cake-line soft-wish">may your year feel gentle</p>
    </div>

    <div class="cake-plate" aria-hidden="true"></div>

    <button
      v-if="candlesLit"
      class="blow-btn"
      type="button"
      @click="requestBlow"
    >
      Blow the candles ♡
    </button>
    <p v-else class="wish-locked">Wish locked in for sleepy guy ✦</p>
  </div>
</template>

<style scoped>
.birthday-cake {
  position: relative;
  display: grid;
  justify-items: center;
  width: min(100%, 22rem);
  margin: 0.5rem auto;
  filter: drop-shadow(0 28px 50px rgba(155, 123, 184, 0.28));
}

.cake-aura {
  position: absolute;
  inset: -10% -20% 10%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 184, 232, 0.35), transparent 68%);
  filter: blur(18px);
  animation: aura 3.5s ease-in-out infinite;
  pointer-events: none;
}

.candles {
  position: relative;
  z-index: 5;
  display: flex;
  gap: 1.05rem;
  margin-bottom: -0.35rem;
}

.candle {
  position: relative;
  width: 0.62rem;
  height: 2.65rem;
  border-radius: 999px;
  background: repeating-linear-gradient(
    45deg,
    #e8dff5,
    #e8dff5 0.28rem,
    #b8e6c8 0.28rem,
    #b8e6c8 0.56rem
  );
  box-shadow: inset -2px 0 0 rgba(0, 0, 0, 0.08);
}

.wick {
  position: absolute;
  left: 50%;
  top: -0.28rem;
  width: 0.12rem;
  height: 0.32rem;
  background: #3f2a20;
  transform: translateX(-50%);
}

.flame {
  position: absolute;
  left: 50%;
  top: -1.15rem;
  width: 0.85rem;
  height: 1.2rem;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  background: radial-gradient(circle at 50% 70%, #fff7ad 0 22%, #ffb021 48%, #ff5e57 88%);
  box-shadow:
    0 0 14px #ffd166,
    0 0 28px rgba(201, 184, 232, 0.4);
  transform: translateX(-50%);
  animation: flicker 0.45s ease-in-out infinite alternate;
}

.flame-core {
  position: absolute;
  left: 50%;
  bottom: 18%;
  width: 0.28rem;
  height: 0.45rem;
  border-radius: inherit;
  background: #fffceb;
  transform: translateX(-50%);
  opacity: 0.9;
}

.tier {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  gap: 0.15rem;
  color: #5a4f70;
  text-align: center;
}

.tier-top {
  width: 72%;
  min-height: 4.4rem;
  padding: 0.85rem 0.75rem 0.7rem;
  border-radius: 1.35rem 1.35rem 0.9rem 0.9rem;
  background:
    linear-gradient(180deg, #fafcfb 0%, #e8dff5 55%, #d4c4f0 100%);
  box-shadow:
    inset 0 -10px 0 rgba(255, 255, 255, 0.25),
    0 8px 0 rgba(155, 123, 184, 0.2);
}

.tier-mid {
  width: 88%;
  min-height: 5.2rem;
  margin-top: -0.15rem;
  padding: 1rem 0.8rem 0.8rem;
  border-radius: 1.2rem;
  background:
    linear-gradient(180deg, #e8f6ee 0%, #c9eed8 48%, #b8e6c8 100%);
  box-shadow:
    inset 0 -12px 0 rgba(255, 255, 255, 0.18),
    0 10px 0 rgba(126, 184, 154, 0.25);
}

.tier-base {
  width: 100%;
  min-height: 4.6rem;
  margin-top: -0.15rem;
  padding: 0.95rem 0.9rem 0.85rem;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, #9b7bb8 0%, #8a6aa8 55%, #7eb89a 100%);
  color: #f5f0fb;
  box-shadow:
    inset 0 -12px 0 rgba(255, 255, 255, 0.15),
    0 14px 0 rgba(61, 69, 88, 0.15);
}

.frosting-drip {
  position: absolute;
  top: -0.35rem;
  left: 6%;
  right: 6%;
  height: 0.9rem;
  border-radius: 999px;
  background: radial-gradient(circle at 12% 50%, #fff 0 18%, transparent 19%),
    radial-gradient(circle at 28% 50%, #fff 0 16%, transparent 17%),
    radial-gradient(circle at 46% 50%, #fff 0 18%, transparent 19%),
    radial-gradient(circle at 64% 50%, #fff 0 15%, transparent 16%),
    radial-gradient(circle at 82% 50%, #fff 0 17%, transparent 18%),
    linear-gradient(180deg, #fafcfb, #d4c4f0);
  opacity: 0.95;
  pointer-events: none;
}

.tier-mid .frosting-drip,
.drip-alt {
  background: radial-gradient(circle at 14% 50%, #e8f6ee 0 18%, transparent 19%),
    radial-gradient(circle at 32% 50%, #e8f6ee 0 16%, transparent 17%),
    radial-gradient(circle at 50% 50%, #e8f6ee 0 18%, transparent 19%),
    radial-gradient(circle at 68% 50%, #e8f6ee 0 15%, transparent 16%),
    radial-gradient(circle at 86% 50%, #e8f6ee 0 17%, transparent 18%),
    linear-gradient(180deg, #e8f6ee, #b8e6c8);
}

.tier-base .frosting-drip {
  background: radial-gradient(circle at 14% 50%, #c9b8e8 0 18%, transparent 19%),
    radial-gradient(circle at 34% 50%, #c9b8e8 0 15%, transparent 16%),
    radial-gradient(circle at 54% 50%, #c9b8e8 0 17%, transparent 18%),
    radial-gradient(circle at 74% 50%, #c9b8e8 0 16%, transparent 17%),
    radial-gradient(circle at 90% 50%, #c9b8e8 0 14%, transparent 15%),
    linear-gradient(180deg, #c9b8e8, #9b7bb8);
  opacity: 0.85;
}

.cake-name {
  margin: 0;
  font-family: "Bricolage Grotesque", Georgia, serif;
  font-size: clamp(1.45rem, 5vw, 1.9rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
  color: #7a5f9a;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.45);
}

.cake-wish,
.cake-line {
  margin: 0;
  font-family: "Outfit", system-ui, sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.cake-wish {
  color: #8a7aa0;
}

.tier-mid .cake-line {
  font-family: "Bricolage Grotesque", Georgia, serif;
  font-size: clamp(1.15rem, 4vw, 1.45rem);
  letter-spacing: 0.04em;
  text-transform: none;
  color: #4f7a62;
}

.soft-wish {
  letter-spacing: 0.12em;
  color: #f5f0fb;
}

.pearl-row {
  display: flex;
  gap: 0.35rem;
  margin-bottom: 0.25rem;
}

.pearl-row span {
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #fff, #e8dff5 60%, #a8d9b8);
  box-shadow: 0 1px 2px rgba(155, 123, 184, 0.2);
}

.cake-plate {
  width: 112%;
  height: 0.85rem;
  margin-top: 0.35rem;
  border-radius: 999px;
  background: linear-gradient(180deg, #c9b8e8, #7eb89a);
  box-shadow: 0 10px 24px rgba(155, 123, 184, 0.3);
}

.blow-btn {
  margin-top: 1.15rem;
  padding: 0.9rem 1.4rem;
  border: 0;
  border-radius: 999px;
  color: #ffffff;
  background: linear-gradient(135deg, #a8d9b8, #9b7bb8);
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 14px 34px rgba(155, 123, 184, 0.3);
  animation: pulse-cta 1.8s ease-in-out infinite;
}

.wish-locked {
  margin: 1.1rem 0 0;
  color: #7a5f9a;
  font-family: "Bricolage Grotesque", Georgia, serif;
  font-size: 1.05rem;
  font-weight: 700;
}

.blown .tier-top {
  box-shadow:
    inset 0 -10px 0 rgba(255, 255, 255, 0.25),
    0 -18px 40px rgba(255, 255, 255, 0.12),
    0 8px 0 rgba(155, 123, 184, 0.2);
}

@keyframes flicker {
  from {
    transform: translateX(-50%) scale(0.92) rotate(-4deg);
  }
  to {
    transform: translateX(-50%) scale(1.08) rotate(4deg);
  }
}

@keyframes aura {
  0%,
  100% {
    opacity: 0.65;
  }
  50% {
    opacity: 1;
  }
}

@keyframes pulse-cta {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}
</style>
