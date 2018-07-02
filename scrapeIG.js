
const {Builder, By, Key, until} = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const fs = require('fs');
const date = new Date();


(async () => {
let driver = await new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(/* ... */)
    .setFirefoxOptions(/* ... */)
    .build();

    const account = ''; //Your account name or username

    String.prototype.format = function () {
    var str = this;
    for (var i = 0; i < arguments.length; i++) {
       str = str.replace('{' + i + '}', arguments[i]);
    }
    return str;
    }

    try { await driver.get('https://www.instagram.com/accounts/login/');


    // Login
    const username = ''; // Your Instagram username here
    const password = ''; // Your password
    await driver.findElement(By.xpath("//div/input[@name='username']")).sendKeys(username);
    await driver.findElement(By.xpath("//div/input[@name='password']")).sendKeys(password);
    await driver.findElement(By.xpath('//span/button')).click();


    await driver.wait(until.elementLocated(By.partialLinkText('Find People')),5000);

    // Scrape followers session

    await driver.get("https://www.instagram.com/{0}/".format(account));

    // Click the 'Follower(s)' link
    await driver.findElement(By.partialLinkText("follower")).click();

    //Wait for the followers modal to load
    var XPATH = "/html/body/div[3]/div/div[2]/div/div[1]";
    await driver.wait(until.elementLocated(By.xpath(XPATH)));


    let followersModal; //Pause to allow loading of content
    await driver.executeScript("followersModal = document.getElementsByClassName('j6cq2')[0];");
    var lastHeight = await driver.executeScript("return followersModal.scrollHeight;");

    // We need to scroll the followers modal to ensure that all followers are loaded
      while(1) {
          await driver.executeScript("followersModal.scrollTo(0, followersModal.scrollHeight);");

          // Wait for page to load
          await driver.sleep(500);

          // Calculate new scrollHeight and compare it with the previous
          var newHeight = await driver.executeScript("return followersModal.scrollHeight;");
          if (newHeight == lastHeight)
              break;
          lastHeight = newHeight;

         }


    //Finally, scrape the followers
    XPATH = "/html/body/div[3]/div/div[2]/div/div[2]/ul/div/li";
    var followers_elems = await driver.findElements(By.xpath(XPATH));
    var followers_temp = [];
    async function pushTextIn() {
    for (let i = 0; i < followers_elems.length; i++) {
    var text = await followers_elems[i].getText();
    followers_temp.push(text.replace(/\n|\n/g,' | ').replace(/Following|Follow/g,''));
    }

    return followers_temp;
    }

    let followers = await pushTextIn();

    // Scrape following session

    await driver.get("https://www.instagram.com/{0}/".format(account));

    // Click the 'Following(s)' link
    await driver.findElement(By.partialLinkText("following")).click();

    //Wait for the followers modal to load
    XPATH = "/html/body/div[3]/div/div[2]/div/div[1]";
    await driver.wait(until.elementLocated(By.xpath(XPATH)));


    let followingModal; //Pause to allow loading of content
    await driver.executeScript("followingModal = document.getElementsByClassName('j6cq2')[0];");
    lastHeight = await driver.executeScript("return followingModal.scrollHeight;");

    // We need to scroll the following modal to ensure that all followers are loaded
      while(1) {
          await driver.executeScript("followingModal.scrollTo(0, followingModal.scrollHeight);");

          // Wait for page to load
          await driver.sleep(500);

          // Calculate new scrollHeight and compare it  with the previous
          newHeight = await driver.executeScript("return followingModal.scrollHeight;");
          if (newHeight == lastHeight)
              break;
          lastHeight = newHeight;

         }

    //Finally, scrape the followings
    XPATH = "/html/body/div[3]/div/div[2]/div/div[2]/ul/div/li";
    var following_elems = await driver.findElements(By.xpath(XPATH));
    var following_temp = [];
    async function pushtextIn() {
    for (let j = 0; j < following_elems.length; j++) {
    text = await following_elems[j].getText();
    following_temp.push(text.replace(/\n|\n/g,' | ').replace(/Following|Follow/g,''));
    }

    return following_temp;
    }

    let following = await pushtextIn();

    // Save the results in a file
    fs.appendFileSync('Results.txt', '\n\n');
    fs.appendFileSync('Results.txt', date);
    fs.appendFileSync('Results.txt', '\n\n');
    fs.appendFileSync('Results.txt', 'Followers\n------------------------\n');
    fs.appendFileSync('Results.txt', followers);
    fs.appendFileSync('Results.txt', '\n\n\n');
    fs.appendFileSync('Results.txt', 'Following\n------------------------\n');
    fs.appendFileSync('Results.txt', following);
    fs.appendFileSync('Results.txt', '\n\n\n');

    // Returns the people who unfollowed you and the people who YOU don't follow back
    let jerks = following.filter(a => !followers.includes(a));
    let play_hard_to_get = followers.filter(b => !following.includes(b));

    fs.appendFileSync('Results.txt', 'Who are not in followers\n------------------------\n');
    fs.appendFileSync('Results.txt', jerks);
    fs.appendFileSync('Results.txt', '\n\n\n');
    fs.appendFileSync('Results.txt', 'Who are not in following\n------------------------\n');
    fs.appendFileSync('Results.txt', play_hard_to_get);


    } finally {
      await driver.quit();
    }
  })();
