# AlarmDisplayApp

The web application should be displayed by a kiosk system and gets its alarm informations form project [t08094a/alarmdisplay-dataserver](https://github.com/t08094a/alarmDisplay-DataCenter)

The following architectures are supported:
* amd64
* arm64v8
* arm32v7

## Travis CI
Current build status: [![Build Status](https://travis-ci.org/t08094a/alarmDisplay-App.svg?branch=master)](https://travis-ci.org/t08094a/alarmDisplay-App)

Define following environment variables:
* DOCKER_USERNAME
* DOCKER_PASSWORD
* IMAGE_NAME
* REPO

## Generate Dockerfiles
``
make amd64   -> Dockerfile.amd64
make arm64v8 -> Dockerfile.arm64v8
make arm32v7 -> Dockerfile.arm32v7
``

## Development

### Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding
Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

### Running unit tests
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests
Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Install
"npm install" erzeugt eine package-lock.json Datei. Diese wird ins Docker Image kopiert.
