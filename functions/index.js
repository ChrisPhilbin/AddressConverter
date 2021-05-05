const functions = require("firebase-functions");
const app = require('express')

const {
    getVerifiedAddress
} = require('./api/converter')

app.get('/convert', getVerifiedAddress)

exports.api = functions.https.onRequest(app)