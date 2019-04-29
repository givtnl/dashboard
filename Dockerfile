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
RUN mkdir ./demo \
    && mkdir ./demo/give-with-givt-example \
    && mkdir ./img-givy-secret \
    && mkdir ./app \
    && mkdir ./store \
    && mkdir ./hockey \
    && mkdir ./hockey-pre \
    && mkdir ./native \
    && mkdir ./natived \
    && mkdir ./nativep \
    && mkdir ./nativee
COPY docker/for-apple/index.html ./app/
COPY docker/for-apple/index.html ./store/
COPY docker/for-apple/index.html ./hockey/
COPY docker/for-apple/index.html ./hockey-pre/
COPY docker/for-apple/index.html ./native/
COPY docker/for-apple/index.html ./natived/
COPY docker/for-apple/index.html ./nativep/
COPY docker/for-apple/index.html ./nativee/
COPY docker/for-apple/apple-app-site-association ./
COPY docker/img-givy-secret ./img-givy-secret/

COPY ./dist-demo ./demo/
COPY ./dist-example-give ./demo/give-with-givt-example/

ENTRYPOINT ["/usr/local/bin/init_container.sh"]