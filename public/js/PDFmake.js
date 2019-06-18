var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
pdfMake.vfs = pdfFonts.pdfMake.vfs;

function showPDF() {

    let docDefinition = {
        info: {
          title: 'awesome Document',
          author: 'john doe',
          subject: 'subject of document',
          keywords: 'keywords for document',
        },
        content:  'This is an sample PDF printed with pdfMake'
    }
    
    pdfMake.createPdf(docDefinition).open({}, window.open('', '_blank') );
}