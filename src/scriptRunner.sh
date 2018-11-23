#!/bin/bash
osascript createLog.applescript
export FLASK_APP=curlRequest.py
export FLASK_ENV=development
flask run
