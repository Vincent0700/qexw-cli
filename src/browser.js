const inquirer = require('inquirer');
const puppeteer = require('puppeteer');

const puppeteerOptions = {
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: true,
  devtools: false,
  defaultViewport: {
    width: 800,
    height: 600,
    isMobile: false
  }
};

let browser = null;

async function getBrowser() {
  browser = browser ? browser : await puppeteer.launch(puppeteerOptions);
  const pages = await browser.pages();
  pages.forEach(async (page) => {
    const url = await page.url();
    if (url === 'about:blank') await page.close();
  });
  return browser;
}

async function getPage(url) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  page.terminate = () => browser.close();
  await page.goto(url);
  return page;
}

module.exports = {
  getPage
};
