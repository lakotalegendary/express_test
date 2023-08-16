const express = require('express')
const fs = require('fs')
const app = express()
const port = 3000;

const proxy = require('express-http-proxy')

const cert = fs.readFileSync('cert-uat.crt')
const key = fs.readFileSync('cert-uat-decrypted.key')
const key2 = fs.readFileSync('cert-uat.key')
const crt = fs.readFileSync('cert-uat.p12')
const pfx = fs.readFileSync('cert-uat.pfx')

const hostname = 'api-partners.auchan.com';

app.use('/', proxy(hostname, {
    https: true,
    proxyReqPathResolver: function(req){
        console.log(req.url);
    },
    proxyReqOptDecorator: function(proxyReqOpts, originalReq) {
        proxyReqOpts.ca = [pfx]
        proxyReqOpts.hostname = hostname
        return proxyReqOpts;
    },
    proxyErrorHandler: function(err, res, next) {
        switch(err && err.code) {
            case 'ECONNRESET': { return res.status(405).send(`Error while request: ${err.message}`) }
            case 'ENOTFOUND': { return res.status(404).send(`Not found. Message is ${err.message}`) }
            case 'ECONNREFUSED': { return res.status(200).send(`200 but ${err.code}`) }
            case 'ETIMEDOUT': { return res.status(500).send(`Request timed out. ${err.code}`) }
            default: {next(err)}
        }
    }
}))

app.use('/', function(req, res, next) {

    console.log("BaseUrl: ", req.url)
    console.log("OriginalUrl: ", req.originalUrl)
    console.log("HTTP mehtod: ", req.method)
    console.log("Hostname: ", req.hostname)
    console.log("Port: ", req.port)
    console.log("headers")
    console.log(req.headers)

    next();
})

app.all('/', (req, res) => {
    res.send('Hello world')
})

app.listen(port, () => {
    console.log(`Example on port ${port}`)
})

/*var httpProxy = require('http-proxy');
var fs = require('fs');
const cert = fs.readFileSync('cert-uat.crt', 'utf8')
const key = fs.readFileSync('cert-uat-decrypted.key', 'utf8')
httpProxy.createProxyServer({
    ssl:{ key, cert },
    target: {
        host: 'api-partners.auchan.com',
    },
    changeOrigin: true,
}).listen(3000);*/