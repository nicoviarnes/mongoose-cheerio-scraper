
### RateBeer Top 50 Scraper

App built with node, axios, cheerio, mongoose, express, and handlebars

The backend uses cheerio to scrape data from https://www.ratebeer.com/top, then uses mongoose to convert the scraped data into mongo documents. The front end renders the mongo documents in a bootstrap table. The user can add notes to any beers on the list and they will be seen by other users of the app. 

### Routes

/scrape - scrapes https://www.ratebeer.com/top and populates the database
/cleardata - removes all collections from the database

### Install

  - clone the repo
  - cd to the project directory
  - npm i
  - node server.js
  (make sure mongodb is running)
  
  
