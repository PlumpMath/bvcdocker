FROM ubuntu:latest
MAINTAINER Gary Berger "gberger@brocade.com"
RUN apt-get -y update
RUN apt-get -y install curl unzip git zip npm python-pip htop
RUN curl -sL https://deb.nodesource.com/setup | sudo bash -
RUN apt-get install -y nodejs 
RUN npm update -g npm

ADD bin/bvc-core-odl-web-1.2.0.zip bvc-core-odl-web-1.2.0.zip
ADD bin/bvc-core-bvc-web-1.2.0.zip bvc-core-bvc-web-1.2.0.zip
ADD bin/bvc-app-vyatta-ems-web.zip bvc-app-vyatta-ems-web.zip
ADD bin/bvc-app-path-explorer-web.zip bvc-app-path-explorer-web.zip
RUN mkdir -p /opt/bvc/versions
RUN unzip bvc-core-odl-web-1.2.0.zip -d /opt/bvc
RUN unzip -uo bvc-core-bvc-web-1.2.0.zip -d /opt/bvc
RUN unzip -uo bvc-app-vyatta-ems-web.zip -d /opt/bvc
RUN unzip -uo bvc-app-path-explorer-web.zip -d /opt/bvc

#ADD config.json /opt/bvc/web/config.json
ADD fix.py fix.py
ADD startnode.sh /opt/bvc/startnode.sh
RUN chmod u+x /opt/bvc/startnode.sh
