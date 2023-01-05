require('dotenv').config({ path: '.env' });
require('events').EventEmitter.prototype._maxListeners = 20;

// start for normal http request
const express = require('express');
// const LibBullAdapter = require('./library/LibBullAdapter');
const routes = require('./routes/routes');
const app = express();
// end for normal http request

// start for normal http request
app.use(express.json({ limit: '10mb' })); // parsing application/json
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // parsing application/x-www-form-urlencoded
app.use(async function (req, res, next) {
  // set control allowed headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range, x-api-key, x-forwarded-for');
  next();
});
// app.use(process.env.PATH_URL + '/bull/monitor', LibBullAdapter.getRouter());
routes.use(app);
app.listen(process.env.PORT, () => {
  console.log('Express server running at port ' + process.env.PORT);
});
// end for normal http request