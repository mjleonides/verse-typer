<template>
  <header>
    <h1>Daily Typer</h1>
  </header>

  <main>

    <p>
      <span v-for="(item, idx) in typerData" :key="`${idx} - ${item.char}`" :class="{ 'is-success': item.isSuccess, 'is-failed': item.isSuccess === false, 'is-current': item.isCurrent }" >{{ item.char }}</span>
    </p>

    <p v-if="typerComplete">Done! {{ typedTime }} seconds</p>
    <p v-else>Current Key: {{ currentItem?.char }}</p>

    <input ref="typerInput" id="typer-input" name="typer-input" autofocus type="text" :class="{ 'typer-input--hidden': !debug }" v-model="typerInputValue"  @keyup="(event) => handleKeydown(event)"/>

  </main>

  <footer>
    <button @click="setData">Reset</button>
    <div>
      <input id="debug" type="checkbox" name="debug"  v-model="debug">
      <label for="debug">Debug</label>
    </div>

  </footer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"

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
 * Typing challenge string
 * @type {string}
 */
const typerString = ref("Test longer sentence.")
/**
 * Ref for keeping track of challenge data (letter success/fail, etc.)
 */
const typerData = ref<TyperDataItem[]>([])
/**
 * Current typerString char being evaluated
 */
const currentItem = computed(() => typerData.value.find((item) => item.isCurrent))
/**
 * Index of typerString char being evaluated
 * @type {number}
 */
const currentItemIndex = computed(() => typerData.value.findIndex((item) => item.isCurrent))
/**
 * Whether or not challenge is complete
 * @type {boolean}
 */
const typerComplete = computed(() => currentItem.value === undefined)
/**
 * Timestamp of first correct keystroke
 * @type {date}
 */
const startTime = ref()
/**
 * Timestamp of the success of the last char in typerString
 * @type {date}
 */
const endTime = ref()
/**
 * Time of completed challenge in seconds
 * @type {number}
 */
const typedTime = computed(() => (endTime.value - startTime.value) / 1000)
/**
 * Debug features toggle
 * @type {boolean}
 */
const debug = ref(false);

interface TyperDataItem {
  char: string;
  isCurrent: boolean;
  isSuccess: boolean | undefined;
}

/**
 * Sets ref for keeping track of challenge data (letter success/fail, etc.)
 */
const setData = () => {
  typerData.value = typerString.value.split("").map((char, idx) => ({ char, isCurrent: idx === 0, isSuccess: undefined }))

  typerInputValue.value = ""
}

/**
 * Will create data object once typerString is set (will be most useful once typerString is dynamic)
 */
watch(() => typerString.value, (value) => {
  if (value) {
    setData()
  }
}, { immediate: true })

/**
 * Catches challenge end time once completed
 */
watch(() => typerComplete.value, (value) => {
  if (value) {
    endTime.value = Date.now()
  }
})

/**
 * Handle keypresses during challenge
 *
 * @param {KeyboardEvent} event
 */
const handleKeydown = (event: KeyboardEvent) => {
  const currentItem = typerData.value.find((item) => item.isCurrent)
  const nextItem = typerData.value[currentItemIndex.value + 1]

  if (event.key !== "Shift" && currentItem) {

    // Start timer on first keypress
    if (currentItemIndex.value === 0 && currentItem.isSuccess === undefined) {
      startTime.value = Date.now()
    }

    if (event.key === currentItem.char) {

      currentItem.isSuccess = true
      currentItem.isCurrent = false

      if (nextItem) {
        nextItem.isCurrent = true
      }

    } else {
      currentItem.isSuccess = false
    }
  }
}

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
</style>
