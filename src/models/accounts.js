const mongoose = require('mongoose');

const accountsSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  agency: {
    type: Number,
    require: true,
  },
  account: {
    type: Number,
    require: true,
  },
  balance: {
    type: Number,
    require: true,
    validate(value) {
      if (value < 0) throw new Error("Balance can't be negative")
    },
  },
});

const accountsModel = mongoose.model('accounts', accountsSchema, 'accounts');

module.exports = accountsModel;