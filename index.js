const {
    createCanvas,
    loadImage
} = require('canvas')

const fs = require('fs')

const SRC = 'src'
const DIST = 'dist'
const SPRITENAME = 'SPRITE.png'




var srcSprite = false;

const imagePathMain = fs.readdirSync(`${DIST}`, (file) => {
    srcSprite = file ? true : false
    return file
})[0]

const imagesPaths = fs.readdirSync(SRC, (file) => {
    return file
})

if (srcSprite) {
    imagesPaths.unshift(imagePathMain)
}

let sizes = {
    w: 0,
    h: 0
}



// ctx.font = '30px Impact'
// ctx.rotate(0.1)
// ctx.fillText('Awesome!', 50, 100)

// var text = ctx.measureText('Awesome!')
// ctx.strokeStyle = 'rgba(0,0,0,0.5)'
// ctx.beginPath()
// ctx.lineTo(50, 102)
// ctx.lineTo(50 + text.width, 102)
// ctx.stroke()

const palette = new Uint8ClampedArray([
    //r    g    b    a
    0, 50, 50, 255, // index 1
    10, 90, 90, 255, // index 2
    127, 127, 255, 255
    // ...
])



let canvas, ctx

imagesPaths.forEach((path, i) => {
    let p = srcSprite ? `${DIST}/${path}` : `${SRC}/${path}`
    loadImage(p).then((img) => {
        sizes.w += img.width
        sizes.h += img.height
        if (i === imagesPaths.length - 1) {
            canvas = createCanvas(sizes.w, sizes.h)
            ctx = canvas.getContext('2d')
            createSprite()
        }
    })
})

const out = fs.createWriteStream(`${__dirname}/${DIST}/${SPRITENAME}`)
let cssTxt = ''

function createSprite(){
    const stream = canvas.createPNGStream({
        compressionLevel: 6,
        filters: canvas.PNG_ALL_FILTERS,
        palette: palette,
        backgroundIndex: 0,
        resolution: undefined
    })
    imagesPaths.forEach((path, i) => {
        let p = srcSprite ? `${DIST}/${path}` : `${SRC}/${path}`
        loadImage(p).then((img) => {
            let step = img.height * i
            ctx.drawImage(img, 0, step, img.width, img.height)
            let selector = path.split('.')[0]
            cssTxt += `.sprite_${selector}{\n background-position-x: ${step}px;\n}\n`
            if (i === imagesPaths.length - 1) {
                stream.pipe(out)
                fs.writeFileSync(`${DIST}/style.css`, cssTxt)
            }
        })
    })
}


out.on('finish', () => console.log('done'))