FROM ubuntu:latest
MAINTAINER Gary Berger "gberger@brocade.com"

RUN apt-get -y update
RUN apt-get -y install curl gcc git golang
RUN curl -sL https://deb.nodesource.com/setup | sudo bash -
RUN apt-get install -y nodejs 
RUN npm update -g npm

RUN mkdir -p /opt/bvc
ENV GOPATH /opt/bvc
RUN cd $GOPATH && go get github.com/grafana/grafana
RUN cd $GOPATH/src/github.com/grafana/grafana && go run build.go setup
RUN godep restore 
RUN go build .

#RUN apt-get install -y apt-transport-https
#RUN apt-get -y update & apt-get -y install wget
#RUN echo "deb https://packagecloud.io/grafana/stable/debian/ wheezy main" >> /etc/apt/sources.list
#RUN curl https://packagecloud.io/gpg.key | sudo apt-key add -
#RUN apt-get update
#RUN apt-get install grafana

#RUN wget https://grafanarel.s3.amazonaws.com/builds/grafana_2.0.2_amd64.deb
#RUN apt-get install -y adduser libfontconfig
#RUN dpkg -i grafana_2.0.2_amd64.deb




