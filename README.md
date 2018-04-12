# Labbook UI

This kit includes an app server, a GraphQL server implementing a tiny example schema, and a transpiler that you can use to get started building an app with Relay. For a walkthrough with a slightly larger schema, see the [Relay tutorial](https://facebook.github.io/relay/docs/tutorial.html).

## Installation

Install python 3
```
https://www.python.org/downloads/
```

Install Docker
```
https://docs.docker.com/install/
```

Install node v8.9.3 & npm v5.5.5

```
npm install
```

## Update Scehma

```
npm install -g graphql-cli
graphql init
```
Follow setup in the terminal.

```
npm run update-schema
```
## Compile Relay

To compile queries and mutations

```
npm run relay | yarn relay

```

## Running

Start a local server:

```
npm run start | yarn start
```


## Run Tests
Jest runs snapshot tests
```
npm run test || yarn test || jest
```

#### To run tests with proxy

Download (Charles)[https://www.charlesproxy.com/]

Setup reverse proxy in charles

Proxy > Reverse Proxy > Add
```
Local port: 10010
Remote host: localhost:10001
Remote port: 80
[x] Rewrite redirects
[ ] Preserve host in header fields
[ ] Listen on a specific address
```

Run tests with proxy
```
npm run test-proxy || yarn test-proxy
```


## Developing

Any changes you make to files in the `js/` directory will cause the server to
automatically rebuild the app and refresh your browser.

If at any time you make changes to `data/schema.js`, stop the server,
regenerate `data/schema.json`, and restart the server:

```
npm run update-schema
npm start
```
