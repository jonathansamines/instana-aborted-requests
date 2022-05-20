'use strict';

const Wreck = require('@hapi/wreck');
const assert = require('assert');
const timers = require('timers/promises');

const client = Wreck.defaults({ baseUrl: 'http://127.0.0.1:4000' });

async function request(url) {
    const promise = client.request('GET', url);

    await timers.setTimeout(10);
    promise.req.abort();

    const response = await promise;
    const payload = await Wreck.read(response, { json: true });

    return { payload, status: response.statusCode };
}

async function main() {
    const [delayed, immediate] = await Promise.allSettled([request('/delayed'), request('/immediate')]);

    assert(delayed.reason, 'delayed response failed');
    assert(delayed.reason.code, 'ECONNRESET');

    assert(immediate.value, 'immediate response succeded');
    assert.equal(immediate.value.status, 500);
    assert.equal(immediate.value.payload.message, 'fail');
}

main();
