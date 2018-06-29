# Labbook UI

This kit includes an app server, a GraphQL server implementing a tiny example
schema, and a transpiler that you can use to get started building an app with
Relay. For a walkthrough with a slightly larger schema, see the [Relay
tutorial](https://facebook.github.io/relay/docs/tutorial.html).

During development, this repository will generally be checked out as a
submodule of [gtm](https://github.com/gigantum/gtm). High-level instructions
are available in that repository. If working only on the labmanager-ui
codebase, the development environment can be configured for frontend
development only by answering 'n' to the question about BACKEND development.

## Installation

1. Install Python 3

   OSX
   ```
   $ brew install python3
   ```

   Windows
   ```
   PS> choco install python3
   ```

2. Create a virtualenv (recommended)

   Using [virtualenvwrapper](https://virtualenvwrapper.readthedocs.io/en/latest/):

   ```
   $ mkvirtualenv --python=python3 labmanager
   ```

   Conda environments and direct use of virtualenv/venv are also supported.

3. Install Docker following [the official instructions](https://docs.docker.com/install/).

4. Install node v8.9.3 & npm v5.5.5

   ```
   $ npm install
   ```

## Update Scehma

```
$ npm install -g graphql-cli
$ graphql init
```

Follow setup in the terminal.

```
$ npm run update-schema
```

## Compile Relay

To compile queries and mutations

```
$ npm run relay | yarn relay
```

## Running

Start a local server:

```
$ npm run start | yarn start
```


## Run Tests
Jest runs snapshot tests
```
$ npm run test || yarn test || jest
```

#### To run tests with proxy

Download (Charles)[https://www.charlesproxy.com/]

Setup reverse proxy in charles

Proxy > Reverse Proxy > Add
> Local port: 10010  
> Remote host: localhost:10001  
> Remote port: 80   
> [x] Rewrite redirects  
> [ ] Preserve host in header fields  
> [ ] Listen on a specific address

Run tests with proxy
```
$ npm run test-proxy || yarn test-proxy
```


## Developing

Any changes you make to files in the `js/` directory will cause the server to
automatically rebuild the app and refresh your browser.

If at any time you make changes to `data/schema.js`, stop the server,
regenerate `data/schema.json`, and restart the server:

```
$ npm run update-schema
$ npm start
```

## Contributing

Gigantum uses the [Developer Certificate of Origin](https://developercertificate.org/). 
This is lightweight approach that doesn't require submission and review of a
separate contributor agreement.  Code is signed directly by the developer using
facilities built into git.

Please see [`docs/contributing.md`  in the gtm
repository](https://github.com/gigantum/gtm/tree/integration/docs/contributing.md).

## Credits

TODO
