const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs').promises;
const winston = require('winston');
const cors = require('cors');

const accountsRouter = require('./routes/accounts.js');
const app = express();

(async () => {
  try {
    await mongoose.connect("mongodb+srv://dbmongo:dbmongo@cluster0.f3z87.mongodb.net/bank_api?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
  } catch (error) {
    console.log(`Error conecting to MongoDB Atlas - ${error}`);
  }
})();

const accountsSchema = mongoose.Schema;

// global.fileName = 'accounts.json';

// const { combine, timestamp, label, printf } = winston.format;
// const myFormat = printf(({level, message, label, timestamp}) => {
//   return `${timestamp} [${label}] ${level}: ${message}`;
// });

// global.logger = winston.createLogger({
//   level: 'silly',
//   transports: [
//     new (winston.transports.Console)(),
//     new (winston.transports.File)({filename: 'my-api.log'})
//   ],
//   format: combine(
//     label({ label: 'myFirst-api'}),
//     timestamp(),
//     myFormat
//   )
// });

app.use(express.json());
app.use(cors());

app.use('/account', accountsRouter);

app.listen(3000, async () => {
  try {
    // await fs.readFile(global.fileName, 'utf-8');
    console.log('API Working');
  } catch(err) {
      // const initialJson = {
      //   nextId: 1,
      //   accounts: []
      // };
      // fs.writeFile(global.fileName, JSON.stringify(initialJson)).catch(err => {
      //   console.log(err);
      // });
    }
});
