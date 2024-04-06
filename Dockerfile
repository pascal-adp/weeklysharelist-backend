FROM node:20-alpine as development

WORKDIR /usr/src/app

COPY package*.json

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine as build

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json

RUN npm ci
