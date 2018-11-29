//imports
const http = require('http');
const port = 3000;
const request = require('request');
const Poller = require('./Poller');
const ColorThief = require('./color-thief');
const ColorConverter = require('./color-converter');
const chalk = require('chalk');
var Image = require('canvas').Image;

//global var
var imgUrl;

//TODO handle client requests
const requestHandler = (request, response) => {
    console.log(request.url);
    response.end();
}

//server
const server = http.createServer(requestHandler);

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad ${port} happened', err);
    }
    console.log(`server is listening on ${port}`);

    //new poller with 2 second timeout
    let poller = new Poller(2000);

    // Wait till the timeout sent our event to the EventEmitter
    poller.onPoll(() => {
        console.log('polling');

        const options = {
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer BQAOrniWskRJp2tRsE3JUjhpn1nP5loQKko3BLzhIkxYehq_NZaED_nG1TINryjsGwwl0RdGmRZ06UrzUewI7gK3eVaR_W7IRUAWeHDT7OAwWre5QnYTvtF3iA9llbsgUpFYLKFrxpaQF9yVdo4M_XAfgQE'
            }
        };
        request(options, doAction);

        poller.poll(); // Go for the next poll
    });

    // Initial start
    poller.poll();
})

function doAction(error, response, body) {
    const data = JSON.parse(body);
    if (data.item.album.images[1].url !== imgUrl) {
        console.log('NEW IMAGE');
        imgUrl = data.item.album.images[1].url;
        console.log(`imgUrl: ${imgUrl}`);
        getPaletteFromURL(imgUrl, processColors);
    }
}

function getPaletteFromURL(imageUrl, callback) {
        //create canvas and image
        var img = new Image();
        img.src = imageUrl;
        img.crossOrigin = 'Anonymous';

        img.onload = () => callback(new ColorThief().getPalette(img, 5, 5));
}

function processColors(palette) {
    var primaryColor = palette[0];
    var secondaryColor = palette[1];
    var tertiaryColor = palette[2];

    console.log(chalk.bold.rgb(primaryColor[0], primaryColor[1], primaryColor[2])('PRIMARY COLOR'));
    console.log(chalk.bold.rgb(secondaryColor[0], secondaryColor[1], secondaryColor[2])('SECONDARY COLOR'));
    console.log(chalk.bold.rgb(tertiaryColor[0], tertiaryColor[1], tertiaryColor[2])('TERTIARY COLOR'));

    var lampCIEColor = ColorConverter.rgb_to_cie(primaryColor[0], primaryColor[1], primaryColor[2]);

    //set color on ambiance light
    setLamp(lampCIEColor[0], lampCIEColor[1], 3);
}

function setLamp(x, y, lightNumber) {
    var myX = Number(x);
    var myY = Number(y);
    var hubIP = '192.168.1.219';
    var username = '974DELC9EApDxKHu3W5P2fjMCE7YWbrM2LmVRoJv';
    var URL = `http://${hubIP}/api/${username}/lights/${lightNumber}/state`;

    const options = {
        json: true,
        body:  { 'on': true, 'sat': 254, 'bri': 254, 'xy': [myX, myY] }
    }

    request.put(URL, options);
}
