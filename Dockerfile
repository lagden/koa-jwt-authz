FROM node:10.16-alpine
LABEL maintainer="test_docker@lagden.in"

ARG PORT=3000
ARG NODE_ENV=development
ARG HOME_DIR=/home/node

ENV NODE_ENV=$NODE_ENV
ENV PORT=$PORT
ENV HOME_DIR=$HOME_DIR
ENV BASE=$HOME_DIR/base

USER node
WORKDIR $HOME_DIR

RUN mkdir -p $BASE
COPY . $BASE

WORKDIR $BASE
RUN npm ci --ignore-scripts
