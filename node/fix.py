#!/usr/bin/python
import json
import sys
import os

CTRL_ADDR = os.environ["BVC_CONTROLLER_1_PORT_8181_TCP_ADDR"]

with open(sys.argv[1], 'r+') as j:
    data = json.load(j)
    data['default']['baseURL'] = "http://" + CTRL_ADDR
    j.seek(0)
    json.dump(data, j)
    j.truncate()
