import requests
import json
from flask import Flask
from flask_cors import CORS
app = Flask(__name__)
CORS(app)


headers = {
	'Authorization': 'Bearer BQDw10_3p9DjgSThBTFDnGOg1hUROPixSl-9r3GIrtrEyBx_i-dG2yfGYkB-HGYDm2ff1TTxnykJaAAARS8ya6oeLXDATYJIbyIlubCYyFhZH_iutIGaGuM4DF08ws6LlUJxVs7keYE13kVO_9V6EsNRRhY',
}

#f = open("songIdLog.txt", "r")
#spotify,track,mySong=str.split(f.read().strip()	, ':')
#f.close()

# use player to retrieve song
response = requests.get("https://api.spotify.com/v1/me/player/currently-playing", headers=headers)

# print(response.text)

@app.route('/')
def index():
	return response.text