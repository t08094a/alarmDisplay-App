#!/usr/bin/env sh

set -e

unset IFS

CONFIG_FILE=$1

# bash is not available, so compgen is not available
#for var in $(compgen -e); do
for var in $(awk 'BEGIN{for(v in ENVIRON) print v}'); do
    sed -i 's~#{'"$var"'}~"'"${!var}"'"~g' "$CONFIG_FILE"
done

exec "$@"
