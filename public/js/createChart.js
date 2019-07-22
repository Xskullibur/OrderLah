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
   showAverageRating()
   showEachItemRating()
}

function showOrdersPerItem() {
    if (OrdersPerItem) {
        
        var labels = []
        var data = []
        OrdersPerItem.forEach(item => {
            labels.push(item.ItemName)
            data.push(item.NoOfOrders)
        });
    
        var ctx = document.getElementById('OrdersPerItem').getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'pie',
    
            // The data for our dataset
            data: {
                labels: labels,
                datasets: [{
                    label: 'Orders Per Item',
                    backgroundColor,
                    data: data
                }]
            },
    
            // Configuration options go here
            options: {
                legend: { position: 'bottom'},
            }
        });

    }
}

function showAverageRating() {
    var labels = []
    var data = []

    AvgRatingPerItem.forEach(item => {
        labels.push(item.itemName)
        data.push(item.average)
    });

    var ctx = document.getElementById('ARPI').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'bar',

        // The data for our dataset
        data: {
            datasets: [{
                label: '# of Votes',
                data: data,
                backgroundColor,
                borderWidth: 1
            }],
            labels: labels,
        },

        // Configuration options go here
        options: {
            scaleShowValues: true,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }], 
                xAxes: [{
                ticks: {
                    autoSkip: false
                }
              }]
            },
            legend: { display: false },
        }
    });
}

function showEachItemRating() {
    EachItemRating.forEach(itemRating => {
        
        var labels = []
        var data = []

        var ratings = itemRating.rating

        ratings.forEach(item => {
            labels.push(item.label)
            data.push(item.count)
        });

        var ctx = document.getElementById(`Rating_${itemRating.id}`).getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'pie',
    
            // The data for our dataset
            data: {
                labels,
                datasets: [{
                    label: itemRating.itemName,
                    backgroundColor,
                    data: data
                }]
            },
    
            // Configuration options go here
            options: {
                legend: { position: 'bottom'},
            }
        });

    });

}