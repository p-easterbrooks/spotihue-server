var getJSON = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function() {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } 
    else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};

getJSON('http://127.0.0.1:5000/', getDominantColor);

function getDominantColor(err, data) {
  if (err !== null) {
    alert('Something went wrong: ' + err);
  } 
  else {
    var imgUrl = data.item.album.images[1].url;

    var color;
    getColorFromUrl(imgUrl, function(color) {
            var r = color[0];
            var g = color[1];
            var b = color[2];

            var colorX = rgb_to_cie(r, g, b)[0];
            var colorY = rgb_to_cie(r, g, b)[1];

            //set color on ambiance light
            setLamp(colorX, colorY, 3);
    });
  }  
}

function getColorFromUrl(imageUrl, callback) {
    sourceImage = document.createElement("img");
    sourceImage.crossOrigin = "Anonymous";
    var thief = new ColorThief;
    var dominantColor;
    sourceImage.src = imageUrl
    sourceImage.onload = function() {
      callback(thief.getPalette(sourceImage, 5, 5)[0]);
    };
}

function setLamp(x,y, lightNumber) {
  var myX = Number(x);
  var myY = Number(y);
  var hubIP = "192.168.1.219";
  var username = "974DELC9EApDxKHu3W5P2fjMCE7YWbrM2LmVRoJv";
  var URL = "http://" + hubIP + "/api/" + username + "/lights/" + lightNumber + "/state";
  var dataObject = {"on":true, "sat":254, "bri":254,"xy":[myX,myY]}

  $.ajax({
      url: URL,
      type: 'PUT',    
      data: JSON.stringify(dataObject),
      contentType: 'application/json',
  });
}