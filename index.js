require('dotenv').config();                   // read env file
const axios = require('axios');               // make request
const puppeteer = require('puppeteer');
const fs = require('fs')

const email =     process.env.U_EMAIL;
const pwd =       process.env.U_PWD;
const domain =    process.env.DOMAIN;
const domainID =  process.env.DOMAIN_ID;
const waitMin =   parseInt(process.env.WAIT_MIN);
const waitMax =   parseInt(process.env.WAIT_MAX);
const docker =    process.env.DOCKER_INSTALL=='true';

if(!domain || !domainID || !email || !pwd) {
  console.error('Please specify ENV variables: DOMAIN, DOMAIN_ID, U_EMAIL, U_PWD')
  process.exit(1);
}

var page = null;

(async () => {
  checkDir();
  let newIp = await checkOwnIp();

  if(newIp) {
    const browser = await puppeteer.launch(docker ? {
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }: {});
    page = await browser.newPage();
    await login();
    await updateDomain(newIp);
    await browser.close();

    await saveLastIpSet(newIp);
  }
})();

function checkDir() {
  if(!fs.existsSync('output/txt')) fs.mkdirSync('output/txt')
  if(!fs.existsSync('output/img')) fs.mkdirSync('output/img')
}

/**
 * Saves the last IP set to a file for later checks
 * @param {*} newIp The new IP set
 */
function saveLastIpSet(newIp) {
  console.log('Saving new IP set')
  fs.writeFileSync('output/txt/lastIp.txt', newIp)
}

/**
 * Checks own public IP address
 * @returns The new IP address if changed or not supplied before, false otherwise
 */
function checkOwnIp() {
  return new Promise(async(r) => {
    let result = await axios.get('https://api.ipify.org?format=text');
    let lastIp = null;
    if(fs.existsSync('output/txt/lastIp.txt')) {
      lastIp = String(fs.readFileSync('output/txt/lastIp.txt', {encoding: 'UTF-8'}));
    }

    if(result.data != lastIp) {
      console.log('IP changed. Update is needed')
      console.log('new IP is ' + result.data)
      return r(result.data)
    } else {
      console.log('IP not changed. Quitting...')
    }

    r(false);
  })
}

/**
 * Logins into Freenom website with user credentials
 */
function login() {
  return new Promise(async(r) => {
    await page.goto("https://my.freenom.com/clientarea.php")
    await page.$eval("#username", (el, p1) => el.value = p1, email)
    await page.$eval("#password", (el, p1) => el.value = p1, pwd)
    await page.screenshot({ path: "output/img/01_freenom_login_page.png" });
    await waitSomeTime()
    await page.click('[value=Login]')
    await waitSomeTime()
    await page.screenshot({ path: "output/img/02_freenom_loggedin.png" });
    r()
  });
}

/**
 * @Deprecated
 * Open the page with all domains
 */
function openDomains() {
  return new Promise(async(r) => {
    await page.goto("https://my.freenom.com/clientarea.php?action=domains")
    await waitSomeTime()
    await page.screenshot({ path: "output/img/03_freenom_show_my_domains.png" });
    r();
  })
}

/**
 * Update the domain record with new IP
 * @param {*} newIp The new IP to set
 */
function updateDomain(newIp) {
  return new Promise(async(r) => {
    await page.goto(`https://my.freenom.com/clientarea.php?managedns=${domain}&domainid=${domainID}`)
    await waitSomeTime()
    await page.screenshot({ path: "output/img/04_freenom_open_main_console.png" });
    let input = await page.$('[name="records[0][value]')
    await input.click({clickCount: 3})
    await input.type(newIp)
    await page.screenshot({ path: "output/img/05_freenom_set_domain_ip.png" });
    await page.click('#recordslistform button:not([type])')
    await waitSomeTime()
    await page.goto(`https://my.freenom.com/clientarea.php?managedns=${domain}&domainid=${domainID}`)
    await waitSomeTime()
    await page.screenshot({ path: "output/img/06_freenom_check_updated_ip.png" });
    r();
  })
}

/**
 * It waits a random number of seconds between the ranges provided
 */
function waitSomeTime() {
  let waitTime = Math.floor(Math.random() * (waitMax - waitMin + 1) + waitMin)
  console.log('waiting ' + waitTime + 'sec...')
  return new Promise(r => setTimeout(r, waitTime * 1000))
}