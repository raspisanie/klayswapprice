chrome.storage.sync.get('coinPairs', data => {
  const coinPairs = data.coinPairs
  // console.log(coinPairs.list)

  if ('undefined' == typeof coinPairs) {
    return
  }

  if ('undefined' == typeof coinPairs.list) {
    return
  }

  const buttons = document.querySelector('#buttons')

  for (const coinPair of coinPairs.list) {

    const from = coinPair.from
    const fromIdx = coinPair.fromIdx
    const to = coinPair.to
    const toIdx = coinPair.toIdx

    const btn = document.createElement('button')
    buttons.appendChild(btn)
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
  }
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