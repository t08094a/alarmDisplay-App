#!/bin/bash

set -e

# replace templates
/replace_environment_configs.sh /usr/share/nginx/html/assets/app-config.json

# run nginx
nginx -g 'daemon off;'
