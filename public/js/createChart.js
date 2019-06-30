var backgroundColor =  [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)'
]

window.onload = function() {
   showOrdersPerItem()
}

function showOrdersPerItem() {
    var OPIlabels = []
    var OPIdata = []
    OrdersPerItem.forEach(item => {
        OPIlabels.push(item.ItemName)
        OPIdata.push(item.NoOfOrders)
    });

    var ctx = document.getElementById('OrdersPerItem').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'pie',

        // The data for our dataset
        data: {
            labels: OPIlabels,
            datasets: [{
                label: 'My First dataset',
                backgroundColor,
                data: OPIdata
            }]
        },

        // Configuration options go here
        options: {}
    });
}