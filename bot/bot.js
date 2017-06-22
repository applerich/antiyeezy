/* anti_yeezy by ZyZsKi */

process.title = 'antiyeezy'

/* config options */
const CONFIG = {
  partySize: 20,
  testUrl: 'http://zyzski.com/yeezy',
  liveUrl: 'http://adidas.bot.nu/yeezy',
  showBrowsers: false,
  splashUniqueIdentifier: '[data-sitekey]',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
  delay: {
    loadPageInstance: 200,
    pageRefresh: 3000,
  },
}

const path = require('path')
const Nightmare = require('nightmare')
const chalk = require('chalk')
const util = require('util')
const os = require('os-utils')
const opn = require('opn')
const beep = require('beepbeep')

/*
	front end
*/
var express = require('express')
var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)
app.use(express.static(path.join(__dirname, '/server')))

server.listen(3000, () => {
  console.log('Example app listening on port 3000!')
  opn('http://localhost:3000')
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', socket => {
  console.log('front end connected')
})

const state = {
  performance: {
    cpu: '-',
    memory: '-',
  },
  instanceReloadCount: new Array(CONFIG.partySize).fill(0),
  instanceStatus: new Array(CONFIG.partySize).fill('Initializing'),
}

console.log(state.instanceReloadCount)

const url = CONFIG.liveUrl

const cookieArr = new Array(CONFIG.partySize)
const browserArr = new Array(CONFIG.partySize)
const browserArrSize = browserArr.length

async function createInstances() {
  return new Promise((resolve, reject) => {
    let i = 0
    for (; i < browserArrSize; i++) {
      browserArr[i] = Nightmare({
        show: CONFIG.showBrowsers,
        alwaysOnTop: false,
        dock: true,
        openDevTools: {
          mode: 'detach',
        },
        // webPreferences: {
        // 	partition: i,
        // partition: `persist:browser${i}`
        // },
      })
        .useragent(CONFIG.userAgent)
        .cookies.clearAll()
    }

    resolve(console.log(`${i} browsers created`))
  })
}

async function openPage(instance, id) {
  return instance
    .goto(url)
    .wait('body')
    .then(result => {
      console.log(chalk.green(`Instance ${id} connected to ${url}`))
      state.instanceStatus[id] = 'Connected'
      splashParty(instance, id)
      // run tests
    })
    .catch(error => {
      console.error('an error has occurred: ' + error)
      console.error(util.inspect(error))
      instance.end()
    })
}

async function loadPages() {
  // assign browser instance to browser array
  console.time('Loaded browsers')
  for (let i = 0; i < browserArrSize; i++) {
    await openPage(browserArr[i], i)
    state.instanceStatus[i] = 'Loaded'
  }
  console.timeEnd('Loaded browsers')
}

function splashParty(instance, id) {
  instance
    .exists(CONFIG.splashUniqueIdentifier)
    .then(isSplash => {
      if (isSplash) {
        console.log(chalk.green.bold(`Instance ${id} bypassed splash`))
        instance.cookies.get({ url: null }).then(cookies => {
          printCookies(cookies)
        })
        state.instanceStatus[id] = 'BYPASSED ✅'
        beep(5)
        return instance.show()
      } else {
        return instance
          .wait(CONFIG.delay.pageRefresh)
          .then(() => instance.cookies.clearAll())
          .then(() => instance.clearCache())
          .then(() => instance.refresh())
          .then(() => {
            console.log(`Refreshed instance ${id}`)
            state.instanceReloadCount[id]++
            state.instanceStatus[id] = 'Refreshing'
            updateStats()
            io.emit('nodeSync', state)
            splashParty(instance, id)
          })
      }
    })
    .catch(error => {
      console.log(chalk.red(`Error: `, error))
    })
}

async function runBot() {
  console.log('start')
  console.log(`OS: ${os.platform()}`)
  console.log(`CPUS: ${os.cpuCount()}`)
  showStats()
  addCustomActions()
  await createInstances()
  await loadPages()
  console.log('All instances loaded...\n')
}

runBot()

function addCustomActions() {
  Nightmare.action(
    'show',
    function(name, options, parent, win, renderer, done) {
      parent.respondTo('show', function(done) {
        win.show()
        done()
      })
      done()
    },
    function(done) {
      this.child.call('show', done)
    }
  )

  Nightmare.action(
    'clearCache',
    function(name, options, parent, win, renderer, done) {
      parent.respondTo('clearCache', function(done) {
        win.webContents.session.clearCache(done)
        done()
      })
      done()
    },
    function(done) {
      this.child.call('clearCache', done)
    }
  )
}

function showStats() {
  os.cpuUsage(percent => {
    let cpu = (percent * 100).toFixed(2)
    let memory = (os.freememPercentage() * 100).toFixed(2)
    console.log(chalk.magenta(`CPU Usage: ${cpu}%`))
    console.log(chalk.magenta(`Memory: ${memory}%\n\n`))
  })
}

function updateStats() {
  os.cpuUsage(percent => {
    let cpu = (percent * 100).toFixed(2)
    let memory = (os.freememPercentage() * 100).toFixed(2)
    state.performance.cpu = cpu
    state.performance.memory = memory
  })
}

function printCookies(cookies) {
  console.log(chalk.bgBlack.cyan('******************************************'))
  console.log(chalk.bgBlack.cyan('Complete Cookie Output'))
  console.log(chalk.bgBlack.cyan('******************************************'))
  console.log(JSON.stringify(cookies))
  console.log(chalk.bgBlack.cyan('******************************************'))
}
