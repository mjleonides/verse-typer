import { ref, computed, watch } from "vue"
import { defineStore } from "pinia"
import type { TyperDataItem, ScriptureData } from "@/types"
import useHelloAo from "@/composables/useHelloAo"

const { getScripture } = useHelloAo()

export const useTyperStore = defineStore("typer", () => {
  /**
   *
   */
  const challengeActive = ref(false)

  /**
   *
   */
  const startChallenge = () => {
    challengeActive.value = true

    setChallengeData()
  }

  /**
   * Will contain scripture data returned from useHelloAo composable
   */
  const scripture = ref<ScriptureData | undefined>()

  /**
   * Typing challenge string
   * @type {string}
   */
  const challengeString = computed(() => (scripture.value ? scripture.value.content : ""))

  /**
   * Formatted object array for keeping track of challenge data (letter success/fail, etc.)
   */
  const challengeData = ref<TyperDataItem[]>([])

  /**
   * Current typerString char being evaluated
   */
  const currentItem = computed(() => challengeData.value.find((item) => item.isCurrent))

  /**
   * Index of typerString char being evaluated
   * @type {number}
   */
  const currentItemIndex = computed(() => challengeData.value.findIndex((item) => item.isCurrent))

  /**
   * Whether or not challenge is complete
   * @type {boolean}
   */
  const challengeComplete = computed(
    () => challengeData.value.length > 0 && currentItem.value === undefined,
  )

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
   * Catches challenge end time once completed
   */
  watch(
    () => challengeComplete.value,
    (value) => {
      if (value) {
        endTime.value = Date.now()
      }
    },
  )

  /**
   * Time of completed challenge in seconds
   * @type {number}
   */
  const challengeTime = computed(() => (endTime.value - startTime.value) / 1000)

  /**
   * Calculated words per minute typed (uses char count of typer string divided by 5 for avg len of word)
   */
  const wpmAverage = computed(() =>
    Math.floor(challengeData.value.length / 5 / (challengeTime.value / 60)),
  )

  /**
   * Initiates challenge by fetching scripture and setting data
   */
  const setChallengeData = async () => {
    scripture.value = await getScripture()

    challengeData.value = challengeString.value
      .split("")
      .map((char, idx) => ({ char, isCurrent: idx === 0, isSuccess: undefined }))

    //   typerInputValue.value = ""
  }

  /**
   * Handle keypresses during challenge
   *
   * @param {KeyboardEvent} event
   */
  const handleKeypress = (event: KeyboardEvent) => {
    const currentItem = challengeData.value.find((item) => item.isCurrent)
    const nextItem = challengeData.value[currentItemIndex.value + 1]

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

  return {
    scripture,
    challengeData,
    challengeComplete,
    challengeTime,
    challengeActive,
    currentItem,
    wpmAverage,
    startChallenge,
    handleKeypress,
    setChallengeData,
  }
})
