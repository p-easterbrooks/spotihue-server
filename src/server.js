// content of index.js
const http = require('http')
const port = 3000
const request = require('request')
const Poller = require('./Poller')
const ColorThief = require('@mariotacke/color-thief')
var Jimp = require('jimp')
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
        'Authorization': 'Bearer BQDFlRTc56s68lF7m5Zo9VRAldyMdXu55wdNNU5IxfjYR8rhc9ZUbLniT-BGEjOkfnTlh3WLV5WpZJ1SphnQvo9QP3slwMX9WmFv42MRiTpEhtDoTLqJFp107kE9D6it1EmBIoMQ4zS-NypJhErrCAMuIGM'
      }
    };
    request(options, doAction) 

    poller.poll(); // Go for the next poll
  });

  // Initial start
  poller.poll();
})

function doAction (error, response, body) {
  const data = JSON.parse(body)
  if (data.item.album.images[1].url !== imgUrl) {
    console.log('NEW IMAGE')
    imgUrl = data.item.album.images[1].url
    console.log(`imgUrl: ${imgUrl}`)

    //acquire image
    var thief = new ColorThief()
    Jimp.read(imgUrl)
      .then(image => {
        processColors(thief.getPalette(image))
      })
      .catch(err => {
        console.log(`Error getting image from Spotify: ${err}`)
      })
  }
}

function getCIEColor (color) {
    var r = color[0]
    var g = color[1]
    var b = color[2]

    return rgb_to_cie(r, g, b)
}

function processColors(palette) {
  var primaryColor = palette[0]
  var secondaryColor = palette[1]

  var lampCIEColor = getCIEColor(primaryColor)

  //set color on ambiance light
  //setLamp(lampCIEColor[0], lampCIEColor[1], 3)
}

function setLamp (x, y, lightNumber) {
  var myX = Number(x)
  var myY = Number(y)
  var hubIP = '192.168.1.219'
  var username = '974DELC9EApDxKHu3W5P2fjMCE7YWbrM2LmVRoJv'
  var URL = 'http://' + hubIP + '/api/' + username + '/lights/' + lightNumber + '/state'
  var dataObject = {'on': true, 'sat': 254, 'bri': 254, 'xy': [ myX, myY]}

  const options = {
    url: URL,
    json: true,
    body: JSON.stringify(dataObject)
  }

  request.put(options);
}
