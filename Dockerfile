#########################
### build environment ###
#########################

# use latest LTS version
FROM node:alpine as builder

WORKDIR /app

# make local @angular/cli binaries available
ENV PATH=${PATH}:./node_modules/@angular/cli/bin/

# install and cache app dependencies
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "yarn.lock", "./"]

RUN yarn install && yarn add @angular/cli --dev

# copy sources to app directory
COPY . .

RUN ng config -g cli.packageManager yarn

# build the angular app in production mode and store the artifacts in dist folder
RUN yarn build


##################
### production ###
##################
FROM nginx:alpine

# copy artifact build from the 'build environment'
COPY --from=builder /app/dist /usr/share/nginx/html

# expose port 80
EXPOSE 80

# run nginx
CMD ["nginx", "-g", "daemon off;"]
