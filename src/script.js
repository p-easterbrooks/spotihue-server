var imgUrl

(function poll () {
    $.ajax({
        url: 'https://api.spotify.com/v1/me/player/currently-playing',
        beforeSend: function(request) {
            request.setRequestHeader('Authorization', 'Bearer BQA4eeLL2LLQNwACm2-hhEq4v3Ey9Pq9ZuSjUY_lGjuIoIsyXYj3ZhLCVGHBxbJoyMX6jnYPWKezhRfM_7rNbRPJJ_T81i2yQ2UIUv18n9uITY6m8NUoMaVgeBQ-S7Ljd_IicWSAM3O9hlKx-_nv2pmI89s')
        },
        type: 'GET',
        success: function (data) {
            console.log('polling')
            if (data.item.album.images[1].url !== imgUrl) {
                console.log('NEW IMAGE');
                imgUrl = data.item.album.images[1].url
                getColorFromUrl(imgUrl, function (color) {
                        var r = color[0]
                        var g = color[1]
                        var b = color[2]

                        var colorX = rgb_to_cie(r, g, b)[0]
                        var colorY = rgb_to_cie(r, g, b)[1]

                        //set color on ambiance light
                        setLamp(colorX, colorY, 3)
                        $('body').css('backgroundColor', 'rgb('+ r + ',' + g +',' + b + ')')
                        //document.body.style.backgroundColor = rgb(r, g, b)
                })
            }
        },
        dataType: 'json',
        complete: setTimeout(function () { poll() }, 5000),
        timeout: 2000
    })
})()

function getColorFromUrl (imageUrl, callback) {
    sourceImage = document.createElement('img')
    sourceImage.crossOrigin = 'Anonymous'
    var thief = new ColorThief()
    sourceImage.src = imageUrl
    sourceImage.onload = function () {
      callback(thief.getPalette(sourceImage, 5, 5)[0])
    };
}

function setLamp (x, y, lightNumber) {
  var myX = Number(x)
  var myY = Number(y)
  var hubIP = '192.168.1.219'
  var username = '974DELC9EApDxKHu3W5P2fjMCE7YWbrM2LmVRoJv'
  var URL = 'http://' + hubIP + '/api/' + username + '/lights/' + lightNumber + '/state'
  var dataObject = {'on': true, 'sat': 254, 'bri': 254, 'xy': [ myX, myY]}

  $.ajax({
      url: URL,
      type: 'PUT',
      data: JSON.stringify(dataObject),
      contentType: 'application/json'
  })
}
