function init() {

    const btnSave = document.getElementById("btnSave")
    btnSave.addEventListener('click', () => {

        const coinPairs = {list:[]}
        
        const coinList = document.getElementById("coinPairs")
        for (const child of coinList.children) {

            const inputs = child.getElementsByTagName('input')
            const inputFrom = inputs[0]
            const inputTo = inputs[1]

            const from = inputFrom.value
            const to = inputTo.value

            coinPairs.list.push({from, to})

            console.log(from + ', ' + to)
        }

        chrome.storage.sync.set({coinPairs})

        alert('옵션 저장 완료')
    })

    btnAdd.addEventListener('click', addNewCoinPairInputs)

    chrome.storage.sync.get('coinPairs', data => {
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
            const inputTo = inputs[1]

            inputFrom.value = coinPair.from
            inputTo.value = coinPair.to
        }

    })

    function addNewCoinPairInputs() {
        const coinList = document.getElementById("coinPairs")

        const wrap = document.createElement('div')
        coinList.appendChild(wrap)

        const fromInput = document.createElement('input')
        const toInput = document.createElement('input')

        wrap.appendChild(fromInput)
        wrap.appendChild(toInput)

        const btnDelete = document.createElement('button')
        btnDelete.textContent = 'x'
        btnDelete.addEventListener('click', () => {
            coinList.removeChild(wrap)    
        })
        wrap.appendChild(btnDelete)

        return [fromInput, toInput]
    }
}

init()
