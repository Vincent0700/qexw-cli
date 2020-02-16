const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const axios = require('axios');
const inquirer = require('inquirer');
const log = require('./log');
const { getPage } = require('./browser');

const DIR_DATA = path.resolve(__dirname, '../data');
const FILE_COOKIE = path.resolve(DIR_DATA, './cookies');

const URL_CLIENTAREA = 'https://www.qexw.com/clientarea.php';
const URL_DOLOGIN = 'https://www.qexw.com/dologin.php';

async function login(relogin = false) {
  // validate cached cookie
  if (!relogin && fs.existsSync(FILE_COOKIE)) {
    const cookie = fs.readFileSync(FILE_COOKIE, { encoding: 'utf8' });
    const content = await axios.get(URL_CLIENTAREA, { headers: { cookie } });
    const match = /<h1>欢迎回来, ([^<]+)<\/h1>/.exec(content.data);
    if (match.length > 1) {
      const username = match[1];
      return { username, cookie };
    }
  }
  log('Please Input your email & password');
  // input email & password
  const REGEX_EMAIL = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;
  const { email, password } = await inquirer.prompt([
    {
      type: 'input',
      message: 'Email:',
      name: 'email'
    },
    {
      type: 'password',
      message: 'Password:',
      name: 'password'
    }
  ]);
  if (!REGEX_EMAIL.test(email)) {
    log('Email error', log.TYPE.ERROR);
    process.exit();
  } else if (password.length < 6) {
    log('Password error', log.TYPE.ERROR);
    process.exit();
  }
  // relogin
  log('Page to ' + URL_DOLOGIN.brightCyan);
  const page = await getPage(URL_DOLOGIN);
  await page.type('#inputEmail', email);
  await page.type('#inputPassword', password);
  await page.click('#login');
  // get username
  try {
    await page.waitForSelector('#main-body h1', { timeout: 10000 });
  } catch (err) {
    log('Login error. Incorrect email or password.', log.TYPE.ERROR);
    process.exit();
  }
  const content = await page.$eval('#main-body h1', (el) => el.innerText);
  const match = /欢迎回来, ([^<]+)/.exec(content);
  if (match.length > 1) {
    const username = match[1];
    const cookies = await page.cookies();
    const cookieItem = cookies.find((item) => item.name.includes('WHMCS'));
    const cookie = `${cookieItem.name}=${cookieItem.value}`;
    // cache cookie
    shell.mkdir('-p', DIR_DATA);
    fs.writeFileSync(FILE_COOKIE, cookie);
    // close browser
    await page.close();
    await page.terminate();

    log('Welcome, ' + username.brightCyan);
    return { username, cookie };
  }
}

module.exports = login;
