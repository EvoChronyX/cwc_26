#!/bin/bash

SOURCE="/home/oopsb27/Desktop/xclip.txt"
PASSWORD="ssn"

if [ ! -f "$SOURCE" ]; then
    echo "Error: $SOURCE does not exist."
    exit 1
fi

for i in $(seq 1 40); do
    IP="10.6.6.$i"
    USERNAME="mtech$i"

    echo "Copying script to $USERNAME@$IP..."

    sshpass -p "$PASSWORD" scp \
        -o ConnectTimeout=3 \
        -o StrictHostKeyChecking=no \
        "$SOURCE" \
        "$USERNAME@$IP:/home/$USERNAME/Desktop/"

    if [ $? -eq 0 ]; then
        echo "SUCCESS: $USERNAME@$IP"
    else
        echo "FAILED: $USERNAME@$IP"
    fi
done

