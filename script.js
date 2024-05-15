"use strict";

let loading = document.getElementById("load");
let main = document.getElementById("main");

var width = 5;
var height = 6;

var row = 0;
var col = 0;
var numberofhints = 2;

var gameOver = false;
var targetWord;

window.onload = function () {
  generateWords();
  intialize();
};
function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  return `${year}-${month}-${day}`;
}

function generateWords() {
  const currentDate = getCurrentDate(); 
  const storedData = localStorage.getItem('wordOfTheDay'); 
  if (storedData) {
    const { word, date } = JSON.parse(storedData);
    if (date === currentDate) {
      targetWord = word;
      console.log(targetWord);
      main.classList.remove('main');
      loading.classList.add('load');
      return;
    }
  }
  fetch('https://random-word-api.herokuapp.com/word')
    .then(response => response.json())
    .then(data => {
      const newWord = data[0];
      if (newWord.length !== 5) {
        generateWords();
      } else {
        targetWord = newWord.toUpperCase();
        console.log(targetWord);
        localStorage.setItem('wordOfTheDay', JSON.stringify({
          word: targetWord,
          date: currentDate,
        }));

        main.classList.remove('main');
        loading.classList.add('load');
      }
    })
    .catch(error => {
      generateWordsoffline(); 
    });
}

function generateWordsoffline() {
  const currentDate = getCurrentDate(); 
  const storedData = localStorage.getItem('wordOfTheDay'); 
  if (storedData) {
    const { word, date } = JSON.parse(storedData);
    if (date === currentDate) {
      targetWord = word;
      console.log(targetWord);
      main.classList.remove('main');
      loading.classList.add('load');
      return;
    }
  }

  var requete = new XMLHttpRequest();
  requete.open('GET', 'realword.xml', true);

  requete.onreadystatechange = function() {
    if (requete.readyState === 4 && requete.status === 200) {
      var xml = requete.responseXML;
      var words = xml.getElementsByTagName('word');
      var wordList = Array.from(words).map(word => word.textContent.trim());
      let i;

      do {
        i = Math.floor(Math.random() * wordList.length);
      } while (wordList[i].length !== 5);

      targetWord = wordList[i].toUpperCase();
      console.log(targetWord);
      
      localStorage.setItem('wordOfTheDay', JSON.stringify({
        word: targetWord,
        date: currentDate,
      }));

      main.classList.remove('main');
      loading.classList.add('load');
    }
  };

  requete.send();
}


function intialize() {
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      let cell = document.createElement("div");
      cell.id = i + "-" + j;
      cell.classList.add("cell");
      cell.innerText = "";
      document.getElementById("board").appendChild(cell);
    }
  }

  document.addEventListener("keyup", (e) => {
    if (gameOver) return;
    let char = e.key;
    if (col < width && "a" <= char && char <= "z") {
      let cellule = document.getElementById(row + "-" + col);
      if (cellule.innerText == "") {
        cellule.innerText = char.toUpperCase();
      } else {
        col += 1;
        let cel = document.getElementById(row + "-" + col);
        cel.innerText = char.toUpperCase();
      }
      col += 1;
    } else if (e.code == "Backspace") {
      if (0 < col && col <= width) {
        col -= 1;
        if(col != position){
          let currCell = document.getElementById(row + "-" + col);
          if (currCell) {
            currCell.innerText = "";
          }
        }
        else{
          if(col != 0){
            col -= 1;
            let currCell = document.getElementById(row + "-" + col);
            if (currCell) {
              currCell.innerText = "";
            }
          }
        }
      }
      
      
    }
    else if (e.code == "Enter" && col == width) {
      checkWord();
      row++;
      col = 0;
    }

    if (!gameOver && row == height) {
      gameOver = true;
      showCustomAlert("YOU LOSE","You Lose, the word is: " + targetWord);
    }
  });

  let enterButton = document.getElementById("enterButton");
  let eraseButton = document.getElementById("eraseButton");
  const letters = document.querySelectorAll('.letter');

  letters.forEach(button => {
    button.addEventListener('click', handleClick);
  });
  function handleClick(event) {
    if (gameOver) return;
    const buttonValue = event.target.value;
    if (col < width) {
      let cellule = document.getElementById(row + "-" + col);
        if (cellule.innerText == "") {
          cellule.innerText = buttonValue.toUpperCase();
        }
        
        else{
          col += 1;
          let cel = document.getElementById(row + "-" + col);
          cel.innerText = buttonValue.toUpperCase();

        }
        col += 1;
    }
    
  }
  enterButton.addEventListener("click", () => {
    if (col == width) {
      checkWord();
      row++;
      col = 0;
    }

    if (!gameOver && row == height) {
      gameOver = true;
      showCustomAlert("YOU LOSE","You Lose, the word is: " + targetWord);
    }
  });

  eraseButton.addEventListener("click", () => {
    if (0 < col && col <= width) {
      col -= 1;
    }
    if(col != position){
      let currCell = document.getElementById(row + "-" + col);
      if (currCell) {
        currCell.innerText = "";
      }
    }
    else{
      col -= 1;
      let currCell = document.getElementById(row + "-" + col);
      if (currCell) {
        currCell.innerText = "";
      }
    }
    
    
  });
  
}

function checkWord() {
  let correct = 0;
  let guess = "";

  for (let i = 0; i < width; i++) {
    let currCell = document.getElementById(row + "-" + i);
    guess += currCell.innerText;
  }

  let feedback = getFeedback(targetWord, guess);

  for (let i = 0; i < width; i++) {
    let currCell = document.getElementById(row + "-" + i);
    if (feedback[i] == "green") {
      currCell.classList.add("correct");
      correct += 1;
    } else if (feedback[i] == "yellow") {
      currCell.classList.add("present");
    } else {
      currCell.classList.add("absent");
    }

    if (correct == width) {
      gameOver = true;
      showCustomAlert("YOU WIN!","You Guess The Word Correct, Good Job!");
    }
  }
}

function getFeedback(targetWord, guess) {
  const feedback = [];
  const words = [];
  for (let i = 0; i < targetWord.length; i++) {
    if (targetWord.charAt(i) === guess.charAt(i)) {
      feedback.push("green");
    } else {
      words.push(targetWord.charAt(i));
      feedback.push("");
    }
  }
  for (let i = 0; i < guess.length; i++) {
    if (feedback[i] === "") {
      const pos = words.indexOf(guess.charAt(i));
      if (pos !== -1) {
        words.splice(pos, 1);
        feedback[i] = "yellow";
      } else {
        feedback[i] = "red";
      }
    }
  }
  return feedback;
}

function fillCases(ch){
  let i = 0;
  do {
    
    let cellule = document.getElementById(row + "-" + i);
    try {
      cellule.innerText = ch[i].toUpperCase();
      i += 1;
    } catch (error) {
      return;

    }
  } while (i < ch.length && i < width);
  col = i;
    
  
}

var position = null;
var c;
function hint() {
  if (gameOver) {
    showCustomAlert("ERREUR","You cant use hint now, Game is Over!");
    return;
  }
  if (numberofhints === 0) {
    showCustomAlert("ERREUR", "You dont have any hint left!");
    return;
  }
  if (position === null) {
    position = Math.floor(Math.random() * targetWord.length);
  }
  var hint = targetWord.charAt(position);
  if (numberofhints === 2) {
    numberofhints--;
    document.querySelector(".hint span").innerHTML = numberofhints;
    c = Math.floor(Math.random() * targetWord.length);
    let cellule = document.getElementById(row + "-" + c);
    cellule.innerHTML = hint.toUpperCase();
  } else if (numberofhints === 1) {
    numberofhints--;
    document.querySelector(".hint span").innerHTML = numberofhints;
    let cell = document.getElementById(row + "-" + c);
    cell.innerHTML = "";
    for(let i = row; i <= targetWord.length; i++) {
      var cellule = document.getElementById(i + "-" + position);
      cellule.innerHTML = hint.toUpperCase();
      cellule.classList.add("correct");
    }
  }
  
}

document.querySelector(".hint").addEventListener("click", () => {
  hint();
});

var startButton = document.getElementById('voiceButton');
var recognition = new webkitSpeechRecognition();
recognition.lang = window.navigator.language;
recognition.interimResults = true;
startButton.addEventListener('click', () => { recognition.start(); });
recognition.addEventListener('result', (event) => {
const result = event.results[event.results.length - 1][0].transcript;
fillCases(result);
});

document.querySelector('.checkbox').addEventListener('change', function() {
  document.body.classList.toggle('dark', this.checked);
}); 

document.getElementById('setting').addEventListener('click', () => {
  const settingsFrame = document.getElementById('settings-frame');
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');
  document.body.appendChild(overlay);
  settingsFrame.classList.add('show');

  const closeButton = document.getElementById('close-btn');
  closeButton.addEventListener('click', () => {
      settingsFrame.classList.remove('show');
      overlay.remove();
  });

  overlay.addEventListener('click', () => {
      settingsFrame.classList.remove('show');
      overlay.remove();
  });
});

document.querySelector('.checkbox').addEventListener('change', function() {
  document.body.classList.toggle('dark', this.checked);
});
document.getElementById('htp').addEventListener('click', () => {
  const settingsFrame = document.getElementById('htp-frame');
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');
  document.body.appendChild(overlay);
  settingsFrame.classList.add('show');

  const closeButton = document.getElementById('close-btn2');
  closeButton.addEventListener('click', () => {
      settingsFrame.classList.remove('show');
      overlay.remove();
  });

});

function showCustomAlert(title, message) {
  const customAlert = document.getElementById('custom-alert');
  const alertTitle = customAlert.querySelector('h2');
  const alertMessage = customAlert.querySelector('p span');

  alertTitle.textContent = title;
  alertMessage.textContent = message;

  customAlert.classList.add('show');
}
function hideCustomAlert() {
  const customAlert = document.getElementById('custom-alert');
  customAlert.classList.remove('show');
}
document.getElementById('ok-button').addEventListener('click', hideCustomAlert);
