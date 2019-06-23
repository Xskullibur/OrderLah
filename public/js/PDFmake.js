var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
var imgFile = require('../img/logo.png')
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Functions

function calcDailyTotal(orders) {
  let sum = 0

  for (const order in orders.orders) {
    if (orders.orders.hasOwnProperty(order)) {
        const orderItem = orders.orders[order];
        
        for (const item in orderItem.menuItems) {
            if (orderItem.menuItems.hasOwnProperty(item)) {

                const menuItem = orderItem.menuItems[item];
                sum += menuItem.price * menuItem.orderItem.quantity
                
            }
        }

    }
  }

  return sum.toFixed(2)
}

function calcOrderTotal(order) {
  let sum = 0;
  order.menuItems.forEach(order => {
      sum += order.price*order.orderItem.quantity
  });
  return sum.toFixed(2);
}

function getDataUri(url, callback) {
  var image = new Image();

  image.onload = function () {
      var canvas = document.createElement('canvas');
      canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
      canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

      canvas.getContext('2d').drawImage(this, 0, 0);

      // ... or get as Data URI
      callback(canvas.toDataURL('image/png'));
  };

  image.src = url;
}

// Get orderInfo
function orderInfo(formatedOrder) {

  let content = []

  formatedOrder.forEach(dayOrder => {

    let orders = dayOrder.orders

    // Init the body with header
    let body = [[ dayOrder.orderDate, `$${calcDailyTotal(dayOrder)}` ]]

    orders.forEach(orderItems => {

      // Declare Row
      let row = []

      // First Item of row (Order ID && Order Items)
      let stack = [] 

      stack.push(`Order No: ${orderItems.id}`)
      
      let menuItems = orderItems.menuItems

      let list = []

      menuItems.forEach(menuItem => {

        list.push(`${menuItem.itemName} x${menuItem.orderItem.quantity} @ ${menuItem.price}`)

      });

      let items = {ul: list}

      stack.push(items)

      row.push({stack, margin: [20, 0, 0, 0]})                                       // Add Order Info into row
      row.push(`$${calcOrderTotal(orderItems)}`)            // Add Order Total Amount into row

      body.push(row)
    });

    content.push({
        style: 'normalTable',
        layout: 'lightHorizontalLines', // optional
        table: {
          // headers are automatically repeated if the table spans over multiple pages
          // you can declare how many rows should be treated as headers
          headerRows: 1,
          widths: [ '*', 'auto' ],
  
          body
        }

    })

  })

  return content
}

function showPDF(formatedOrder, summaryDate, mode) {

    getDataUri('../../img/logo.png', function(dataUri) {

      let docDefinition = {
        
          info: {
            title: `${summaryDate} Order Summary`,
            author: 'john doe',
            subject: 'subject of document',
          },

          content: [

            {
              image: dataUri,
              fit: [100, 100],
              alignment: 'center'
            },

            // Title
            {
              text: `${summaryDate} Order Summary`,
              style: 'header',
              alignment: 'center'
            },
  
            orderInfo(formatedOrder),
  
          ],
  
          styles: {
            header: {
              fontSize: 18,
              margin: [0, 0, 0, 30],
              bold: true
            },
            subheader: {
              fontSize: 15,
              bold: true
            },
            quote: {
              italics: true
            },
            small: {
              fontSize: 8
            },
            normalTable: {
              margin: [0, 0, 0, 30]
            }
          }
  
          // header: function(currentPage, pageCount, pageSize) {
          //   // you can apply any logic and return any valid pdfmake element
        
          //   return [
          //     { text: `${summaryDate}`, alignment: (currentPage % 2) ? 'left' : 'right' },
          //     { canvas: [ { type: 'rect', x: 170, y: 32, w: pageSize.width - 170, h: 40 } ] }
          //   ]
          // },
          // footer: function(currentPage, pageCount) { return currentPage.toString() + ' of ' + pageCount; }
      }
  
      console.log(docDefinition);
  
      if (mode === 'show') {
        pdfMake.createPdf(docDefinition).open({}, window.open('', '_blank') );
      }
      else if (mode == 'print') {
        pdfMake.createPdf(docDefinition).print();
      }

    })

}