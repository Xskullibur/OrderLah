function updateUIStatus(orderID) {

    const STATUS = {
        OrderPending: 'Order Pending',
        PreparingOrder: 'Preparing Order',
        ReadyForCollection: 'Ready for Collection',
        CollectionConfirmed: 'Collection Confirmed'
    }

    let updateBtn = document.getElementById(`updateStatusBtn_${orderID}`)
    let currentStatus = document.getElementById(`currentStatusTxt_${orderID}`)
    let updateStatus = document.getElementById(`updateStatusTxt_${orderID}`)
    let orderCard = document.getElementById(`orderCard_${orderID}`)

    //Update Status
    switch (updateBtn.innerText) {

        case STATUS.PreparingOrder:
            currentStatus.innerHTML = STATUS.PreparingOrder
            updateStatus.innerHTML = STATUS.ReadyForCollection
            break

        case STATUS.ReadyForCollection:
            currentStatus.innerHTML = STATUS.ReadyForCollection
            updateStatus.innerHTML = STATUS.CollectionConfirmed
            break

        case STATUS.CollectionConfirmed:
            orderCard.parentNode.removeChild(orderCard)
            break

    }

}