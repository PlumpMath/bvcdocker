FROM ubuntu:latest
MAINTAINER Gary Berger "gberger@brocade.com"
ENV LS logstash-1.4.2

RUN apt-get update 
RUN apt-get -y install wget python
RUN apt-get install -y software-properties-common
RUN add-apt-repository ppa:webupd8team/java
RUN echo oracle-java7-installer shared/accepted-oracle-license-v1-1 select true | /usr/bin/debconf-set-selections
RUN apt-get update
RUN apt-get -y  install --no-install-recommends oracle-java7-installer oracle-java7-set-default

RUN wget -nv https://download.elastic.co/logstash/logstash/${LS}.tar.gz

RUN tar -xf ${LS}.tar.gz -C /opt
RUN ln -fs /opt/${LS} /opt/logstash

RUN /opt/logstash/bin/plugin install contrib
#RUN /opt/logstash/bin/plugin install logstash-input-jmx --no-verify








