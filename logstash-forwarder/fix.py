#!/usr/bin/python
import os

ES = os.environ["BVC_ELASTICSEARCH_1_PORT_9200_TCP_ADDR"]


lsconf = """
input {{
  stdin {{
    type => "stdin-type"
  }}

  file {{
    type => "syslog"
    path => [ "/var/log/*.log", "/var/log/messages", "/var/log/syslog" ]
  }}

  file {{
    type => "logstash"
    path => [ "/var/log/logstash/logstash.log" ]
    start_position => "beginning"
  }}
}}

filter {{
  if [type] == "docker" {{
    json {{
      source => "message"
    }}
    }}
    mutate {{
      rename => [ "log", "message" ]
    }}
    }}
    date {{
      match => [ "time", "ISO8601" ]
    }}
    }}
  }}
}}

output {{
  stdout {{
    codec => rubydebug
  }}

  elasticsearch {{
    host => {ES_HOST}
    port => {ES_PORT}
    protocol => "http"
  }}
}}

"""


def main():
    with open('/etc/logstash.conf', 'w') as f:
        print(lsconf.format(ES_HOST=ES,  ES_PORT='9200'), f)


if __name__ == "__main__":
    main()
