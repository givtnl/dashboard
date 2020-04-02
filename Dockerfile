FROM givt/base-nginx-image

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
COPY ./example-give ./demo/give-with-givt-example/
