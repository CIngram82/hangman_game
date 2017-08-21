const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const fs = require('fs');
const path = require('path');
const os = require('os');
const Busboy = require('busboy');
const mustache = require('mustache-express');
const session = require('express-session');

server.engine('mustache', mustache());
server.set('views', './views');
server.set('view engine', 'mustache');

server.use(express.static('public'));
server.use(bodyParser.urlencoded({
  extended: true
}));

const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");


server.listen(3000, function() {
  console.log("Login server is working please don't break it.");
});

server.use(session({
  secret: 'Ben loves Easter Eggs',
  resave: false,
  saveUninitialized: true,
}));
//
// Everything above is fine (I hope);
//

server.post('/guess', function(req, res) {
  if (req.body.guess.length !== 1) {
    res.send("stop breaking my code damnit");
  } else {
    for (let i = 0; i < req.session.guessed.length; i++) {
      if (req.session.guessed[i] === req.body.guess) {
        res.send("You guessed that already");
        return
      }
    }
    if (isLetterWrong(req.session.letters, req.body.guess)) {
      req.session.wrongGuess++;
    };
    req.session.blanks = replaceBlanksWithLetters(req.body.guess, req.session.letters, req.session.blanks);
    req.session.guessed.push(req.body.guess);
    if (anyBlanksLeft(req.session.blanks)) {
      res.render('winners');
      return;
    }
    if (req.session.wrongGuess > 7) {
      res.render('gameover');
      return;
    }
    res.render('game', {
      blankedWord: req.session.blanks,
      guessesLeft: 8-req.session.wrongGuess,
      guessedLetters: req.session.guessed
    });
  }
});

//
// below stuff is working!
//
function isLetterWrong(word, letter){
  guessedWrong = true;
  for (var i = 0; i < word.length; i++) {
    if (letter === word[i]) {
      guessedWrong = false;
    }
  }
  return guessedWrong;
};

server.get('/', function(req, res) {
  req.session.letters = pickARandomWord();
  req.session.wrongGuess = 0;
  req.session.guessed = [];
  req.session.blanks = buildTheBlanks(req.session.letters);
  res.render('game', {
    blankedWord: req.session.blanks,
    guessesLeft: 8-req.session.wrongGuess,
    guessedLetters: req.session.guessed
  });
});

server.post('/resetGame', function(req, res){
  res.redirect('/');
});

function replaceBlanksWithLetters(letter, word, blanky) {
  for (let i = 0; i < word.length; i++) {
    if (letter === word[i]) {
      blanky[i] = word[i]
    }
  }
  return blanky;
}

function anyBlanksLeft(blanky) {
  let stillBlanks = true;
  for (let i = 0; i < blanky.length; i++) {
    if (blanky[i] === "_ ") {
      stillBlanks = false;
    }
  }
  return stillBlanks;
};

function pickARandomWord() {
  let randomWord = words[Math.floor(Math.random() * words.length)];
  let arrayOfLettersInWord = randomWord.split("");
  console.log(randomWord);
  return arrayOfLettersInWord;
};

function buildTheBlanks(letters) {
  let arrayOfBlanks = [];
  for (let i = 0; i < letters.length; i++) {
    arrayOfBlanks.push("_ ");
  }
  return arrayOfBlanks;
};
