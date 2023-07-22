const http = require('http');
const app = require('./express');

app.set('port', process.env.PORT || 4000);
const server = http.createServer(app);

server.listen(process.env.PORT || 4000);