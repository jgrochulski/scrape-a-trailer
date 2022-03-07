const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const { render } = require('express/lib/response')

/*
NOTE: if we want to scrape the DOM instead of the HTML:

  const htmlparser2 = require('htmlparser2');
  const dom = htmlparser2.parseDocument(document, options);

  const $ = cheerio.load(dom);
*/

const app = express()


app.get('/', (req, res) => {
  res.json('Welcome to the Bring a Trailer web scraper. Usage: \'/make\' or \'/make/model\'')
})

app.get('/:make', (req, res) => {
  axios.get(`https://bringatrailer.com/${req.params.make}`)
  .then((resp) => {
    const html = resp.data
    const listings = [];

    const $ = cheerio.load(html)
    $(".featured-listing-content").each(function () {
      
      const title = $(".featured-listing-title-link", this).text()
      const link = $(".featured-listing-title-link", this).attr('href')
      const rawPrice = $(".featured-listing-meta-value", this).text()
      const price = rawPrice.replace('$', '').replace(',', '').replace(',', '')
      const ending = $("[data-featured_listing_ends]", this).attr('data-featured_listing_ends')

      listings.push({
        title,
        price,
        ending,
        link
      })
    })
    if (listings.length > 0) res.json(listings)
    else res.json(`no current \'${req.params.make}\' listings found`)
  }).catch(err => res.json({
    error: `${req.params.make} not found`,
    status: "404"
  }))
})

app.get('/:make/:model', (req, res) => {
  axios.get(`https://bringatrailer.com/${req.params.make}/${req.params.model}`)
  .then((resp) => {
   
    const html = resp.data
    const listings = [];

    const $ = cheerio.load(html)
    $(".featured-listing-content").each(function () {
      
      const title = $(".featured-listing-title-link", this).text()
      const link = $(".featured-listing-title-link", this).attr('href')

      const rawPrice = $(".featured-listing-meta-value", this).text()
      const price = rawPrice.replace('$', '').replace(',', '').replace(',', '')
      const ending = $("[data-featured_listing_ends]", this).attr('data-featured_listing_ends')

      listings.push({
        title,
        price,
        ending,
        link
      })
    })
    if (listings.length > 0) res.json(listings)
    else res.json(`no current \'${req.params.make} ${req.params.model}\' listings found`)
  }).catch(err => res.json({
    error: `${req.params.make} ${req.params.model} not found`,
    status: "404"
  }))
})

app.listen(PORT, () => console.log("server running on PORT " + PORT))