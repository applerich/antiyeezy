/* anti_yeezy by ZyZsKi */

process.title = 'antiyeezy';

/* config options */
const CONFIG = {
  partySize: 1,
  // testUrl: 'http://zyzski.com/yeezy',
  // liveUrl: 'http://adidas.bot.nu/yeezy',
  liveUrl: 'http://yzy.zyzski.com/',
  // liveUrl: 'http://www.adidas.com/us/apps/yeezy',
  showBrowsers: true,
  splashUniqueIdentifier: '[data-sitekey]',
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.109 Safari/537.36',
  headers: {
    Pragma: 'no-cache',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'en-US,en;q=0.8',
  },
  delay: {
    loadPageInstance: 1000,
    pageRefresh: 4000,
  },
};

const path = require('path');
const Nightmare = require('nightmare');
const chalk = require('chalk');
const util = require('util');
const os = require('os-utils');
const opn = require('opn');
const beep = require('beepbeep');

/*
	front end
*/
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(express.static(path.join(__dirname, '/server')));

server.listen(3000, () => {
  console.log('antiyeezy watcher listening on port 3000!');
  opn('http://localhost:3000');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
  console.log('front end connected');
});

const state = {
  performance: {
    cpu: '-',
    memory: '-',
  },
  instanceReloadCount: new Array(CONFIG.partySize).fill(0),
  instanceStatus: new Array(CONFIG.partySize).fill('Initializing'),
  instanceCookies: new Array(CONFIG.partySize),
};

console.log(state.instanceReloadCount);

const url = CONFIG.liveUrl;

const cookieArr = new Array(CONFIG.partySize);
const browserArr = new Array(CONFIG.partySize);
const browserArrSize = browserArr.length;

async function createInstances() {
  return new Promise((resolve, reject) => {
    let i = 0;
    for (; i < browserArrSize; i++) {
      browserArr[i] = Nightmare({
        show: CONFIG.showBrowsers,
        alwaysOnTop: false,
        dock: true,
        // preload: 'preload.js',
        executionTimeout: 5000,
        nodeIntegration: false,
        webSecurity: false,
        allowRunningInsecureContent: true,
        openDevTools: {
          mode: 'detach',
        },
        webPreferences: {
          // partition: i,
          partition: `persist:browser${i}`,
        },
      })
        .useragent(CONFIG.userAgent)
        .cookies.clearAll();
    }

    updateStats();
    io.emit('nodeSync', state);
    resolve(console.log(`${i} browsers created`));
  });
}

async function openPage(instance, id) {
  return instance
    .header('Pragma', 'no-cache')
    .goto(url)
    .wait('body')
    .then(result => {
      console.log(chalk.green(`Instance ${id} connected to ${url}`));
      state.instanceStatus[id] = 'Connected';
      splashParty(instance, id);
      // run tests
    })
    .catch(error => {
      console.error('an error has occurred: ' + error);
      console.error(util.inspect(error));
      instance.end();
    });
}

async function loadPages() {
  // assign browser instance to browser array
  console.time('Loaded browsers');
  for (let i = 0; i < browserArrSize; i++) {
    await openPage(browserArr[i], i);
    state.instanceStatus[i] = 'Loaded';
  }
  console.timeEnd('Loaded browsers');
  io.emit('nodeSync', state);
}

function splashParty(instance, id) {
  instance
    .exists(CONFIG.splashUniqueIdentifier)
    .then(isSplash => {
      if (isSplash) {
        console.log(chalk.green.bold(`Instance ${id} bypassed splash`));
        instance.cookies.get({ url: null }).then(cookies => {
          state.instanceCookies[id] = cookies;
          printCookies(cookies);
        });
        state.instanceStatus[id] = 'BYPASSED ✅';
        io.emit('nodeSync', state);
        beep(5);
        return instance.show();
      } else {
        return instance
          .header('Pragma', 'no-cache')
          .wait(CONFIG.delay.pageRefresh)
          .then(() => {
            const cook = instance.cookies.get({ url: null });
            console.log('COOKIES: \n', cook);
            return instance.cookies.clearAll();
          })
          .then(() => instance.clearCache())
          .then(() => instance.refresh())
          .then(() => {
            console.log(`Refreshed instance ${id}`);
            state.instanceReloadCount[id]++;
            state.instanceStatus[id] = 'Refreshing';
            updateStats();
            io.emit('nodeSync', state);
            splashParty(instance, id);
          });
      }
    })
    .catch(error => {
      console.log(chalk.red(`Error: `, error));
    });
}

async function runBot() {
  console.log('start');
  console.log(`OS: ${os.platform()}`);
  console.log(`CPUS: ${os.cpuCount()}`);
  showStats();
  addCustomActions();
  await createInstances();
  await loadPages();
  console.log('All instances loaded...\n');
}

runBot();

function addCustomActions() {
  Nightmare.action(
    'show',
    function(name, options, parent, win, renderer, done) {
      parent.respondTo('show', function(done) {
        win.show();
        done();
      });
      done();
    },
    function(done) {
      this.child.call('show', done);
    }
  );

  Nightmare.action(
    'clearCache',
    function(name, options, parent, win, renderer, done) {
      parent.respondTo('clearCache', function(done) {
        win.webContents.session.clearCache(done);
        done();
      });
      done();
    },
    function(done) {
      this.child.call('clearCache', done);
    }
  );
}

function showStats() {
  os.cpuUsage(percent => {
    let cpu = (percent * 100).toFixed(2);
    let memory = (os.freememPercentage() * 100).toFixed(2);
    console.log(chalk.magenta(`CPU Usage: ${cpu}%`));
    console.log(chalk.magenta(`Memory: ${memory}%\n\n`));
  });
}

function updateStats() {
  os.cpuUsage(percent => {
    let cpu = (percent * 100).toFixed(2);
    let memory = (os.freememPercentage() * 100).toFixed(2);
    state.performance.cpu = cpu;
    state.performance.memory = memory;
  });
}

function printCookies(cookies) {
  console.log(chalk.bgBlack.cyan('******************************************'));
  console.log(chalk.bgBlack.cyan('Complete Cookie Output'));
  console.log(chalk.bgBlack.cyan('******************************************'));
  // console.log(JSON.stringify(cookies, null, 4))
  console.log(JSON.stringify(cookies));
  io.emit('nodeSync', state);
  console.log(chalk.bgBlack.cyan('******************************************'));
}
