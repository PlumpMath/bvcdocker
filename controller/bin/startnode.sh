#!/bin/bash
# start node
python fix.py /opt/bvc/web/config.json
cd /opt/bvc/web
nohup node server.js >/bvc/system/logs/node.log 2>&1


