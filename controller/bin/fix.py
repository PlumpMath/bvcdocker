#!/usr/bin/python
import json
import sys
import os

ADDRSTRING = os.environ["DOCKER_HOST"]
s = ADDRSTRING.split("//")
t = s[1].split(":")
CTRL_ADDR = t[0]

with open(sys.argv[1], 'r+') as j:
    data = json.load(j)
    data['default']['baseURL'] = "http://" + CTRL_ADDR + ":"
    j.seek(0)
    json.dump(data, j)
    j.truncate()
