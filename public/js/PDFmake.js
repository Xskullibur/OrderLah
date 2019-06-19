var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
var logo = require('/img/logo.png')
pdfMake.vfs = pdfFonts.pdfMake.vfs;

function showPDF(formatedOrder, summaryDate) {

    let docDefinition = {
        info: {
          title: `${summaryDate} Order Summary`,
          author: 'john doe',
          subject: 'subject of document',
        },
        header: function(currentPage, pageCount, pageSize) {
          // you can apply any logic and return any valid pdfmake element
      
          return [
            { image: 'logo.png' },
            { text: `${summaryDate}`, alignment: (currentPage % 2) ? 'left' : 'right' },
            { canvas: [ { type: 'rect', x: 170, y: 32, w: pageSize.width - 170, h: 40 } ] }
          ]
        },
        content:  formatedOrder.order,
        footer: function(currentPage, pageCount) { return currentPage.toString() + ' of ' + pageCount; }
    }
    
    pdfMake.createPdf(docDefinition).open({}, window.open('', '_blank') );
}