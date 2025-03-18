// ui.js
export function displayContent(words, currentWordIndex, wordStatus) {
    const $wordsDisplay = document.getElementById('words-display');
    $wordsDisplay.innerHTML = words.map((word, index) => {
        let className = '';
        if (index === currentWordIndex) className = 'active';
        else if (index < currentWordIndex) className = wordStatus[index] ? 'correct' : 'incorrect';
        return `<span class="${className}">${word}</span>`;
    }).join(' ');
}

export function updateProgress(currentWordIndex, words) {
    const $progress = document.getElementById('progress');
    const progress = (currentWordIndex / words.length) * 100;
    $progress.style.width = `${progress}%`;
}

export function updateWpm(correctWords, mode, currentTime) {
    const $wpm = document.getElementById('wpm');
    const elapsedTime = mode === 'timed' ? (60 - currentTime) : currentTime;
    const wpm = elapsedTime > 0 ? Math.round(correctWords * 60 / elapsedTime) : 0;
    $wpm.textContent = `WPM: ${isNaN(wpm) ? 0 : wpm}`;
}

export function showGameOver(wpm, accuracy, failedWords) {
    const $game = document.getElementById('game');
    const $results = document.getElementById('results');
    const $resultsWpm = document.getElementById('results-wpm');
    const $resultsAccuracy = document.getElementById('results-accuracy');
    const $failedWords = document.getElementById('failed-words');

    $game.style.display = 'none';
    $results.style.display = 'block';

    $resultsWpm.textContent = wpm;
    $resultsAccuracy.textContent = `${accuracy.toFixed(2)}%`;

    // Mostrar palabras fallidas
    if (failedWords.length > 0) {
        $failedWords.innerHTML = failedWords.map(word => `<span>${word}</span>`).join(' ');
    } else {
        $failedWords.innerHTML = '<span style="color: #4caf50;">¡No hay palabras fallidas!</span>';
    }
}
