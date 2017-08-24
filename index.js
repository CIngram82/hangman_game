const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const fs = require('fs');
const path = require('path'); // Do I need this?
const os = require('os'); // Do I need this?
const Busboy = require('busboy'); // Do I need this?
const mustache = require('mustache-express');
const session = require('express-session');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const WinnersList = require('./modules/winnersList')

server.engine('mustache', mustache());
server.set('views', './views');
server.set('view engine', 'mustache');

server.use(express.static('public'));
server.use(bodyParser.urlencoded({extended: true}));

const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
let ezMode =[];
let normalMode = [];
let hardmode = [];
let kiddingMeMode = [];

for (var i = 0; i < words.length; i++) {
  if (words[i].length > 19) {
    kiddingMeMode.push(words[i]);
  }
  if (words[i].length > 7 && words[i].length < 12) {
    hardmode.push(words[i]);
  }
 if (words[i].length > 5 && words[i].length < 9) {
    normalMode.push(words[i]);
  }
 if (words[i].length > 3 && words[i].length < 7) {
    ezMode.push(words[i]);
  }
};
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

// TODO add images and change as guessed wrong goes up.
// TODO change game over. so it shows the word and fills in letters as red.
// TODO can I get auto focus back on the input box after


server.post('/guess', function(req, res) {
  single = singleLetter(req.body.guess);
  lowercase = letterAlphaber(req.body.guess);
  if (single === false || lowercase === false) {
    res.render('game', {
      message: "Please only use only a single lowercase letter.",
      blankedWord: req.session.blanks,
      guessesLeft: 8-req.session.wrongGuess,
      guessedLetters: req.session.guessed
    });
    return ;
  }
  for (let i = 0; i < req.session.guessed.length; i++) {
    if (req.session.guessed[i] === req.body.guess) {
      res.render('game', {
        message: "You guessed that already!",
        blankedWord: req.session.blanks,
        guessesLeft: 8-req.session.wrongGuess,
        guessedLetters: req.session.guessed
      });
      return ;
    }
  }
  if (isLetterWrong(req.session.letters, req.body.guess)) {
    req.session.wrongGuess++;
  };
  req.session.blanks = replaceBlanksWithLetters(req.body.guess, req.session.letters, req.session.blanks);
  req.session.guessed.push(req.body.guess);
  if (anyBlanksLeft(req.session.blanks)) {
    res.render('winners',{
      word: req.session.blanks
    });
    return;
  }
  if (req.session.wrongGuess > 7) {
    let gameOverWord = gameOverLose(req.session.blanks, req.session.letters);
    res.render('gameover',
    {word: gameOverWord});
    return;
  }
  res.render('game', {
    blankedWord: req.session.blanks,
    guessesLeft: 8-req.session.wrongGuess,
    guessedLetters: req.session.guessed
  });
});

mongoose.connect('mongodb://localhost:27017/test');

server.post('/winnerWall',function(req, res){
  console.log(req.body.name);
  console.log(req.session.blanks.join(''));
  console.log(req.session.wrongGuess);
  let win = new WinnersList({name: req.body.name});
  win.word = req.session.blanks.join('');
  win.wrongGuesses = req.session.wrongGuess;
  win.save()
    .then(function(){
      WinnersList.find()
        .then(function(winlist){
          console.log(winlist);
        })
    })
  res.render('winners',{
    message: "Nice try 4chan"
  });
})

//
// below stuff is working! I think...
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

server.post('/gamemode',function(req, res){
  req.session.gameMode = req.body.gameButton
    res.redirect('/');
});

server.get('/', function(req, res) {
  req.session.letters = setTheMode(req.session.gameMode);
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

function singleLetter(letter){
  if (letter.length !== 1) {
  return false
  };
  return true;
};

function letterAlphaber(letter){
  let alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
  let isValidLetter = false;
  for (var i = 0; i < alphabet.length; i++) {
    if (alphabet[i] === letter){
      isValidLetter = true;
    }
  };
  return(isValidLetter);
};

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

function setTheMode(modeValue){
  let randomWord =""
  if (modeValue === "Easy") {
   randomWord = ezMode[Math.floor(Math.random() * ezMode.length)];
 }else if (modeValue === "Hard") {
     randomWord = hardmode[Math.floor(Math.random() * hardmode.length)];
  } else if (modeValue === "How is that a word?") {
     randomWord = kiddingMeMode[Math.floor(Math.random() * kiddingMeMode.length)];
  }else {
     randomWord = normalMode[Math.floor(Math.random() * normalMode.length)];
  }
  return splitingTheWord(randomWord);
}

function splitingTheWord(randomWord) {
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

function gameOverLose(incompleateWord, compleateWord){
  let gameOverWord = [];
  for (var i = 0; i < incompleateWord.length; i++) {
    if (incompleateWord[i] === compleateWord[i]) {
      gameOverWord.push({letter:compleateWord[i], guessed: true});
    }else {
      gameOverWord.push({letter:compleateWord[i], guessed: false});
    }
  }
  return gameOverWord;
}
