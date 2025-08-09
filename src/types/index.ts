export interface TyperDataItem {
  char: string
  isCurrent: boolean
  isSuccess: boolean | undefined
}
export interface ScriptureData {
  book: string
  chapter: string
  verseStart: number
  verseEnd: number
  translation: string
  content: string
}
