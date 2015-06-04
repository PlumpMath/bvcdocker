FROM ubuntu:latest
MAINTAINER Gary Berger "gberger@brocade.com"

RUN apt-get -y update && apt-get -y install curl
#ADD https://s3.amazonaws.com/influxdb/influxdb_latest_amd64.deb /influxdb_latest_amd64.deb
ADD http://get.influxdb.org/influxdb_0.8.8_amd64.deb /influxdb_0.8.8_amd64.deb
RUN dpkg -i /influxdb_0.8.8_amd64.deb
ADD startinfluxdb.sh /opt/startinfluxdb.sh
RUN chmod u+x /opt/startinfluxdb.sh
