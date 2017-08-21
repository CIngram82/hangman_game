const word = 'apple';
let array_Of_Letters_In_Word = word.split("");
let array_of_blanks = [];
for (var i = 0; i < array_Of_Letters_In_Word.length; i++) {
  array_of_blanks.push("_ ");
}
console.log(array_of_blanks);

// let guess_letter = "p";
function replace_blanks_with_letters(letter) {
  let stillBlanks = false;
  for (var i = 0; i < array_Of_Letters_In_Word.length; i++) {
    if (letter === array_Of_Letters_In_Word[i]) {
      array_of_blanks[i] = array_Of_Letters_In_Word[i]
    }
    if (array_of_blanks[i] === "_ ") {
      stillBlanks = true;
    }
  }
  if (stillBlanks === false) {
    console.log('you win!');
  }
}

replace_blanks_with_letters("p");
replace_blanks_with_letters("a");
replace_blanks_with_letters("l");
replace_blanks_with_letters("e");

console.log(array_of_blanks);
