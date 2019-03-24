#!/bin/bash

set -e

unset IFS

CONFIG_FILE=$1

echo "Updating \"${CONFIG_FILE}\" with current environment variables:"

for var in $(compgen -e); do
    echo "> replace ${var}    =>   ${!var} "
    sed -i 's~#{'"${var}"'}~'"${!var}"'~g' "$CONFIG_FILE"
done


echo ""
echo "Result:"
echo "======="
cat ${CONFIG_FILE}

echo ""
