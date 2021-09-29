function init() {

    const btnSave = document.getElementById("btnSave")
    btnSave.addEventListener('click', save)
    btnAdd.addEventListener('click', addNewCoinPairInputs)

    chrome.storage.sync.get('coinPairs', load)

    function load(data) {
        const coinPairs = data.coinPairs
        // console.log(coinPairs.list)

        if ('undefined' == typeof coinPairs) {
            return
        }

        if ('undefined' == typeof coinPairs.list) {
            return
        }

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
    }

    function save() {
        const coinPairs = {list:[]}
        
        const coinList = document.querySelector("#coinPairs")
        for (const child of coinList.children) {

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

        chrome.storage.sync.set({coinPairs})

        alert('옵션 저장 완료')
    }

    function addNewCoinPairInputs() {
        const coinList = document.querySelector("#coinPairs")

        const wrap = document.createElement('div')
        coinList.appendChild(wrap)

        wrap.insertAdjacentHTML('beforeend',
            '<input class="from"><input class="fromIdx" type="number"><input class="to"><input class="toIdx" type="number"><button class="close">x</button>')

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
}

init()
