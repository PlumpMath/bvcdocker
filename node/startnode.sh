#!/bin/bash
# start node
python fix.py /opt/bvc/web/config.json
nohup node /opt/bvc/web/server.js


