# instana-aborted-requests

## Problem

When the client aborts a request before the server has been able to respond,
the Instana span will always record the span as having finalized with an http status code of 200.

## How to reproduce?

A reproduction code is included. Use `node` or `docker` to execute it while the instana agent is running.
The `server.js` script is a simple express server that exposes two endpoints:

1. GET `/immediate` - responds back immediately
2. GET `/delayed` - responds back after a delay of 100ms

### Running directly on the host

```bash
$ node server.js
```

### Running as a docker container

```bash
docker build -t test-instana-aborted-request .
docker run --network=host --pid=host --name "test-instana-aborted-request" --rm -ti test-instana-aborted-request:latest node server.js
```

## Test cases

The `client.js` script performs two requests to the server:

1. A request to GET `/immediate`
2. A request to GET `/delayed`. This request is aborted after 10ms, long before the server responds back

### Running directly on the host

```bash
node client.js
```

### Running as a docker container

```bash
docker exec -ti test-instana-aborted-request node client.js
```

## Results

1. Trace spans for the `/immediate` endpoint always get recorded correctly (status code `500`)
2. Trace spans for the `/delayed` endpoint always get recorded incorrectly (status code `200`). These calls should have been recorded as `aborted` by Instana.

## Notes

We noted this problem because we had an inconsistency between our access logs and spans on Instana for the same call. Our access logs were missing the status code while Instana marked these traces as `200`. Upon further inspection, we noticed that [morgan](https://github.com/expressjs/morgan) (access logs), only [included](https://github.com/expressjs/morgan/blob/master/index.js#L283) the status code when headers had been flushed.

From Node.js docs. Response's [status code](https://nodejs.org/dist/latest-v16.x/docs/api/http.html#responsestatuscode) defaults to `200`:

> When using implicit headers (not calling response.writeHead() explicitly), this property controls the status code that will be sent to the client when the headers get flushed.
