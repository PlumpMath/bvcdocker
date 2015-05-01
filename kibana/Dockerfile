FROM ubuntu:latest
MAINTAINER Gary Berger "gberger@brocade.com"

ENV KIBANA kibana-4.0.2-linux-x64
RUN apt-get -y  install wget
RUN apt-get update 
RUN wget -nv https://download.elastic.co/kibana/kibana/${KIBANA}.tar.gz
RUN tar -xf ${KIBANA}.tar.gz -C /opt
RUN ln -fs /opt/${KIBANA} /opt/kibana

#ADD kibana.yml /opt/kibana-4.0.2-linux-x64/config/kibana.yml
ADD startkibana.sh /opt/kibana/bin/startkibana.sh
RUN chmod u+x /opt/kibana/bin/startkibana.sh




