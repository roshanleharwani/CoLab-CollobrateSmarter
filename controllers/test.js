const puppeteer = require('puppeteer');

async function fetchTopGoogleSearchResults(topic) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Construct the search URL
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(topic)}`;

  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 0 });

  
  const searchResults = await page.evaluate(() => {
    const results = [];
      const searchResultElements = document.querySelectorAll('div.g h3');

    let count = 0;
    for (const titleElement of searchResultElements) {
      const linkElement = titleElement.closest('a');

      if (linkElement && titleElement) {
        const url = linkElement.href;
        const title = titleElement.innerText;

        if (url && title) {
          results.push({ uri: url, title: title });
          count++;
        }

        if (count >= 2) break;
      }
    }
    return results;
  });

  
  await browser.close();

  return searchResults;
}

// Usage example
fetchTopGoogleSearchResults('bru gold health impacts ').then(searchResults => {
  console.log(searchResults);
});
