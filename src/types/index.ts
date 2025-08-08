export interface Translation {
  id: string
  name: string
  website: string
  licenseUrl: string
  licenseNotes: string
  shortName: string
  englishName: string
  language: string
  textDirection: string
  sha256: string
  listOfBooksApiLink: string
  numberOfBooks: number
  totalNumberOfChapters: number
  totalNumberOfVerses: number
  languageName: string
  languageEnglishName: string
}

export interface Book {
  id: string
  translationId: string
  name: string
  commonName: string
  title: string
  order: number
  numberOfChapters: number
  sha256: string
  firstChapterApiLink: string
  lastChapterApiLink: string
  totalNumberOfVerses: number
}

export interface Content {
  type: string
  number: number
  content: Array<string>
}
export interface Chapter {
  content: Content[]
  footnotes: string
  number: number
}

export interface ChapterData {
  translation: Translation
  book: Book
  chapter: Chapter
  thisChapterLink: string
  thisChapterAudioLinks: string
  nextChapterApiLink: string
  nextChapterAudioLinks: string
  previousChapterApiLink: string
  previousChapterAudioLinks: string
  numberOfVerses: number
}
