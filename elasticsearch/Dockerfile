FROM ubuntu:latest
MAINTAINER Gary Berger "gberger@brocade.com"

RUN apt-get install -y software-properties-common
RUN add-apt-repository ppa:webupd8team/java
RUN apt-get -y  install wget

RUN echo oracle-java7-installer shared/accepted-oracle-license-v1-1 select true | /usr/bin/debconf-set-selections
RUN apt-get update
RUN apt-get -y  install --no-install-recommends oracle-java7-installer oracle-java7-set-default maven

RUN wget https://download.elastic.co/elasticsearch/elasticsearch/elasticsearch-1.5.2.tar.gz
RUN tar -xvf elasticsearch-1.5.2.tar.gz -C /opt
RUN ln -fs /opt/elasticsearch-1.5.2 /opt/elasticsearch


