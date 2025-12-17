<template>
  <header>
    <h1>Daily Typer</h1>
  </header>

  <main>
    <h2 v-if="store.challengeActive">{{ store.scripture?.book }} {{ store.scripture?.chapter }}: {{ store.scripture?.verseStart }} - {{ store.scripture?.verseEnd }} ({{ store.scripture?.translation }})</h2>
    <Skeleton v-else width="30rem"/>

    <p v-if="store.challengeActive" class="typer-challenge-text">
      <span v-for="(item, idx) in store.challengeData" :key="`${idx} - ${item.char}`" :class="{ 'is-success': item.isSuccess, 'is-failed': item.isSuccess === false, 'is-current': item.isCurrent }" >{{ item.char }}</span>
    </p>
    <Skeleton v-else paragraph />


    <div v-if="store.challengeComplete">
      <p>
        Done!
      </p>
       <p>
          Total Time: {{ store.challengeTime }} seconds - {{ store.wpmAverage }} WPM
      </p>
    </div>

    <p v-if="debug">Current Key: {{ store.currentItem?.char }}</p>
    <input ref="typerInput" id="typer-input" name="typer-input" autofocus type="text" :class="{ 'typer-input--hidden': !debug }" v-model="typerInputValue"  @input="(event) => store.handleInput(event)"/>

    <div>
      <!-- Start/New should fetch new scripture -->
      <button @click="store.startChallenge">{{ store.challengeActive ? "New" : "Start" }} Challenge</button>
      <!-- Reset should restart time with same scripture-->
      <button @click="store.resetChallenge">Reset</button>
      <div>
        <input id="debug" type="checkbox" name="debug"  v-model="debug">
        <label for="debug">Debug</label>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue"
import Skeleton from "@/components/Skeleton.vue"
import { useTyperStore } from "@/stores/typer"

const store = useTyperStore()


/**
 * Keeps DOM focus on typerInput
 */
document.addEventListener("click", () => {
  typerInput.value.focus()
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
const debug = ref(false);

</script>

<style >
body {
  background-color: black;
  color: white;
}

.is-current {
  text-decoration: underline;
}

.is-success {
  color: rgb(3, 215, 3);
}

.is-failed {
  color: red;
}

.typer-input--hidden {
  opacity: 0;
  height: 0;
  width: 0;
}

.typer-challenge-text {
  font-size: 1.5rem;
}
</style>
