#!/bin/bash

# Install docker if missing
if ! which docker &>/dev/null ; then
	echo -e "\e[0;93m⚠️  Missing docker package. Installing...\e[0m"
	sudo apt-get update
	sudo apt-get install ca-certificates curl gnupg lsb-release -y
	sudo mkdir -p /etc/apt/keyrings
	curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
	echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
	sudo apt-get update
	sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y
	sudo groupadd docker
	sudo usermod -aG docker $USER
	sudo newgrp docker
fi

# Setup docker group if it is missing
if [ -z $DOCKER_GID ]; then
	echo -e "\e[0;93m⚠️ User not in docker group. Attempting to fix...\e[0m"
	sudo groupadd docker
	sudo usermod -aG docker $USER
	sudo newgrp docker
fi

sudo apt-get install qemu-user-static

echo "Setup done."