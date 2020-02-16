#!/usr/bin/env node

require('colors');
const path = require('path');
const jf = require('jsonfile');
const program = require('commander');
const login = require('./login');
const detail = require('./detail');

/* ---- PUBLIC VARIABLES ---- */
const DIR_PROJECT = path.resolve(__dirname, '../');
const PATH_PKG = path.resolve(DIR_PROJECT, './package.json');

const pkg = jf.readFileSync(PATH_PKG);

/* ---- CLI ---- */

program.version(pkg.version);
program.description(pkg.description);

program
  .command('login')
  .description('Sign in with your account')
  .action(_login);

program
  .command('detail <id>')
  .description('Get product detail')
  .action(_detail);

(function() {
  program.parse(process.argv);
})();

/* ---- ACTION_HANDLERS ---- */

async function _login() {
  await login(true);
}

async function _detail(id) {
  await detail(id);
}
