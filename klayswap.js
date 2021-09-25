readyAlert()
setInterval(() => {
    tryCloseWarningModal()
}, 100)

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

function readyAlert() {
    document.body.insertAdjacentHTML('beforeend', '<div id="gamdoriAlert"> <div class="alertMsg">some message<br/>some message2</div> <button id="gamdoriAlertClose">x</button> </div>')
    const alert = document.querySelector('#gamdoriAlert')
    alert.style.visibility = 'hidden'

    const btnClose = alert.querySelector('button')
    btnClose.addEventListener('click', () => {
        alert.style.visibility = 'hidden'
    })
}