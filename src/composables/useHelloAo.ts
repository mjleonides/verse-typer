import booksData from "@/assets/data/helloao/eng_asv/books.json"
import type { ChapterData } from "@/types/helloao"
import type { ScriptureData } from "@/types"
import { generateRandomInt } from "@/utils/generateRandomInt"

export default function useHelloAo() {
  const randomBook = () => {
    const numBooks = booksData.translation.numberOfBooks
    return booksData.books[generateRandomInt({ max: numBooks })]
  }

  const getRandomChapter = async () => {
    const book = randomBook()
    const numChapters = book.numberOfChapters
    const randChapterInt = generateRandomInt({ min: 1, max: numChapters })

    try {
      const data = await fetch(
        `https://bible.helloao.org/api/eng_asv/${book.id}/${randChapterInt}.json`,
      ).then((request) => request.json())

      return data
    } catch (error) {
      console.log(error)

      return error
    }
  }

  const randomVerseStart = (chapterData: ChapterData) => {
    const numVerses = chapterData.numberOfVerses

    return generateRandomInt({ min: 1, max: numVerses - 5 })
  }

  /**
   *
   * @todo
   * Would be great if this actually returned more data than just the typer string
   * It should return the challenge string, number of words (num chars / 5), and starting/ending verse  num
   *
   * @param chapterData
   * @returns
   */
  const createChallengeString = (chapterData: ChapterData, verseStart: number) => {
    const chapterContentArray = chapterData.chapter.content

    // Currently limit num of verses to 5, it seems like enough
    const flatContent = chapterContentArray.flatMap((item) => {
      if (item.number >= verseStart && item.number < verseStart + 5) return item.content
    })

    return flatContent.filter(Boolean).join(" ")
  }

  /**
   * @returns {ScriptureData}
   */
  const getScripture = async () => {
    const chapterData = await getRandomChapter()
    const verseStart = randomVerseStart(chapterData)
    const content = createChallengeString(chapterData, verseStart)

    return {
      book: chapterData.book.commonName,
      chapter: chapterData.chapter.number,
      translation: chapterData.translation.shortName,
      verseStart: verseStart,
      verseEnd: verseStart + 5,
      content,
    }
  }

  return { getScripture }
}
