FROM nginx:mainline-alpine-perl

RUN echo "ipv6" >> /etc/modules

RUN echo "http://dl-cdn.alpinelinux.org/alpine/v3.6/community" >> /etc/apk/repositories; \
    echo "http://dl-cdn.alpinelinux.org/alpine/v3.6/main" >> /etc/apk/repositories;

RUN echo "root:Docker!" | chpasswd \
    && echo "cd /home" >> /etc/bash.bashrc \
    && mkdir -p /var/www \
	&& chown -R nginx:nginx /var/www \	
	&& rm -rf /var/log/nginx \
    && mkdir -p /home/LogFiles \
	&& ln -s /home/LogFiles/nginx /var/log/nginx \
    && ln -s /home/site/wwwroot /var/www/ \
    && apk update --no-cache \
    && apk add openssh \
    && apk add openrc \
    && apk add vim \
    && apk add curl \
    && apk add wget \
    && apk add tcptraceroute \
    && apk add bash 

EXPOSE 2222 80

ENV WEBSITE_ROLE_INSTANCE_ID localRoleInstance
ENV WEBSITE_INSTANCE_ID localInstance
ENV PATH ${PATH}:/home/site/wwwroot

RUN  mkdir -p /usr/local/bin
COPY docker/init_container.sh /usr/local/bin/
COPY docker/sshd_config /etc/ssh/
COPY docker/nginx.conf /etc/nginx/nginx.conf
RUN chmod 755 /usr/local/bin/init_container.sh

WORKDIR /home/site/wwwroot
COPY ./dist ./
RUN mkdir /home/site/wwwroot/demo
COPY ./dist-demo ./demo/

ENTRYPOINT ["/usr/local/bin/init_container.sh"]