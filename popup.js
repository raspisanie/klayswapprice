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

function blockCheckKey(from, fromIdx, to, toIdx) {
  return `${from},${fromIdx},${to},${toIdx}`
}

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

function refreshChkAll() {
  chkAll.checked = true
  for (const chk of document.querySelectorAll('.chk4CheckAll')) {
    if (false == chk.checked) {
      chkAll.checked = false
      return
    }
  }
}