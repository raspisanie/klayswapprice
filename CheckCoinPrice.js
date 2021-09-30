function init() {
    const onMessage = (message, sender, sendResponse) => {

        chrome.runtime.onMessage.removeListener(onMessage)

        if (message.includes('_checkcoin_params')) {
            if ('/exchange/swap' != window.location.pathname) {
                gotoSwapTab(() => checkCoin(message))
            } else {
                checkCoin(message)
            }
            return
        }

        switch (message) {
            case '_checkcoin_checkAll':
                checkAll()
                break
        }
    }

    chrome.runtime.onMessage.addListener(onMessage)

    async function checkCoin(message) {
        const paramJson = message.split('=')[1]
        const param = JSON.parse(paramJson)

        const lastCoinPair = { from: '', fromIdx: -1, to: '', toIdx: -1 }
        const coinPair = {
            from: param[0],
            fromIdx: param[1],
            to: param[2],
            toIdx: param[3]
        }
        await getCoinPairPrice(lastCoinPair, coinPair)
    }

    function checkAll() {
        if ('/exchange/swap' != window.location.pathname) {
            gotoSwapTab(startCheck)
        } else {
            startCheck()
        }
    }

    async function gotoSwapTab(callback) {
        for (const navi of document.querySelectorAll('.nav-with-bar')) {
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

        callback()
    }

    function startCheck() {
        hideAlert()
        chrome.storage.sync.get('blockCheckAll', data => {
            let blockCheckAll = { list: [] }

            if ('undefined' != typeof data.blockCheckAll && 'undefined' != typeof data.blockCheckAll.list) {
                blockCheckAll = data.blockCheckAll
            }

            chrome.storage.sync.get('coinPairs', data => {
                const coinPairs = data.coinPairs

                if ('undefined' == typeof coinPairs) {
                    alert('옵션에서 체크할 코인 리스트를 작성해 주세요')
                    return
                }

                if ('undefined' == typeof coinPairs.list) {
                    alert('옵션에서 체크할 코인 리스트를 작성해 주세요')
                    return
                }

                showCoinPairsPrice(coinPairs.list, blockCheckAll.list)
            })

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

    async function showCoinPairsPrice(coinPairs, blockCheckList) {
        const r = []

        let lastCoinPair = { from: '', fromIdx: -1, to: '', toIdx: -1 }
        for (const coinPair of coinPairs) {

            if (blockCheckList.includes(blockCheckKey(coinPair))) {
                continue
            }

            const fromToPrices = await getCoinPairPrice(lastCoinPair, coinPair)
            r.push(fromToPrices)
            lastCoinPair = coinPair
        }

        if (0 == r.length) {
            alert('옵션에서 체크할 코인 리스트를 작성해 주세요')
            return
        }

        let msg = '<div>'
        for (const item of r) {
            const from = item.from
            const to = item.to
            const v = item.v

            msg += from + ' to ' + to + '=' + v + '<br/>'
        }

        msg += '</div>'
        msg += '<textarea id="forExcelPaste">'

        for (const item of r) {
            const v = item.v

            if (r[0] != item) {
                msg += '&#9;'    
            }
            msg += v
        }
        msg += '</textarea>'

        showAlert(msg)

        // source from popup.js
        function blockCheckKey(coinPair) {
            const from = coinPair.from
            const fromIdx = coinPair.fromIdx
            const to = coinPair.to
            const toIdx = coinPair.toIdx

            return `${from},${fromIdx},${to},${toIdx}`
        }
    }

    async function getCoinPairPrice(lastCoinPair, curCoinPair) {
        const from = curCoinPair.from
        let fromIdx = curCoinPair.fromIdx
        const to = curCoinPair.to
        let toIdx = curCoinPair.toIdx

        fromIdx -= 1
        toIdx -= 1

        if (fromIdx < 0 || isNaN(fromIdx)) {
            fromIdx = 0
        }

        if (toIdx < 0 || isNaN(toIdx)) {
            toIdx = 0
        }

        const inputWraps = elmsByCls('md-input-wrap')
        const fromInput = inputWraps[0].querySelector('input')
        const toInput = inputWraps[1].querySelector('input')

        if (lastCoinPair.from != from) {
            if (lastCoinPair.fromIdx != fromIdx)
                await selectFrom(from, fromIdx)
        }

        if (lastCoinPair.to != to) {
            if (lastCoinPair.toIdx != toIdx) {
                await selectTo(to, toIdx)
            }
        }

        let oldValue = toInput.value
        await setInputValue(fromInput, 100)

        let tryCnt = 0
        let hasSwapRoute = false
        while (true) {
            if (toInput.value != oldValue) {
                hasSwapRoute = true
                break
            }
            await sleep(100)
            ++tryCnt

            if (30 == tryCnt) {
                break
            }
        }

        if (hasSwapRoute) {
            oldValue = toInput.value
            await setInputValue(fromInput, 1)

            tryCnt = 0
            while (true) {
                if (toInput.value != oldValue) {
                    break
                }
                await sleep(100)
                ++tryCnt

                if (30 == tryCnt) {
                    break
                }
            }
        }

        let v = toInput.value

        if (!v) {
            v = '변환 불가'
        }

        return { from, to, v }
    }

    function setInputValue(input, value) {
        input.value = value
        input.dispatchEvent(new Event('input'))
        input.dispatchEvent(new Event('keyup'))
    }

    async function selectFrom(from, idx) {
        const btnFrom = elmsByCls('ic-token-symbol')[0]
        btnFrom.click()
        await selectCoinInMenu(from, idx)
    }

    async function selectTo(to, idx) {
        const btnTo = elmsByCls('ic-token-symbol')[1]
        btnTo.click()
        await selectCoinInMenu(to, idx)
    }

    function sleep(ms) {
        return new Promise((resolve) =>
            setTimeout(resolve, ms)
        );
    }

    async function selectCoinInMenu(coin, idx) {
        await waitForSelectCoinMenuIsVisible()

        const searchBar = elmByCls('support-token-search').querySelector('input')
        setInputValue(searchBar, coin)
        await sleep(100)
        //console.log('idx='+idx)
        //console.log(elmsByCls('list-row'))
        document.querySelectorAll('.list-row')[idx].click()

        while (true) {
            if (isCoinSelectMenuGone()) {
                break
            }
            await sleep(100)
            tryCloseWarningModal()
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

    function showAlert(msg) {
        const alert = elmById('gamdoriAlert')
        alert.style.visibility = 'visible'

        const elmMsg = alert.querySelector('.alertMsg')
        elmMsg.innerHTML = msg
    }

    function hideAlert() {
        const alert = elmById('gamdoriAlert')
        alert.querySelector('button').click()
    }

    function tryCloseWarningModal() {
        const warningModal = document.querySelector('.select-unsafe-token-modal')
        if (null == warningModal) {
            return
        }

        const chkAgree = warningModal.querySelector('.confirm-on-modal-option')
        chkAgree.click()

        const btnsInModal = warningModal.querySelectorAll('button')
        const btnConfirm = btnsInModal[btnsInModal.length - 1]
        btnConfirm.click()
    }
}

init()