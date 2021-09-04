const btnShowCoinPrices = document.getElementById("btnShowCoinPrices")

btnShowCoinPrices.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const tabId = tab.id

  chrome.scripting.executeScript(
    {
      target: { tabId },
      files: [
        'CheckCoinPrice.js'
      ]
    },
    () => {}
  )
})