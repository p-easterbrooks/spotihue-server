// content of index.js
//imports
const http = require('http')
const port = 3000
const request = require('request')
const Poller = require('./Poller')
const ColorThief = require('./color-thief')
const ColorConverter = require('./color-converter')
var Canvas = require('canvas')
var fs = require('fs')
var Image = Canvas.Image

//global var
var imgUrl

const requestHandler = (request, response) => {
    console.log(request.url)
    response.end('Hello Node.js Server!')
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad ${port} happened', err)
    }
    console.log(`server is listening on ${port}`)

    //new poller with 2 second timeout
    let poller = new Poller(2000)

    // Wait till the timeout sent our event to the EventEmitter
    poller.onPoll(() => {
        console.log('polling');

        const options = {
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer BQB2neq-3i2JnPsJ8razKyPgfG47h-m9GEkt1v4WQA0WDmoCYtRKbYr-xD9k1FxNDusIEQxn0QnQIaq-sQs5ExldOmc8Fp93cVRYqdwhelY71O0BFoPw0MevdW8Rk66VNJrgCCJszkEyCYGod5QrV4LRNIU'
            }
        };
        request(options, doAction)

        poller.poll(); // Go for the next poll
    });

    // Initial start
    poller.poll();
})

function doAction(error, response, body) {
    const data = JSON.parse(body)
    if (data.item.album.images[1].url !== imgUrl) {
        console.log('NEW IMAGE')
        imgUrl = data.item.album.images[1].url
        console.log(`imgUrl: ${imgUrl}`)
        getPaletteFromURL(imgUrl, processColors)
    }
}

function getCIEColor(color) {
    var r = color[0]
    var g = color[1]
    var b = color[2]

    return rgb_to_cie(r, g, b)
}

function getPaletteFromURL(imageUrl, callback) {
        //create canvas and image
        var img = new Image()
        img.src = imageUrl
        img.crossOrigin = 'Anonymous'

        img.onload = function () {
            /*var canvas = new Canvas.Canvas(300, 300)
            var ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, 300, 300)
            var thief = new ColorThief()
            canvas.createJPEGStream().pipe(fs.createWriteStream('coverArt.jpeg'))*/
            callback(new ColorThief().getPalette(img, 5, 5))
        }
}

function processColors(palette) {
    var primaryColor = palette[0]
    var secondaryColor = palette[1]

    console.log(palette[0])
    var lampCIEColor = ColorConverter.rgb_to_cie(primaryColor[0], primaryColor[1], primaryColor[2])

    //set color on ambiance light
    //setLamp(lampCIEColor[0], lampCIEColor[1], 3)
}

function setLamp(x, y, lightNumber) {
    var myX = Number(x)
    var myY = Number(y)
    var hubIP = '192.168.1.219'
    var username = '974DELC9EApDxKHu3W5P2fjMCE7YWbrM2LmVRoJv'
    var URL = `http://${hubIP}/api/${username}/lights/${lightNumber}/state`
    var dataObject = { 'on': true, 'sat': 254, 'bri': 254, 'xy': [myX, myY] }

    const options = {
        url: URL,
        json: true,
        body: JSON.stringify(dataObject)
    }

    request.put(options);
}
