'use strict';

require('@instana/collector')();

const express = require('express');
const app = express();

app.use('/delayed', (req, res) => {
    setTimeout(() => {
        res
            .status(500)
            .json({ message: 'fail' });
    }, 100);
});

app.use('/immediate', (req, res) => {
    res
        .status(500)
        .json({ message: 'fail' });
});

app.listen(4000);