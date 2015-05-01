FROM ubuntu:latest
MAINTAINER Gary Berger "gberger@brocade.com"

RUN apt-get autoclean $$ apt-get clear cache
RUN apt-get update
RUN apt-get clean
RUN apt-get -y upgrade
RUN apt-get --fix-missing install -y build-essential

ADD http://download.redis.io/releases/redis-3.0.0.tar.gz redis-3.0.0.tar.gz 
RUN mkdir -p /opt/monitor
RUN tar -zxvf redis-3.0.0.tar.gz -C /opt/monitor
WORKDIR /opt/monitor/redis-3.0.0
RUN make

WORKDIR /opt/monitor/redis-3.0.0/src





