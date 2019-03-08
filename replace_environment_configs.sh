#!/bin/bash

set -e

unset IFS

CONFIG_FILE=$1

for var in $(compgen -e); do
    sed -i 's/\#{'${var}'}/'${!var}'/g' "$CONFIG_FILE" 2>/dev/null
done
