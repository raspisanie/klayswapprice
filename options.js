function init() {

    $("#btnSave").on('click', save)
    $("#btnAdd").on('click', addNewCoinPairInputs)

    const chkCloseWarningPopup = $('#chkCloseWarningPopup')
    const bookmarkHotkeyInputs = $('.set-hotkey-item input')

    initSetBookmarks()

    let coinPairs = {
        list: [],
        autoCloseWarningPopup: false,
        bookmarkHotkeys: []
    }

    function initSetBookmarks() {

        const bookmarkIcons = $('.hotkey-icon')
        for (const i in Bookmarks.list) {
            const item = Bookmarks.list[i]

            for (const css of item.cssList) {
                
                for (const property in css) {
                    
                    let style = css[property]
                    if (style.includes('!important')) {
                        style = style.replace(' !important', '')
                        bookmarkIcons[i].style.setProperty(property, style, 'important') 
                    } else {
                        bookmarkIcons[i].style.setProperty(property, style) 
                    }
                    
                }
            }
        }
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

            inputFrom.val(coinPair.from)
            inputFromIdx.val(coinPair.fromIdx)
            inputTo.val(coinPair.to)
            inputToIdx.val(coinPair.toIdx)

            if (!inputFromIdx.val()) {
                inputFromIdx.val(1)
            }

            if (!inputToIdx.val()) {
                inputToIdx.val(1)
            }
        }

        chkCloseWarningPopup[0].checked = coinPairs.autoCloseWarningPopup

        for (let i = 0; i < bookmarkHotkeyInputs.length; ++i) {
            bookmarkHotkeyInputs[i].value = parseInt(i) + 1
        }
        bookmarkHotkeyInputs[9].value = 0

        if (coinPairs.bookmarkHotkeys) {
            for (const hotkey of coinPairs.bookmarkHotkeys) {
                const bookmarkInfo = Bookmarks.list.find(item => item.name == hotkey.name)
                const idx = Bookmarks.list.indexOf(bookmarkInfo)
                bookmarkHotkeyInputs[idx].value = hotkey.key
            }
        }

        checkSameHotkeys()
        for (const bookmarkHotkey of bookmarkHotkeyInputs) {

            $(bookmarkHotkey).on("keyup paste click change", (e) => {
                checkSameHotkeys()
            })

        }
    }

    function checkSameHotkeys() {

        for (const bookmarkHotkey of bookmarkHotkeyInputs) {
            $(bookmarkHotkey).removeClass('conflict-hotkey')
        }

        for (let i = 0; i < bookmarkHotkeyInputs.length - 1; ++i) {
            const input1 = bookmarkHotkeyInputs[i]

            for (let j = i + 1; j < bookmarkHotkeyInputs.length; ++j) {
                const input2 = bookmarkHotkeyInputs[j]
                if (input1.value == input2.value) {
                    $(input1).addClass('conflict-hotkey')
                    $(input2).addClass('conflict-hotkey')
                    break
                }
            }
        }

    }

    function save() {
        coinPairs.list = []
        coinPairs.bookmarkHotkeys = []

        for (const tr of $("#coinPairs tbody tr")) {
            const inputs = $(tr).find('input')
            const inputFrom = inputs.eq(0)
            const inputFromIdx = inputs.eq(1)
            const inputTo = inputs.eq(2)
            const inputToIdx = inputs.eq(3)

            const from = inputFrom.val()
            const fromIdx = inputFromIdx.val()
            const to = inputTo.val()
            const toIdx = inputToIdx.val()

            if ('' == from) {
                continue
            }

            if ('' == to) {
                continue
            }

            coinPairs.list.push({ from, fromIdx, to, toIdx })

            // console.log(from + ', ' + to)
        }

        coinPairs.autoCloseWarningPopup = chkCloseWarningPopup[0].checked

        for (let i = 0; i < bookmarkHotkeyInputs.length; ++i) {
            const hotkeyInput = bookmarkHotkeyInputs[i]
            const name = Bookmarks.list[i].name
            const key = parseInt(hotkeyInput.value)

            coinPairs.bookmarkHotkeys.push({name, key})
        }
        // coinPairs.bookmarkHotkeys = 

        //console.log(coinPairs)
        chrome.storage.sync.set({ coinPairs })
        $('button').removeClass('lastClickedUpDown')

        alert('옵션 저장 완료')
    }

    let animatingUpDown = false
    function addNewCoinPairInputs() {
        const coinList = $("#coinPairs tbody")

        const wrap = $(document.createElement('tr'))
        coinList.append(wrap)

        wrap.append(
            '<td><button class="itemDown">▼</button></td>' +
            '<td><button class="itemUp">▲</button></td>' +
            '<td><input class="from"></td>' +
            '<td><input class="fromIdx" type="number" value="1"></td>' +
            '<td><input class="to"></td>' +
            '<td><input class="toIdx" type="number" value="1"></td>' +
            '<td><button class="delete">x</button></td>')

        const btnMoveDown = wrap.find('.itemDown')
        const btnMoveUp = wrap.find('.itemUp')
        const fromInput = wrap.find('.from')
        const fromIdxInput = wrap.find('.fromIdx')
        const toInput = wrap.find('.to')
        const toIdxInput = wrap.find('.toIdx')
        const btnDelete = wrap.find('.delete')

        btnMoveDown.on('click', () => {

            const next = wrap.next()
            if (0 == next.length) {
                return
            }

            if (animatingUpDown) {
                return
            }

            const clicked = wrap
            const distance = $(clicked).outerHeight()

            coinList.find('button').removeClass('lastClickedUpDown')
            btnMoveDown.addClass('lastClickedUpDown')

            animatingUpDown = true
            $.when(
                clicked.animate({top: distance}, 100),
                next.animate({top: -distance}, 100)
            ).done(() => {
                next.css('top', '0px')
                clicked.css('top', '0px')
                next.insertBefore(clicked)
                animatingUpDown = false
            })

        })

        btnMoveUp.on('click', () => {

            const prev = wrap.prev()
            if (0 == prev.length) {
                return
            }

            if (animatingUpDown) {
                return
            }

            const clicked = wrap
            const distance = $(clicked).outerHeight()

            coinList.find('button').removeClass('lastClickedUpDown')
            btnMoveUp.addClass('lastClickedUpDown')

            animatingUpDown = true
            $.when(
                clicked.animate({top: -distance}, 100),
                prev.animate({top: distance}, 100)
            ).done(() => {
                prev.css('top', '0px')
                clicked.css('top', '0px')
                clicked.insertBefore(prev)
                animatingUpDown = false
            })
        })

        btnDelete.on('click', () => {
            wrap.remove()
        })

        return [fromInput, fromIdxInput, toInput, toIdxInput]
    }

    chrome.storage.sync.get('coinPairs', load)
}

init()