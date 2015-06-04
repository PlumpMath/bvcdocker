#!/bin/bash
#/usr/bin/influxdb -config=/bvc/configs/influxdb/config1.toml
#sleep 30
curl -X POST 'http://192.168.59.103:8086/db?u=root&p=root' -d '{"name": "cadvisor"}'
curl -X POST 'http://192.168.59.103:8086/db?u=root&p=root' -d '{"name": "logstash"}'
curl -X POST 'http://192.168.59.103:8086/db/cadvisor/users?u=root&p=root' -d '{"name": "user", "password": "cadvisor"}'
curl -X POST 'http://192.168.59.103:8086/db/logstash/users?u=root&p=root' -d '{"name": "user", "password": "logstash"}'
tail -f /usr/bin/nohup.out