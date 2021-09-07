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