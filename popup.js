const chkAll = document.querySelector('#checkAll')
const btnShowAllCoinPrices = document.querySelector("#btnShowAllCoinPrices")

let blockCheckAll = {list:[]}
let coinPairs = {list:[]}

chrome.storage.sync.get('coinPairs', data => {
  
  coinPairs = data.coinPairs
  // console.log(coinPairs.list)

  if ('undefined' != typeof coinPairs && 'undefined' != typeof coinPairs.list) {
    initCoinPriceCheckBtns()
  }

  initSiteHotkeyBtns()

  document.querySelectorAll("#bookmarks button").forEach((btn) => {
    btn.addEventListener("click", async () => {
      gotoByHotkeyBtn(btn)
    })
  })
  
  document.addEventListener('keypress', (e) => {
    const code = e.code

    if ('Space' == code) {
      btnShowAllCoinPrices.click()
      return
    }

    if (false == code.includes('Digit')) {
      return
    }
    
    const hotkey = parseInt(code[code.length - 1])
    gotoFavoriteSiteByHotkey(hotkey)
  })

  chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
    const url = tabs[0].url
    if (false == url.includes('klayswap.com')) {
      document.querySelector('#price-check-panel').style.display = 'none'
      document.querySelector('body').style.width = 'initial'
    }
  })

  function initCoinPriceCheckBtns() {
    chrome.storage.sync.get('blockCheckAll', data => {
    
      if ('undefined' != typeof data.blockCheckAll && 'undefined' != typeof data.blockCheckAll.list) {
        blockCheckAll = data.blockCheckAll
      }
  
      const chkButtons = document.querySelector('#chkButtons')
  
      for (const coinPair of coinPairs.list) {
  
        const from = coinPair.from
        const fromIdx = coinPair.fromIdx
        const to = coinPair.to
        const toIdx = coinPair.toIdx
  
        const wrap = document.createElement('div')
        wrap.classList.add('checkWrapper')
        chkButtons.appendChild(wrap)
  
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
    })  // chrome.storage.sync.get('blockCheckAll', data => {
  }

  function gotoByHotkeyBtn(btn) {
    const id = btn.id
    const name = id.replace('btnBookmark-', '')
    const bookmark = Bookmarks.list.find(bookmark => bookmark.name == name)
    const url = bookmark.url
    chrome.tabs.create({url})
  }
  
  function gotoFavoriteSiteByHotkey(hotkey) {

    if ('undefined' == typeof coinPairs) {
      gotoFavoriteSiteByDefaultHotkey(hotkey)
      return
    }

    let idx = hotkey - 1
    if (0 == hotkey) {
      idx = 9
    }

    const hotkeyBtns = [...document.querySelectorAll('#bookmarks button')]
    gotoByHotkeyBtn(hotkeyBtns[idx])
  }
  
  function gotoFavoriteSiteByDefaultHotkey(hotkey) {
    let curBookmark = null
    switch (hotkey) {
      case 1:
        curBookmark = bookmark('kfi')
        break
      case 2:
        curBookmark = bookmark('ksp')
        break
      case 3:
        curBookmark = bookmark('ufo')
        break
      case 4:
        curBookmark = bookmark('kokoa')
        break
      case 5:
        curBookmark = bookmark('donkey')
        break
      case 6:
        curBookmark = bookmark('kai')
        break
      case 7:
        curBookmark = bookmark('jun')
        break
      case 8:
        curBookmark = bookmark('clink')
        break
      case 9:
        curBookmark = bookmark('tothem')
        break
      case 0:
        curBookmark = bookmark('dexata')
        break
      default:
        return
    }

    const url = curBookmark.url
    chrome.tabs.create({url})
  }

  function bookmark(name) {
    return Bookmarks.list.find(bookmark => bookmark.name == name)
  }
  
  function initSiteHotkeyBtns() {
    if ('undefined' == typeof coinPairs) {
      return
    }

    const bookmarks = document.querySelector('#bookmarks')
    const btns = [...bookmarks.querySelectorAll('button')]
    btns.forEach(btn => btn.remove())

    const hotkeys = [...coinPairs.bookmarkHotkeys].sort((l, r) => {
      if (!l.key) {
        return 1
      }

      if (!r.key) {
        return -1
      }
      return l.key - r.key
    })

    // alert(hotkeys[0].name)
    for (const hotkey of hotkeys) {
      const name = hotkey.name
      const btn = btns.find(btn => btn.id == 'btnBookmark-' + name)
      
      btn.textContent = hotkey.key
      bookmarks.append(btn)
    }
  }
})



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

  if ('undefined' != typeof coinPairs) {
    for (const item of coinPairs.list) {
      const from = item.from
      const fromIdx = item.fromIdx
      const to = item.to
      const toIdx = item.toIdx
  
      const blockKey = blockCheckKey(from, fromIdx, to, toIdx)
  
      blockCheckAll.list.push(blockKey)
    }
  }

  chrome.storage.sync.set({blockCheckAll})
  for (const chk of document.querySelectorAll('.chk4CheckAll')) {
    chk.checked = chkAll.checked
  }
})

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