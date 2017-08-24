const mongoose = require('mongoose');

const winnersListSchema = new mongoose.Schema({
  name: { type: String, required: true, },
  word: String,
  wrongGuesses: Number
})

const WinnersList = mongoose.model('winners', winnersListSchema);

module.exports = WinnersList;
