const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! shutting down...');
  process.exit(1);
});

//read environment variables
dotenv.config({ path: '.env' });

//import app file
const app = require('./app');

//repalce string "password" on mongo atlas database url with mongo atlas password
const DB = process.env.LOCALDB || process.env.DATABASE_URL.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
); 
//Setup database connection 
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful');
  });

//port
const port = process.env.PORT || 3600;

//listen to connect from port
const server = app.listen(port, () => {
  console.log(`server listening on ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED, shutting down gracefully');
  server.close(() => {
    console.log('process terminated!');
  });
});
