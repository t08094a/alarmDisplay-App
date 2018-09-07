#########################
### build environment ###
#########################

# use latest LTS version
FROM node:alpine as builder

WORKDIR /app

# install and cache app dependencies
COPY package.json yarn.lock /app/
RUN yarn install

# copy sources to app directory
COPY . /app

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
