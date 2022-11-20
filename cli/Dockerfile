FROM node:16-bullseye

# Fix Buildkit
ARG TARGETPLATFORM
RUN if [ "$TARGETPLATFORM" = "linux/arm/v7" ];then \
    ln -s /usr/local/bin/node /usr/local/sbin/node; \
    ln -s /usr/bin/dpkg-split /usr/sbin/dpkg-split; \
    ln -s /usr/bin/dpkg-deb /usr/sbin/dpkg-deb; \
    ln -s /bin/rm /usr/sbin/rm; \
    ln -s /bin/tar /usr/sbin/tar; \
fi

RUN apt-get update && \
    apt install unzip curl sudo -y

RUN curl -fsSL https://get.docker.com -o get-docker.sh && \
    sh get-docker.sh && \
    rm -f get-docker.sh

RUN os=$(uname -s | tr '[:upper:]' '[:lower:]') && \
    arch=$(uname -m | sed "s/armv7l/armv7/" | sed "s/armv6l/armv6/")  && \
    curl -SL https://github.com/docker/compose/releases/download/v2.11.1/docker-compose-$os-$arch -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose

RUN usermod -aG sudo node

RUN echo 'node ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

USER node

RUN npm config set update-notifier false

COPY . /platform/cli

ENTRYPOINT ["/platform/cli/entrypoint.sh"] 