const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const createError = require('http-errors');

//initialize express
const app = express();
//implement cros
app.use(cors());

app.options('*', cors());

app.enable('trust proxy');

//import authentication controllers
const auth = require('./routes/userRoute');

//set security Http headers
app.use(helmet());

//development loggin
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limit req from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests  from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//Data sanitization against noSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//prevent parameter pollution
app.use(hpp({}));

//body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

//routes middlewares
app.use('/api/v1/users', auth);

app.all('*', (req, res, next) => {
  next(createError(404, `can't find ${req.originalUrl} on server!`));
});

//error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

//export express
module.exports = app;
