FROM node:14.16-alpine3.13

ARG NODE_ENV="production"
ARG BASE="/home/node"

ENV NODE_ENV=$NODE_ENV
ENV BASE=$BASE
ENV BASE_APP=$BASE/app

WORKDIR $BASE

ADD --chown=node:node . $BASE_APP

WORKDIR $BASE_APP

RUN npm ci --ignore-scripts

USER node
