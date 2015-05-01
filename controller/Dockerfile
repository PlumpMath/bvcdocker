FROM ubuntu:14.04 
MAINTAINER Gary Berger "gberger@brocade.com"

ENV JAVA_HOME /usr
ENV JAVA_OPTS -Xmx3g
RUN apt-get install -y software-properties-common
RUN add-apt-repository ppa:webupd8team/java
RUN apt-get -y install wget
RUN echo oracle-java7-installer shared/accepted-oracle-license-v1-1 select true | /usr/bin/debconf-set-selections
RUN apt-get update
RUN apt-get -y  install --no-install-recommends oracle-java7-installer oracle-java7-set-default maven python-pip 

ADD bvc-1.2.0.zip bvc-1.2.0.zip 
ADD bvc-dependencies-1.2.0.zip bvc-dependencies-1.2.0.zip
RUN unzip bvc-1.2.0.zip -d /opt
RUN unzip bvc-dependencies-1.2.0.zip -d /opt
ADD installer/.lib /opt/bvc/.lib/
ADD installer/install /opt/bvc/install
WORKDIR /opt/bvc/
RUN /opt/bvc/install -i

ADD start /opt/bvc/controller/bin/start
RUN chmod u+x /opt/bvc/controller/bin/start

RUN sed -i "s|log4j.appender.out.file=\${karaf.data}/log/karaf.log|log4j.appender.out.file=/bvc/logs/karaf.log|" /opt/bvc/controller/etc/org.ops4j.pax.logging.cfg
ADD org.ops4j.pax.logging.cfg /opt/bvc/controller/etc/org.ops4j.pax.logging.cfg




