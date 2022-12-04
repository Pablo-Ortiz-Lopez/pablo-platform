FROM node:16-bullseye

RUN apt-get update && \
    apt install unzip curl sudo rsync -y
    
RUN curl -fsSL https://get.docker.com -o get-docker.sh && \
    sh get-docker.sh && \
    rm -f get-docker.sh

RUN os=$(uname -s | tr '[:upper:]' '[:lower:]') && \
    arch=$(uname -m | sed "s/armv7l/armv7/" | sed "s/armv6l/armv6/")  && \
    curl -SL https://github.com/docker/compose/releases/download/v2.11.1/docker-compose-$os-$arch -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose

ENV TZ="Europe/Madrid"

RUN echo $TZ > /etc/timezone && \
    apt-get update && apt-get install -y tzdata && \
    rm /etc/localtime && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata && \
    apt-get clean

RUN usermod -aG sudo node

RUN echo 'node ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

USER node

RUN npm config set update-notifier false

COPY --chown=node ./cli /cli

RUN cd /cli && yarn

WORKDIR /project

ENTRYPOINT ["/cli/bash/entrypoint.sh"] 