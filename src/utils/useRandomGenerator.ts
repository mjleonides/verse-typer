import data from '@/assets/data/eng_asv/books.json'
import type { ChapterData } from '@/types'

export default function useRandomGenerator() {
  const getRandomInt = ({ min = 0, max }: { min?: number; max: number }) => {
    const minCeiled = Math.ceil(min)
    const maxFloored = Math.floor(max)
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)
  }
  const randomBook = () => {
    const numBooks = data.translation.numberOfBooks
    return data.books[getRandomInt({ max: numBooks })]
  }

  const getRandomChapter = async () => {
    const book = randomBook()
    const numChapters = book.numberOfChapters
    const randChapterInt = getRandomInt({ min: 1, max: numChapters })

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

    return getRandomInt({ min: 1, max: numVerses - 5 })
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
  const createChallengeString = (chapterData: ChapterData) => {
    const verseStart = randomVerseStart(chapterData)
    const chapterContentArray = chapterData.chapter.content

    // Currently limit num of verses to 5, it seems like enough
    const flatContent = chapterContentArray.flatMap((item) => {
      if (item.number >= verseStart && item.number < verseStart + 5) return item.content
    })

    return flatContent.filter(Boolean).join(' ')
  }

  return { randomBook, getRandomChapter, createChallengeString }
}
