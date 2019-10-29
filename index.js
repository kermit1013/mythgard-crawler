const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio')

const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
var driver = new webdriver.Builder()
  .withCapabilities(webdriver.Capabilities.chrome())
  .build();

var imageLinkArr = [];
var pageSource = "";
//promise
var getLinks = new Promise(async function (resolve, reject) {
  const Url = 'https://mythdb.eu/html/cards.html'
  //async await
  try {
    await driver.get(Url)
    await driver.sleep(10000);
    await driver.getPageSource().then((res) => {
      pageSource = res;
    });
  } finally {
    console.log("====get html====")
    resolve();
  }
})
  .then(() => {
    console.log('===then===');
    const $ = cheerio.load(pageSource);
    $('#cards a').each((index, value) => {
      var imageLink = $(value).attr('href');
      imageLinkArr.push(imageLink);
    });
    console.log(imageLinkArr);
  })
  .then(() => {
    console.log('===download start===');
    downloadFile();
    console.log('===browse quit ... waiting for reading===');
    driver.quit();
  });

var downloadFile = () => {
  readFile(function () {
    console.log("===reading finished!===");
  });
}
// call back function
var readFile = function (callback) {
  if (imageLinkArr.length > 0) {
    var link = imageLinkArr.shift();
    var fileName = link.split('/')[link.split('/').length - 1];
    var file = fs.createWriteStream(`./cards/${fileName}`);
    https.get("https://mythdb.eu".concat(link), function (response) {
      response.pipe(file);
      readFile(callback);
    });
  } else {
    callback();
  }
}  