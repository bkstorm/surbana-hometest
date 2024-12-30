<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">Surbana Homework</p>

## Description

A simple restful API system to allow users able to CRUD locations.

After running the project, you can access http://localhost:3000/api to get more details about all apis.

- Validation request: I use class-validator and class-transformer to validate requests.
- Loggin: I use Nestjs interceptor to build a logger to monitor request's performance.
- Handle exception: I use Nest.js Built-in HTTP Exceptions and default exception handler.

## Project setup

```bash
$ npm install

# Install Docker Desktop then run this command to initialize the databases
$ docker-compose up -d

# Migrate local database
$ npm run migrate:up

# Seed local database
$ npm run seed:up

# Migrate test database for e2e tests
$ npm run migrate:e2e-up
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# e2e tests
$ npm run test:e2e
```
