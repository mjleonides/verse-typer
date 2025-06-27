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

document.addEventListener("click", () => {
  typerInput.value.focus()
})

const typerInput = ref()
const typerInputValue = defineModel()
const typerString = ref("Test longer sentence.")
const typerData = ref<TyperDataItem[]>([])
const currentItem = computed(() => typerData.value.find((item) => item.isCurrent))
const currentItemIndex = computed(() => typerData.value.findIndex((item) => item.isCurrent))
const typerComplete = computed(() => currentItem.value === undefined)
const startTime = ref()
const endTime = ref()
const typedTime = computed(() => (endTime.value - startTime.value) / 1000)
const debug = ref(false);

interface TyperDataItem {
  char: string;
  isCurrent: boolean;
  isSuccess: boolean | undefined;
}

const setData = () => {
  typerData.value = typerString.value.split("").map((char, idx) => ({ char, isCurrent: idx === 0, isSuccess: undefined }))

  typerInputValue.value = ""
}

watch(() => typerString.value, (value) => {
  if (value) {
    setData()
  }
}, { immediate: true })

watch(() => typerComplete.value, (value) => {
  if (value) {
    endTime.value = Date.now()
  }
})


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
