import { contentData } from "./contentData.js";
import {
  displayContent,
  updateProgress,
  updateWpm,
  showGameOver,
} from "./ui.js";

let mode = "timed";
let difficulty = "easy";
let language = "es";
let contentType = "words";
let currentTime = 60;
let words = [];
let currentWordIndex = 0;
let correctWords = 0;
let correctLetters = 0; 
let incorrectLetters = 0;
let timerInterval;
let wordStatus = [];
let failedWords = [];
let progressIntervals = [];

const PROGRESS_TIME = 7000;

export function initGame() {
  const $startGameButton = document.getElementById("startGameButton");
  const $restartGameButton = document.getElementById("restart-game");
  const $playAgainButton = document.getElementById("play-again");
  const $inputWord = document.getElementById("input-word");

  $startGameButton.addEventListener("click", () => {
    mode = document.getElementById("mode").value;
    difficulty = document.getElementById("difficulty").value;
    language = document.getElementById("language").value;
    contentType = document.getElementById("content-type").value;
    startGame();
  });

  $restartGameButton.addEventListener("click", startGame);
  $playAgainButton.addEventListener("click", () => {
    document.getElementById("results").style.display = "none";
    document.getElementById("options-container").style.display = "block";
    document.getElementById("virtual-keyboard").style.display = "none";
    clearProgressIntervals();
  });

  $inputWord.addEventListener("input", handleInput);

  document.addEventListener("keydown", highlightKey);
  document.addEventListener("keyup", unhighlightKey);
}

function adjustLayoutForGame() {
  const $game = document.getElementById("game");
  const $virtualKeyboard = document.getElementById("virtual-keyboard");
  const main = document.querySelector("main");

  if ($game.style.display !== "none") {
    if (window.innerWidth > 768 && $virtualKeyboard.style.display === "none") {
      main.style.paddingBottom = "150px";
    } else {
      main.style.paddingBottom = "50px";
    }
  } else {
    main.style.paddingBottom = "30px";
  }
}

window.addEventListener("resize", function () {
  initkeyboardVisibility();
  adjustLayoutForGame();
});

function startGame() {
  const $optionsContainer = document.getElementById("options-container");
  const $game = document.getElementById("game");
  const $progressBar = document.getElementById("progress-bar");
  const $virtualKeyboard = document.getElementById("virtual-keyboard");

  $optionsContainer.style.display = "none";
  $game.style.display = "flex";
  document.getElementById("results").style.display = "none";

  if (window.innerWidth > 768) {
    $virtualKeyboard.style.display = "flex";
  } else {
    $virtualKeyboard.style.display = "none";
  }

  currentTime = mode === "timed" ? 60 : 0;
  currentWordIndex = 0;
  correctWords = 0;
  correctLetters = 0;
  incorrectLetters = 0;
  wordStatus = [];
  failedWords = [];
  clearProgressIntervals();

  loadContent();
  displayContent(words, currentWordIndex, wordStatus);
  document.getElementById("input-word").value = "";
  document.getElementById("input-word").focus();

  $progressBar.style.display = mode === "words" ? "block" : "none";
  updateProgress(currentWordIndex, words);
  startWordProgress();

  if (mode === "timed") startTimer();

  adjustLayoutForGame();
}

function loadContent() {
  const allContent = contentData[contentType][language];
  let filteredContent = [];

  if (contentType === "paragraphs") {
    filteredContent =
      allContent[Math.floor(Math.random() * allContent.length)].split(" ");
  } else {
    if (difficulty === "easy") {
      filteredContent = allContent.filter((item) => item.length <= 5);
    } else if (difficulty === "medium") {
      filteredContent = allContent.filter(
        (item) => item.length > 5 && item.length <= 8
      );
    } else {
      filteredContent = allContent.filter((item) => item.length > 8);
    }

    filteredContent = filteredContent.sort(() => Math.random() - 0.5);
    if (mode === "timed") {
      filteredContent = filteredContent.slice(0, currentTime * 2);
    } else {
      filteredContent = filteredContent.slice(0, 50);
    }
  }

  words = filteredContent;
}

function startTimer() {
  const $timer = document.getElementById("timer");
  $timer.textContent = `⏱️: ${currentTime}s`;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    currentTime--;
    $timer.textContent = `⏱️: ${currentTime}s`;
    if (currentTime <= 0) {
      clearInterval(timerInterval);
      gameOver();
    }
  }, 1000);
}

function handleInput(e) {
  const typedWord = e.target.value.trim();
  const currentWord = words[currentWordIndex].toLowerCase();
  const $inputWord = document.getElementById("input-word");

  if (typedWord.toLowerCase() === currentWord) {
    wordStatus[currentWordIndex] = true;
    correctWords++;
    correctLetters += currentWord.length;
    currentWordIndex++;
    $inputWord.value = "";
    if (currentWordIndex >= words.length) {
      gameOver();
    } else {
      displayContent(words, currentWordIndex, wordStatus);
      startWordProgress();
    }
    updateWpm(correctWords, mode, currentTime);
  }
}

function startWordProgress() {
  clearProgressIntervals();
  const $progressBars = document.getElementById("progress-bars");
  const $progressBar = document.createElement("div");
  $progressBar.className = "progress-bar";
  $progressBar.innerHTML = '<div class="progress"></div>';
  $progressBars.innerHTML = "";
  $progressBars.appendChild($progressBar);

  let progress = 0;
  const interval = setInterval(() => {
    progress += 100 / (PROGRESS_TIME / 100);
    $progressBar.querySelector(".progress").style.width = `${progress}%`;

    if (progress >= 100) {
      clearInterval(interval);
      if (!wordStatus[currentWordIndex]) {
        wordStatus[currentWordIndex] = false;
        failedWords.push(words[currentWordIndex]);
        incorrectLetters += words[currentWordIndex].length;
        currentWordIndex++;
        if (currentWordIndex >= words.length) {
          gameOver();
        } else {
          displayContent(words, currentWordIndex, wordStatus);
          startWordProgress();
        }
        updateWpm(correctWords, mode, currentTime);
      }
    }
  }, 100);
  progressIntervals.push(interval);
}

function clearProgressIntervals() {
  progressIntervals.forEach(clearInterval);
  progressIntervals = [];
}

function gameOver() {
  clearInterval(timerInterval);
  clearProgressIntervals();
  document.getElementById("virtual-keyboard").style.display = "none";
  document.getElementById("progress-bars").innerHTML = "";

  const totalLetters = correctLetters + incorrectLetters;
  const accuracy =
    totalLetters > 0 ? (correctLetters / totalLetters) * 100 : 100;
  const elapsedTime = mode === "timed" ? 60 : currentTime;
  const wpm =
    elapsedTime > 0
      ? Math.round((correctWords * 60) / elapsedTime)
      : correctWords;

  showGameOver(wpm, accuracy, failedWords);
}

function highlightKey(e) {
  const key = e.key.toLowerCase();
  const keyElement =
    document.querySelector(`.key[data-key="${key === " " ? " " : key}"]`) ||
    document.querySelector(`.key[data-key="${key.toUpperCase()}"]`) ||
    document.querySelector(`.key[data-key="${e.code}"]`);

  if (keyElement) keyElement.classList.add("active");
}

function unhighlightKey(e) {
  const key = e.key.toLowerCase();
  const keyElement =
    document.querySelector(`.key[data-key="${key === " " ? " " : key}"]`) ||
    document.querySelector(`.key[data-key="${key.toUpperCase()}"]`) ||
    document.querySelector(`.key[data-key="${e.code}"]`);

  if (keyElement) keyElement.classList.remove("active");
}
