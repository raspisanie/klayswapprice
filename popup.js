const chkAll = document.querySelector('#checkAll')

let blockCheckAll = {list:[]}
let coinPairs = {list:[]}

chrome.storage.sync.get('coinPairs', data => {
  
  coinPairs = data.coinPairs
  // console.log(coinPairs.list)

  if ('undefined' == typeof coinPairs) {
    return
  }

  if ('undefined' == typeof coinPairs.list) {
    return
  }
  
  chrome.storage.sync.get('blockCheckAll', data => {
    
    if ('undefined' != typeof data.blockCheckAll && 'undefined' != typeof data.blockCheckAll.list) {
      blockCheckAll = data.blockCheckAll
    }

    const buttons = document.querySelector('#buttons')

    for (const coinPair of coinPairs.list) {

      const from = coinPair.from
      const fromIdx = coinPair.fromIdx
      const to = coinPair.to
      const toIdx = coinPair.toIdx

      const wrap = document.createElement('div')
      wrap.classList.add('checkWrapper')
      buttons.appendChild(wrap)

      const btn = document.createElement('button')
      wrap.appendChild(btn)

      btn.classList.add('btnCheck')
      btn.innerText = from + ' to ' + to

      btn.addEventListener('click', async () => {

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        const tabId = tab.id

        chrome.scripting.executeScript(
          {
            target: { tabId },
            files: [
              'CheckCoinPrice.js'
            ]
          },
          () => {
            chrome.tabs.sendMessage(tab.id, '_checkcoin_params=' + JSON.stringify([from, fromIdx, to, toIdx]))
          }
        )
      })

      const chk = document.createElement('input')
      chk.type = 'checkbox'
      chk.classList.add('chk4CheckAll')

      const blockKey = blockCheckKey(from, fromIdx, to, toIdx)
      if (blockCheckAll.list.includes(blockKey)) {
        chk.checked = false
      } else {
        chk.checked = true
      }

      chk.addEventListener('click', () => {

        if (chk.checked) {
          blockCheckAll.list = blockCheckAll.list.filter(v => v != blockKey)
        } else {
          blockCheckAll.list.push(blockKey)
        }

        chrome.storage.sync.set({blockCheckAll})
        refreshChkAll()
      })

      wrap.appendChild(chk)
    }

    refreshChkAll()
  })

})

const btnShowAllCoinPrices = document.querySelector("#btnShowAllCoinPrices")

btnShowAllCoinPrices.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const tabId = tab.id
  // alert('btnShowAllCoinPrices clicked')
  chrome.scripting.executeScript(
    {
      target: { tabId },
      files: [
        'CheckCoinPrice.js'
      ]
    },
    () => {
      chrome.tabs.sendMessage(tab.id, '_checkcoin_checkAll')
    }
  )

  window.close()
})

chkAll.addEventListener('click', () => {
  blockCheckAll.list = []

  if (true == chkAll.checked) {
    chrome.storage.sync.set({blockCheckAll})
    for (const chk of document.querySelectorAll('.chk4CheckAll')) {
      chk.checked = chkAll.checked
    }
    return
  }

  for (const item of coinPairs.list) {
    const from = item.from
    const fromIdx = item.fromIdx
    const to = item.to
    const toIdx = item.toIdx

    const blockKey = blockCheckKey(from, fromIdx, to, toIdx)

    blockCheckAll.list.push(blockKey)
  }

  chrome.storage.sync.set({blockCheckAll})
  for (const chk of document.querySelectorAll('.chk4CheckAll')) {
    chk.checked = chkAll.checked
  }
})

document.querySelectorAll(".bookmarks button").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const hotkey = parseInt(btn.id[btn.id.length - 1])
    // alert(hotkey)
    gotoFavoriteSiteByHotkey(hotkey)
  })
})

document.addEventListener('keypress', (e) => {
  const code = e.code
  if (false == code.includes('Digit')) {
    return
  }
  
  const hotkey = parseInt(code[code.length - 1])
  gotoFavoriteSiteByHotkey(hotkey)
})

function gotoFavoriteSiteByHotkey(hotkey) {
  switch (hotkey) {
    case 1:
      gotoKfi()
      break
    case 2:
      gotoKsp()
      break
    case 3:
      gotoUfo()
      break
    case 4:
      gotoKokoa()
      break
    case 5:
      gotoDonkey()
      break
    case 6:
      gotoKai()
      break
    case 7:
      gotoJun()
      break
    case 8:
      gotoClink()
      break
    case 9:
      gotoTothem()
      break
    case 0:
      gotoDexata()
      break
  }
}

function gotoKfi() {
  chrome.tabs.create({url: 'https://klayfi.finance/'})
}

function gotoKsp() {
  chrome.tabs.create({url: 'https://klayswap.com/'})
}

function gotoUfo() {
  chrome.tabs.create({url: 'https://ufoswap.fi/'})
}

function gotoKokoa() {
  chrome.tabs.create({url: 'https://app.kokoa.finance/'})
}

function gotoDonkey() {
  chrome.tabs.create({url: 'https://www.donkey.fund/main'})
}

function gotoKai() {
  chrome.tabs.create({url: 'https://kaiprotocol.fi/'})
}

function gotoJun() {
  chrome.tabs.create({url: 'https://junprotocol.io/'})
}

function gotoClink() {
  chrome.tabs.create({url: 'https://clink.pro/'})
}

function gotoTothem() {
  chrome.tabs.create({url: 'https://tothem.pro/'})
}

function gotoDexata() {
  chrome.tabs.create({url: 'https://dexata.kr/'})
}

function blockCheckKey(from, fromIdx, to, toIdx) {
  return `${from},${fromIdx},${to},${toIdx}`
}

function refreshChkAll() {
  chkAll.checked = true
  for (const chk of document.querySelectorAll('.chk4CheckAll')) {
    if (false == chk.checked) {
      chkAll.checked = false
      return
    }
  }
}