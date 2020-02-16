const fs = require('fs');
const path = require('path');
const axios = require('axios');
const log = require('./log');
const login = require('./login');

const DIR_DATA = path.resolve(__dirname, '../data');
const FILE_COOKIE = path.resolve(DIR_DATA, './cookies');

const request = axios.create({ timeout: 30000 });

request.interceptors.request.use(
  function(config) {
    if (fs.existsSync(FILE_COOKIE)) {
      const cookie = fs.readFileSync(FILE_COOKIE, { encoding: 'utf8' });
      config.headers['Cookie'] = cookie;
    } else {
      log('Authentication error. Please login again.', log.TYPE.ERROR);
      process.exit();
    }
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  function(response) {
    const data = response.data;
    if (typeof data === 'string' && /id="inputEmail"/.test(data)) {
      log('Authentication error. Please login again.', log.TYPE.ERROR);
      process.exit();
    }
    return data;
  },
  function(error) {
    return Promise.reject(error);
  }
);

module.exports = request;
