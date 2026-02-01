import booksData from "@/assets/data/helloao/eng_asv/books.json"
import type { ChapterData, ContentItemPoem, ContentItemLineBreak } from "@/types/helloao"
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

  const createChallengeString = (
    chapterData: ChapterData,
    verseStart: number,
    verseEnd: number,
  ) => {
    const chapterContentArray = chapterData.chapter.content

    const flatContent = chapterContentArray.flatMap((item) => {
      if (item.number >= verseStart && item.number <= verseEnd) {
        if (
          typeof item.content[0] === "object" &&
          ("poem" in item.content[0] || "lineBreak" in item.content[0])
        ) {
          return (item.content as ContentItemPoem[] | ContentItemLineBreak[]).map((item) =>
            "lineBreak" in item ? "" : item.text,
          )
        }
        return item.content as [string]
      }
    })

    return flatContent.filter(Boolean).join(" ")
  }

  /**
   * @returns {ScriptureData}
   */
  const getScripture = async () => {
    const chapterData = await getRandomChapter()
    const verseStart = randomVerseStart(chapterData)
    const verseEnd = verseStart + 4
    const content = createChallengeString(chapterData, verseStart, verseEnd)

    return {
      book: chapterData.book.commonName,
      chapter: chapterData.chapter.number,
      translation: chapterData.translation.shortName,
      verseStart,
      verseEnd,
      content,
    }
  }

  return { getScripture }
}
