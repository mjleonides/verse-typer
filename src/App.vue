<template>
  <header class="header">
    <h1 class="heading">Verse Typer</h1>
    <Transition name="info">
      <p v-if="infoMessage" class="info">
        <span v-html="infoMessage"></span>
        <i :class="infoIcon"></i>
      </p>
    </Transition>
  </header>

  <main class="main-container">
    <div class="content-container">
      <div class="content-header">
        <h2 class="content-heading" v-if="store.scripture">
          {{ store.scripture?.book }} {{ store.scripture?.chapter }}:
          {{ store.scripture?.verseStart }} - {{ store.scripture?.verseEnd }} ({{
            store.scripture?.translation
          }})
        </h2>
        <SkeletonComponent v-else width="30rem" height="2rem" />
      </div>

      <div class="typer-text-container">
        <p class="typer-text" v-if="store.scripture">
          <span
            v-for="(item, idx) in store.challengeData"
            :key="`${idx} - ${item.char}`"
            :class="{
              'is-success': item.isSuccess,
              'is-failed': item.isSuccess === false,
              'is-current': item.isCurrent,
            }"
            >{{ item.char }}</span
          >
        </p>
        <SkeletonComponent v-else paragraph />
      </div>
    </div>

    <div class="stats-container" :class="{ 'stats--complete': store.challengeComplete }">
      <figure class="stat stat_char-count">
        <figcaption>Chars:</figcaption>
        <span>{{ currentCharNo }} / {{ store.challengeData.length }}</span>
      </figure>
      <figure class="stat stat__time">
        <figcaption>Time:</figcaption>
        <span>{{ store.startTime ? `${displayTime} s` : `--` }}</span>
      </figure>
      <figure class="stat stat__wpm">
        WPM: <span>{{ store.wpmAverage ?? `--` }}</span>
      </figure>
      <figure class="stat stat__accuracy">
        <figcaption>Accuracy:</figcaption>
        <span :class="`stat__accuracy--${getAccuracyClass(store.challengeAccuracy)}`">{{
          store.challengeAccuracy ? `${store.challengeAccuracy * 100}%` : `--`
        }}</span>
      </figure>
    </div>
  </main>
  <div class="actions-container">
    <div class="buttons">
      <!-- Start/New should fetch new scripture -->
      <div class="button-container">
        <button class="button" @click="store.fetchChallenge" title="New passage">
          <i class="fa-solid fa-plus fa-xl"></i><span>New</span>
        </button>
        <div class="shortcut"><kbd>ctrl + n</kbd></div>
      </div>

      <!-- Reset should restart time with same scripture-->
      <div class="button-container">
        <button class="button" @click="onReset" title="Reset challenge">
          <i class="fa-solid fa-arrow-rotate-right fa-xl"></i><span>Reset</span>
        </button>
        <div class="shortcut"><kbd>ctrl + r</kbd></div>
      </div>

      <!-- About -->
      <a class="link" href="https://github.com/mjleonides/verse-typer" target="_blank">
        <button class="button" title="About this project">
          <i class="fa-brands fa-github fa-xl"></i><span>About</span>
        </button>
      </a>

      <!-- Debug -->
      <div class="button-container" v-if="env === 'dev'">
        <button class="button" :class="{ 'button--checked': debug }" @click="debug = !debug">
          <i class="fa-solid fa-bug fa-xl"></i><span>Debug</span>
        </button>
        <div class="shortcut"><kbd>ctrl + d</kbd></div>
      </div>
    </div>

    <div class="debug-container">
      <p v-if="debug">Current Key: {{ store.currentItem?.char }}</p>
      <input
        ref="typerInput"
        id="typer-input"
        name="typer-input"
        autofocus
        type="text"
        :class="{ 'typer-input--hidden': !debug }"
        v-model="typerInputValue"
        @input="(event) => store.handleInput(event)"
      />
      <button v-if="debug" class="button" @click="store.clearStorage">
        <i class="fa-solid fa-trash fa-xl"></i><span>Clear Storage</span>
      </button>
    </div>
  </div>

  <footer class="footer">
    Crafted by <a class="link" target="_blank" href="https://leonides.dev">leonides.dev</a>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useTyperStore } from "@/stores/typer"
import SkeletonComponent from "./components/SkeletonComponent.vue"

const store = useTyperStore()

const env = import.meta.env.VITE_ENV

/**
 * If new user or no scripture in store, or if it's a new day since last fetch,
 * fetch a new challenge to populate scripture
 */
if (!store.scripture || store.challengeDate !== new Date().toLocaleDateString()) {
  store.fetchChallenge()
}
/**
 * Keeps DOM focus on typerInput
 */
document.addEventListener("click", () => {
  typerInput.value.focus()
})
document.addEventListener("keyup", (event) => {
  const key = event.key

  if (event.ctrlKey) {
    if (key === "n") {
      store.fetchChallenge()
    } else if (key === "r") {
      onReset()
    } else if (env === "dev" && key === "d") {
      debug.value = !debug.value
    }
  }
  return
})
/**
 * Text input element template ref
 */
const typerInput = ref()
/**
 * Text input model value
 */
const typerInputValue = defineModel()
/**
 * Debug features toggle
 * @type {boolean}
 */
const debug = ref(false)
/**
 * Number of current character for display
 */
const currentCharNo = computed(() => {
  if (store.challengeComplete) return store.challengeData.length

  return store.currentItemIndex + 1
})
/**
 * Active stopwatch that shows time since startTime
 */
setInterval(() => {
  if (store.startTime) {
    refTime.value = Math.floor((Date.now() - store.startTime) / 1000)
  }
}, 1000)
const refTime = ref(0)
const displayTime = computed(() => {
  if (store.challengeComplete) return store.challengeTime

  return refTime.value
})
/**
 * For highlighting accuracy stat with color
 * @param accuracy
 */
const getAccuracyClass = (accuracy: number) => {
  if (!accuracy) return `default`

  switch (true) {
    case accuracy > 0.98:
      return `good`
    case accuracy > 0.9:
      return `ok`
    default:
      return `bad`
  }
}
/**
 * Dynamically update info message and icon based on challenge state
 */
const infoMessage = computed(() => {
  if (!store.challengeActive && !store.challengeComplete)
    return `Start typing to begin the challenge.`

  if (store.challengeComplete)
    return `Come back tomorrow, or click <strong>New</strong> to get a new passage.`

  return ``
})
const infoIcon = computed(() => {
  if (!store.challengeActive && !store.challengeComplete) return `fa-solid fa-circle-info fa-xl`

  if (store.challengeComplete) return `fa-solid fa-trophy fa-xl`

  return ``
})

const onReset = () => {
  refTime.value = 0
  store.resetChallenge()
}
</script>

<style lang="css">
:root {
  --bg: #0e0e0e;
  --card: #1a1a1a;
  --border: rgba(255, 255, 255, 0.08);
  --kbd-bg: rgba(255, 255, 255, 0.2);

  --red: #ff3f5c;
  --blue: #3b82f6;
  --green: #34d399;
  --amber: #fbbf24;

  --normal-text: rgba(255, 255, 255, 0.9);
  --vague-text: rgba(255, 255, 255, 0.75);
  --vivid-text: rgba(255, 255, 255);
}

body {
  background-color: var(--bg);
  color: var(--normal-text);
  font-family: sans-serif;
}

#app {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 98vh;
  width: 65%;
  margin: 0 auto;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 5rem;
}

.heading {
  min-width: max-content;
}

.info {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  color: var(--vague-text);
  text-align: end;
}

.info-enter-active,
.info-leave-active {
  transition: opacity 0.5s ease;
}

.info-enter-from,
.info-leave-to {
  opacity: 0;
}

.is-current {
  border-bottom: 2px solid var(--blue);
}

.is-success {
  color: var(--vivid-text);
}

.is-failed {
  color: var(--red);
  border-color: var(--red);
}

.typer-input--hidden {
  opacity: 0;
  height: 0;
  width: 0;
}

.typer-text-container {
  width: 95%;
  margin: 1rem auto;
}

.typer-text {
  font-size: 1.5rem;
  color: var(--vague-text);
  line-height: 3rem;
}

.main-container {
  background-color: var(--card);
  border-radius: 8px;
  margin: 7.5% auto 1rem;
  padding: 0.5rem 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55);
  width: 100%;
}

.content-header {
  display: flex;
  flex-direction: row;
  justify-content: center;
  border-bottom: 1px solid var(--border);
  padding: 1rem 0;
}

.content-heading {
  margin: 0;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--border);
  justify-content: center;
  font-size: 1.25rem;
  padding: 0 12%;
  color: var(--normal-text);
  opacity: 0.75;
}

.stats--complete {
  color: var(--normal-text);
  opacity: 1;
}

.stat {
  margin: 1rem 0;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem;
}

.stat__accuracy--good {
  color: var(--green);
}

.stat__accuracy--ok {
  color: var(--amber);
}

.stat__accuracy--bad {
  color: var(--red);
}

.actions-container {
  margin: 0 auto;
  max-width: max-content;
}

.buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  gap: 1rem;
}

.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.button {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  background-color: inherit;
  color: var(--normal-text);
  border-radius: 6px;
  border: none;
  font-size: 0.85rem;
}

.button:hover {
  color: var(--blue);
}

.button--checked {
  background-color: rgba(61, 61, 61, 0.671);
}

.button:has(> i) {
  padding: 1.25rem 1rem 0.75rem;
  gap: 1rem;
}

.shortcut {
  font-size: 0.75rem;
  color: var(--bg);
  background-color: var(--kbd-bg);
  padding: 0.15rem 0.25rem;
  border-radius: 4px;
}

.debug-container {
  grid-column: 1/4;
  display: flex;
  flex-direction: column;
  justify-items: center;
  gap: 1rem;
}

#typer-input {
  width: 100%;
  background-color: inherit;
  border-radius: 6px;
  border-style: solid;
  color: var(--normal-text);
  font-size: 1rem;
  padding: 0.5rem;
  border-color: var(--blue);
}

.footer {
  text-align: center;
  margin-top: auto;
  color: var(--vague-text);
  font-size: 0.75rem;
}

.link {
  color: var(--normal-text);
}

.link:has(> button) {
  text-decoration: none;
}

@media screen and (max-width: 1300px) {
  #app {
    width: 90%;
  }

  .main-container {
    margin-top: 5vw;
  }

  .stat {
    grid-template-columns: 1fr;
    justify-items: center;
  }
}
</style>
