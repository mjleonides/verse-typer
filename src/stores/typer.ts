import { ref, computed, watch } from "vue"
import { defineStore } from "pinia"
import type { TyperDataItem, ScriptureData } from "@/types"
import useHelloAo from "@/composables/useHelloAo"

const { getScripture } = useHelloAo()

/**
 * Reusable function for getters to check the local storage for pre-existing values
 * @param property Name of getter
 * @param defaultValue What to use if local storage value does not pre-exist
 * @returns Value found in storage or default value
 */
const checkLocalStorage = (property: string, defaultValue: unknown) => {
  const storage = localStorage.getItem("typer")

  return storage ? JSON.parse(storage)[property] : defaultValue
}

export const useTyperStore = defineStore("typer", () => {
  /**
   * Whether or not the challenge has started aka the user has started typing
   */
  const challengeActive = ref(checkLocalStorage("challengeActive", false))

  /**
   * The day the challenge was last fetched, for daily challenge purposes (format: MM/DD/YYYY")
   */
  const challengeDate = ref(checkLocalStorage("challengeDate", undefined))

  /**
   * Formatted object array for keeping track of challenge data (letter success/fail, etc.)
   */
  const challengeData = ref<TyperDataItem[]>(checkLocalStorage("challengeData", []))

  /**
   * Will contain scripture data returned from useHelloAo composable
   */
  const scripture = ref<ScriptureData | undefined>(checkLocalStorage("scripture", undefined))

  /**
   * Timestamp of first correct keystroke
   * @type {date}
   */
  const startTime = ref(checkLocalStorage("startTime", undefined))

  /**
   * Timestamp of the success of the last char in typerString
   * @type {date}
   */
  const endTime = ref(checkLocalStorage("endTime", undefined))

  /**
   *
   */
  const fetchChallenge = async () => {
    await setChallengeData(true)

    challengeDate.value = new Date().toLocaleDateString()
    startTime.value = undefined
    endTime.value = undefined
  }

  /**
   * Uses same scripture data but resets timer and success states
   */
  const resetChallenge = () => {
    challengeActive.value = false
    startTime.value = undefined
    endTime.value = undefined

    setChallengeData(false)
  }

  /**
   * Typing challenge string
   * @type {string}
   */
  // const challengeString = computed(() => (scripture.value ? scripture.value.content : ""))

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
   * Catches challenge end time once completed
   */
  watch(
    () => challengeComplete.value,
    (value) => {
      if (value) {
        challengeActive.value = false
        endTime.value = Date.now()
      }
    },
  )

  /**
   * Time of completed challenge in seconds
   * @type {number}
   */
  const challengeTime = computed(() =>
    startTime.value && endTime.value
      ? Math.floor((endTime.value - startTime.value) / 1000)
      : undefined,
  )
  /**
   * Calculated words per minute typed (uses char count of typer string divided by 5 for avg len of word)
   */
  const wpmAverage = computed(() =>
    challengeTime.value
      ? Math.floor(
          ((challengeData.value.length / 5) * challengeAccuracy.value) / (challengeTime.value / 60),
        )
      : undefined,
  )

  /**
   *
   */
  const challengeAccuracy = computed(() => {
    const perfectCharsNo = challengeData.value.filter(({ firstAttempt }) => firstAttempt).length
    const successCharsNo = challengeData.value.filter(({ isSuccess }) => isSuccess).length

    return Number((perfectCharsNo / successCharsNo).toFixed(2))
  })
  /**
   * Initiates challenge by fetching scripture and setting data
   */
  const setChallengeData = async (isNew: boolean) => {
    if (isNew) scripture.value = await getScripture()

    if (scripture.value) {
      challengeData.value = scripture.value.content
        .replace(/[‘’]/g, "'")
        .split("")
        .map((char, idx) => ({
          char,
          isCurrent: idx === 0,
          isSuccess: undefined,
          firstAttempt: undefined,
        }))
    }
  }

  /**
   * Handle keypresses during challenge
   *
   * @param {KeyboardEvent} event
   */
  const handleInput = (event: InputEvent) => {
    const currentItem = challengeData.value.find((item) => item.isCurrent)
    const nextItem = challengeData.value[currentItemIndex.value + 1]

    if (event.data && currentItem) {
      // Start timer on first keypress
      if (currentItemIndex.value === 0 && currentItem.isSuccess === undefined) {
        challengeActive.value = true
        startTime.value = Date.now()
      }

      // Success block
      if (event.data === currentItem.char) {
        currentItem.isSuccess = true
        currentItem.isCurrent = false

        if (currentItem.firstAttempt === undefined) {
          currentItem.firstAttempt = true
        }

        if (nextItem) {
          nextItem.isCurrent = true
        }

        // Fail block
      } else {
        currentItem.isSuccess = false

        if (currentItem.firstAttempt === undefined) {
          currentItem.firstAttempt = false
        }
      }
    }
  }

  /**
   * Clear data from local storage
   */
  const clearStorage = () => {
    localStorage.removeItem("typer")
  }

  return {
    scripture,
    challengeData,
    challengeDate,
    challengeComplete,
    challengeTime,
    challengeActive,
    currentItem,
    currentItemIndex,
    wpmAverage,
    challengeAccuracy,
    startTime,
    endTime,
    fetchChallenge,
    resetChallenge,
    handleInput,
    clearStorage,
  }
})
