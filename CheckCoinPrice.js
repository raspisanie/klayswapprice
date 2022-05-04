function init() {
    
    const dev = !('update_url' in chrome.runtime.getManifest())

    log('CheckCoinPrice init')
    const onMessage = (message, sender, sendResponse) => {
        log('message='+message)
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

    log('listener attached')

    async function checkCoin(message) {
        log('checkCoin')
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
        log('checkAll')
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
                // log('changed')
                break
            }
            // log('waiting...')
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
        msg += '<button id="btnCopyCoinPriceResultToClipboard">클립보드로 복사</button>'

        showAlert(msg)

        document.querySelector('#btnCopyCoinPriceResultToClipboard').addEventListener('click',
            () => {
                const txt = document.querySelector('#forExcelPaste')

                txt.select()
                txt.setSelectionRange(0, 99999)

                navigator.clipboard.writeText(txt.value)
                alert('클립보드에 복사 완료')
            }
        )

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
        const to = curCoinPair.to
        let fromIdx = curCoinPair.fromIdx
        let toIdx = curCoinPair.toIdx
        let lastFromIdx = lastCoinPair.fromIdx
        let lastToIdx = lastCoinPair.fromIdx

        log('getCoinPairPrice. from='+from+', to='+to)

        fromIdx -= 1
        toIdx -= 1
        lastFromIdx -= 1
        lastToIdx -= 1

        if (fromIdx < 0 || isNaN(fromIdx)) {
            fromIdx = 0
        }

        if (toIdx < 0 || isNaN(toIdx)) {
            toIdx = 0
        }
        
        const inputWraps = elmsByCls('md-input-wrap')
        const fromInput = inputWraps[0].querySelector('input')
        const toInput = inputWraps[1].querySelector('input')
        
        if (lastCoinPair.from != from || lastFromIdx != fromIdx) {
            await selectFrom(from, fromIdx)
            await waitForPriceLoading()
        }

        if (lastCoinPair.to != to || lastToIdx != toIdx) {
            await selectTo(to, toIdx)
            await waitForPriceLoading()
        }

        let oldValue = toInput.value
        await setInputValue(fromInput, 1.001)
        await waitForPriceLoading()

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
            await waitForPriceLoading()

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
        await selectCoinInMenu(btnFrom, from, idx)
    }

    async function selectTo(to, idx) {
        const btnTo = elmsByCls('ic-token-symbol')[1]
        await selectCoinInMenu(btnTo, to, idx)
    }

    function sleep(ms) {
        return new Promise((resolve) =>
            setTimeout(resolve, ms)
        );
    }

    async function selectCoinInMenu(btn, coin, idx) {
        await waitForSelectCoinMenuIsVisible(btn)
        await uncheckDepositedAsset()

        const searchBar = elmByCls('support-token-search').querySelector('input')
        setInputValue(searchBar, coin)
        await sleep(100)
        //log('idx='+idx)
        //log(elmsByCls('list-row'))
        document.querySelectorAll('.list-row')[idx].click()

        while (true) {
            if (isCoinSelectMenuGone()) {
                break
            }
            await sleep(100)
            tryCloseWarningModal()
        }
        
        //log('done')

        async function uncheckDepositedAsset() {
            if (null == document.querySelector('.asset-checkbox-filter--checked')) {
                return
            }

            document.querySelector('.asset-checkbox-filter').click()
            while (true) {
                if (null == document.querySelector('.asset-checkbox-filter--checked')) {
                    return
                }   

                await sleep(100)
            }
        }

        async function waitForSelectCoinMenuIsVisible(btn) {
            const WAIT_DELAY_MILS = 100
            
            let remainTryBtnClickMils = 0
            while (true) {
                await sleep(WAIT_DELAY_MILS)

                if (0 == remainTryBtnClickMils) {
                    btn.click()
                    remainTryBtnClickMils = 500
                }
                if (1 == elmsByCls('gen-modal gen-full-modal select-token-modal').length) {
                    break
                }
                
                remainTryBtnClickMils -= WAIT_DELAY_MILS
            }
        }

        function isCoinSelectMenuGone() {
            return 0 == elmsByCls('gen-modal gen-full-modal select-token-modal').length
        }
    }

    async function waitForPriceLoading() {
        while (true) {
            await sleep(100)
            if (null == document.querySelector('.common-circle-progress .loader')) {
                break
            }
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
        alert.querySelector('#gamdoriAlertClose').click()
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

    function log(...args) {
        if (false == dev) {
            return
        }
        console.log(...args)
    }
}

init()