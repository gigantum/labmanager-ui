# Labbook UI

This kit includes an app server, a GraphQL server implementing a tiny example schema, and a transpiler that you can use to get started building an app with Relay. For a walkthrough with a slightly larger schema, see the [Relay tutorial](https://facebook.github.io/relay/docs/tutorial.html).

## Installation

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
jest
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
