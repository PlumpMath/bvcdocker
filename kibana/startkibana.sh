#!/bin/bash
# start kibana
/opt/kibana/bin/kibana -e "http://$ELASTICSEARCH_1_PORT_9200_TCP_ADDR:9200"


