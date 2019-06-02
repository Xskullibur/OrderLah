/**
 * Simple gradient profile generator by Zi Heng
 */
const tinygradient = require('tinygradient')
const Jimp = require('jimp')
const scan = require('@jimp/utils').scan

const size = 350

module.exports.genProfileImage = (char) => {
    let promise = new Promise(function(resolve, reject) {
        const gradient = tinygradient([
            {color: {h:(Math.random() * 361), s:(Math.random() * 101), v:(Math.random() * 51) + 50 }, pos: 0},
            {color: {h:(Math.random() * 361), s:(Math.random() * 101), v:(Math.random() * 51) + 50 }, pos: 1},
          ]);
        
        const colorsRgb = gradient.rgb(size)
        let image = new Jimp(size,size, (err, image) => {
        })
        image = scan(image, 0, 0, image.bitmap.width, image.bitmap.height, function(
            x,
            y,
            index
        ) {
    
            let color = colorsRgb[Math.floor(x / image.bitmap.width * size)].toRgb()
    
            this.bitmap.data[index + 0] = color.r;
            this.bitmap.data[index + 1] = color.g;
            this.bitmap.data[index + 2] = color.b;
            this.bitmap.data[index + 3] = 255;
        });
        // image = image.blur(5)
        Jimp.loadFont(Jimp.FONT_SANS_128_BLACK).then(font => {
            let width = Jimp.measureText(font, char)
            let height = Jimp.measureTextHeight(font, char, width)
            image.print(font, size/2 - width/2, size/2 - height/2, char);
            resolve(image)
        })
    })
    
    return promise

}