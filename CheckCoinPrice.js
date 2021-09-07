readyAlert()

if ('/exchange/swap' != window.location.pathname) {
    gotoSwapTab()
} else {
    startCheck()
}

async function gotoSwapTab() {
    for (const navi of document.getElementsByClassName('nav-with-bar')) {
        const naviText = navi.textContent.toLowerCase()
        if (naviText.includes('swap') || naviText.includes('스왑')) {
            navi.click()
            break
        }
    }

    while (true) {
        const inputWraps = elmsByCls('md-input-wrap')
        if (2 == inputWraps.length) {
            // console.log('changed')
            break
        }
        // console.log('waiting...')
        await sleep(100)
    }

    startCheck()
}

function startCheck() {
    chrome.storage.sync.get('coinPairs', data => {
        const coinPairs = data.coinPairs
    
        if ('undefined' == typeof coinPairs.list) {
            return
        }
    
        showCoinPairsPrice(coinPairs.list)
    })
}

function elmsByCls(cls) {
    let doc = this
    if (this == window) {
        doc = document
    }
    return doc.getElementsByClassName(cls)
}

function elmByCls(cls) {
    return elmsByCls.call(this, cls)[0]
}

function elmById(id) {
    return document.getElementById(id)
}

function elmsByTag(tag) {
    let doc = this
    if (this == window) {
        doc = document
    }
    return doc.getElementsByTagName(tag)
}

function elmByTag(cls) {
    return elmsByTag.call(this, cls)[0]
}

async function showCoinPairsPrice(coinPairs) {
    const r = []

    for (const coinPair of coinPairs) {
        const fromToPrices = await getCoinPairPrice(coinPair.from, coinPair.to)
        r.push(fromToPrices)
    }

    showAlert(r.join('<br/>'))
}

async function getCoinPairPrice(from, to) {
    const inputWraps = elmsByCls('md-input-wrap')
    const fromInput = elmByTag.call(inputWraps[0], 'input')
    const toInput = elmByTag.call(inputWraps[1], 'input')

    await selectFrom(from)
    await selectTo(to)
    await setInputValue(fromInput, 1)
    await waitInputIsNotUntil(toInput, 0)

    return from + ' to ' + to + '=' + toInput.value
}

async function waitInputIsNotUntil(input, value) {
    while (true) {
        if (input.value != value) {
            break
        }
        await sleep(100)
    }
}

function setInputValue(input, value) {
    input.value = value
    input.dispatchEvent(new Event('input'))
    input.dispatchEvent(new Event('keyup'))
}

async function selectFrom(from) {
    const btnFrom = elmsByCls('ic-token-symbol')[0]
    btnFrom.click()
    await selectCoinInMenu(from)
}

async function selectTo(to) {
    const btnTo = elmsByCls('ic-token-symbol')[1]
    btnTo.click()
    await selectCoinInMenu(to)
}

function sleep(ms) {
    return new Promise((resolve) =>
        setTimeout(resolve, ms)
    );
}

async function selectCoinInMenu(coin) {
    await waitForSelectCoinMenuIsVisible()

    const searchBar = elmByTag.call(elmByCls('support-token-search'), 'input')
    setInputValue(searchBar, coin)
    await sleep(100)
    elmByCls('list-row').click()

    while (true) {
        if (isCoinSelectMenuGone()) {
            break
        }
        await sleep(100)
    }
    //console.log('done')

    async function waitForSelectCoinMenuIsVisible() {
        while (true) {
            if (1 == elmsByCls('gen-modal gen-full-modal select-token-modal').length) {
                break
            }
            await sleep(100)
        }
    }

    function isCoinSelectMenuGone() {
        return 0 == elmsByCls('gen-modal gen-full-modal select-token-modal').length
    }
}

function readyAlert() {
    let alert = elmById('gamdoriAlert')
    if (alert) {
        return
    }
    document.body.insertAdjacentHTML('beforeend', '<div id="gamdoriAlert"> <div class="alertMsg">some message<br/>some message2</div> <button>x</button> </div>')
    alert = elmById('gamdoriAlert')

    const style = alert.style
    style.width = '500px'
    style['min-height'] = '100px'
    style['max-height'] = '500px'
    style['z-index'] = 99999
    style.position = 'absolute'
    style.left = '50%'
    style.top = '10%'
    style.border = '1px solid'
    style['background-color'] = 'white'
    style.padding = '5px'
    style.overflow = 'auto'

    const elmMsg = elmByCls.call(alert, 'alertMsg')
    elmMsg.style['font-family'] = 'Arial'
    elmMsg.style['font-size'] = '13px'

    const btnClose = elmByTag.call(alert, 'button')
    btnClose.addEventListener('click', () => {
        style.visibility = 'hidden'
    })

    btnClose.style['margin-top'] = '10px'
    btnClose.style.width = '30px'
    btnClose.style.height = '30px'
    btnClose.style.position = 'absolute'
    btnClose.style.right = '5px'
    btnClose.style.top = 0

    style.visibility = 'hidden'
}

function showAlert(msg) {
    const alert = elmById('gamdoriAlert')
    alert.style.visibility = 'visible'

    const elmMsg = elmByCls.call(alert, 'alertMsg')
    elmMsg.innerHTML = msg
}