function init() {

    const btnSave = document.getElementById("btnSave")
    btnSave.addEventListener('click', save)
    btnAdd.addEventListener('click', addNewCoinPairInputs)

    const chkCloseWarningPopup = document.querySelector('#chkCloseWarningPopup')

    let coinPairs = {
        list:[],
        autoCloseWarningPopup: false
    }

    function load(data) {
        
        if ('undefined' == typeof data.coinPairs || 'undefined' == typeof data.coinPairs.list) {
            return
        }

        coinPairs = data.coinPairs

        for (const coinPair of coinPairs.list) {

            const inputs = addNewCoinPairInputs()
            const inputFrom = inputs[0]
            const inputFromIdx = inputs[1]
            const inputTo = inputs[2]
            const inputToIdx = inputs[3]

            inputFrom.value = coinPair.from
            inputFromIdx.value = coinPair.fromIdx
            inputTo.value = coinPair.to
            inputToIdx.value = coinPair.toIdx

            if (!inputFromIdx.value) {
                inputFromIdx.value = 1
            }

            if (!inputToIdx.value) {
                inputToIdx.value = 1
            }
        }

        chkCloseWarningPopup.checked = coinPairs.autoCloseWarningPopup
    }

    function save() {
        coinPairs.list = []
        
        const coinList = document.querySelectorAll("#coinPairs tbody tr")
        for (const child of coinList) {

            const inputs = child.querySelectorAll('input')
            const inputFrom = inputs[0]
            const inputFromIdx = inputs[1]
            const inputTo = inputs[2]
            const inputToIdx = inputs[3]

            const from = inputFrom.value
            const fromIdx = inputFromIdx.value
            const to = inputTo.value
            const toIdx = inputToIdx.value

            if ('' == from) {
                continue
            }

            if ('' == to) {
                continue
            }

            coinPairs.list.push({from, fromIdx, to, toIdx})

            // console.log(from + ', ' + to)
        }

        coinPairs.autoCloseWarningPopup = chkCloseWarningPopup.checked

        chrome.storage.sync.set({coinPairs})

        alert('옵션 저장 완료')
    }

    function addNewCoinPairInputs() {
        const coinList = document.querySelector("#coinPairs tbody")

        const wrap = document.createElement('tr')
        coinList.appendChild(wrap)

        wrap.insertAdjacentHTML('beforeend',
            '<td><input class="from"></td>' +
            '<td><input class="fromIdx" type="number" value="1"></td>' +
            '<td><input class="to"></td>' +
            '<td><input class="toIdx" type="number" value="1"></td>' +
            '<td><button class="close">x</button></td>')

        const fromInput = wrap.querySelector('.from')
        const fromIdxInput = wrap.querySelector('.fromIdx')
        const toInput = wrap.querySelector('.to')
        const toIdxInput = wrap.querySelector('.toIdx')
        const btnDelete = wrap.querySelector('.close')

        btnDelete.addEventListener('click', () => {
            coinList.removeChild(wrap)    
        })

        return [fromInput, fromIdxInput, toInput, toIdxInput]
    }

    chrome.storage.sync.get('coinPairs', load)
}

init()
