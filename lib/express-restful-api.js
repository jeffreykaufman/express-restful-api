'use strict';

const express = require('express');
const helmet = require('helmet');
const http = require('http');

let router = {};

function route(path, method, handler) {
    let lowercaseMethod = method.toLowerCase();

    if(!router.hasOwnProperty(path)) {
        router[path] = [];
    }

    if(!router[path].includes(lowercaseMethod)) {
        router[path].push(lowercaseMethod);
    }

    app[lowercaseMethod](path, handler);
}

function respond(response, code, content) {
    response.status(code).json({
        code: code,
        description: http.STATUS_CODES[code],
        content: content
    });
    response.end();
}

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use(helmet());

app.use((request, response, next) => {
    if(!request.accepts('application/json')) {
        respond(response, 406, 'application/json');
    } else {
        next();
    }
});

app.use((request, response, next) => {
    if(!router.hasOwnProperty(request.path)) {
        respond(response, 404, null);
    } else if(!router[request.path].includes(request.method.toLowerCase())) {
        let allowedMethods = router[request.path].join(', ').toUpperCase();
        response.set('Allow', allowedMethods);
        respond(response, 405, allowedMethods);
    } else {
        next();
    }
});

module.exports = {
    route: route,
    respond: respond,
    app: app
};
