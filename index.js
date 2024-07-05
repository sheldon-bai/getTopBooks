const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')

async function getBooksHtml(url) {
  console.log(url)
  const response = await axios.get(url)

  return response.data
}

async function getAllBooks() {
  let books = []

  for (let i = 0; i <= 225; i += 25) {
    const url = 'https://book.douban.com/top250'
    let html
    let formattedUrl

    if (i === 0) {
      html = await getBooksHtml(url)
    }
    else {
      formattedUrl = `${url}?start=${i}`
      html = await getBooksHtml(formattedUrl)
    }

    // const formatted

    const newBooks = await getBooksData(html)

    books = [...books, ...newBooks]
  }

  // console.log('books: ', books)

  return books
}


async function getBooksData(html) {
  const $ = cheerio.load(html)
  const trs = $('tr.item')

  const books = []

  for (let i = 0; i < trs.length; i++) {
    const book = formatBook($(trs[i]))

    books.push(book)
  }

  return books
}

function formatBook(book) {
  const name = book.find('div.pl2 a').text()
  const rating = book.find('span.rating_nums').text()
  const author = book.find('td p.pl').text()
  const href = book.find('a.nbg').attr('href')

  const formattedAuthor = author.split('/')[0]

  const formattedName = name.replace(/\s/g, '')

  result = `${rating} - ${formattedName} - ${formattedAuthor} - ${href}`


  return result
}

getAllBooks().then(books => {


  const json = JSON.stringify(books.sort().reverse())

  fs.writeFile('Top Books.json', json, () => {
    console.log('Success!')
  })
})
