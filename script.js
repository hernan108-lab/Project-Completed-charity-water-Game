// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let timerInterval; // Will store the countdown timer
let score = 0; // Tracks the player's points
let timeLeft = 30; // Countdown time in seconds
let dropCount = 0; // Tracks how many drops have spawned
let spawnIntervalId; // Stores the active drop spawn timer
let currentDifficulty = "normal";
let milestoneReached = false;

const difficultySettings = {
  easy: {
    label: "Easy",
    winTarget: 30,
    spawnSchedule: [1100, 650, 350],
    badDropEvery: 12,
    badDropPenalty: 1,
  },
  normal: {
    label: "Normal",
    winTarget: 40,
    spawnSchedule: [900, 500, 250],
    badDropEvery: 10,
    badDropPenalty: 2,
  },
  hard: {
    label: "Hard",
    winTarget: 50,
    spawnSchedule: [700, 400, 200],
    badDropEvery: 8,
    badDropPenalty: 3,
  },
};

const gameContainer = document.getElementById("game-container");
const startSound = new Audio("img/49447089-game-start-317318.mp3");
const loseSound = new Audio("img/alphix-game-over-417465.mp3");
const winSound = new Audio("img/cartoon-music-game-sfx-arcade-game-achievement-bling-489759.mp3");
const dropSound = new Audio("img/cartoon-music-game-sfx-arcade-game-victory-chime-489761.mp3");

function playSound(audio) {
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("reset-btn").addEventListener("click", resetGame);
document.getElementById("difficulty-select").addEventListener("change", (event) => {
  currentDifficulty = event.target.value;
  updateDifficultyInfo();
});
gameContainer.addEventListener("pointerdown", handleDropHit);

function getCurrentDifficultySettings() {
  return difficultySettings[currentDifficulty];
}

function updateDifficultyInfo() {
  const difficulty = getCurrentDifficultySettings();
  document.getElementById("win-target").textContent = difficulty.winTarget;
  document.getElementById("difficulty-select").value = currentDifficulty;
}

function updateScore() {
  document.getElementById("score").textContent = score;
}

function showMilestoneMessage() {
  if (milestoneReached) return;

  const difficulty = getCurrentDifficultySettings();
  const milestoneThresholds = {
    easy: 15,
    normal: 20,
    hard: 25,
  };

  const threshold = milestoneThresholds[currentDifficulty];
  if (score < threshold) return;

  milestoneReached = true;

  const message = document.createElement("div");
  message.className = "milestone-message";
  message.textContent = "Halfway there!";
  gameContainer.appendChild(message);

  setTimeout(() => {
    message.remove();
  }, 1400);
}

function updateTimer() {
  document.getElementById("time").textContent = timeLeft;
}

function handleDropHit(event) {
  const drop = event.target.closest(".water-drop");

  if (!drop || !gameRunning) return;

  playSound(dropSound);

  const difficulty = getCurrentDifficultySettings();

  if (drop.classList.contains("bad-drop")) {
    score -= difficulty.badDropPenalty;
  } else {
    score += 1;
  }

  updateScore();
  showMilestoneMessage();
  drop.remove();
}

function createCelebrationEffect(isWin) {
  const confettiLayer = document.getElementById("confetti-layer");
  confettiLayer.innerHTML = "";

  const colors = isWin
    ? ["#ffc907", "#2e9df7", "#4fcb53", "#ff902a"]
    : ["#f5402c", "#f16061", "#5c4116"];

  for (let i = 0; i < 40; i += 1) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 220}px`);
    piece.style.animationDuration = `${1 + Math.random() * 0.5}s`;
    confettiLayer.appendChild(piece);
  }
}

function showResultPopup() {
  const popup = document.getElementById("result-popup");
  const title = document.getElementById("result-title");
  const message = document.getElementById("result-message");
  const difficulty = getCurrentDifficultySettings();

  if (score >= difficulty.winTarget) {
    title.textContent = "Good Job!";
    message.textContent = `You reached ${score} points and met the ${difficulty.label.toLowerCase()} target of ${difficulty.winTarget}!`;
    createCelebrationEffect(true);
  } else {
    title.textContent = "Mission failed!";
    message.textContent = `You needed ${difficulty.winTarget} points to win on ${difficulty.label.toLowerCase()} mode.`;
    createCelebrationEffect(false);
  }

  popup.classList.remove("hidden");
}

function endGame() {
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  clearInterval(spawnIntervalId);
  gameRunning = false;

  const gameContainer = document.getElementById("game-container");
  gameContainer.querySelectorAll(".water-drop").forEach((drop) => drop.remove());

  const difficulty = getCurrentDifficultySettings();
  if (score >= difficulty.winTarget) {
    playSound(winSound);
  } else {
    playSound(loseSound);
  }

  showResultPopup();
  document.getElementById("start-btn").textContent = "Start Game";
}

function resetGame() {
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  clearInterval(spawnIntervalId);
  gameRunning = false;

  score = 0;
  timeLeft = 30;
  dropCount = 0;
  milestoneReached = false;
  updateScore();
  updateTimer();
  updateDifficultyInfo();

  gameContainer.querySelectorAll(".water-drop").forEach((drop) => drop.remove());
  document.getElementById("confetti-layer").innerHTML = "";
  document.getElementById("result-popup").classList.add("hidden");
  document.getElementById("start-btn").textContent = "Start Game";
}

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  playSound(startSound);

  score = 0;
  timeLeft = 30;
  dropCount = 0;
  milestoneReached = false;
  updateScore();
  updateTimer();

  const gameContainer = document.getElementById("game-container");
  gameContainer.querySelectorAll(".water-drop").forEach((drop) => drop.remove());

  gameRunning = true;
  document.getElementById("confetti-layer").innerHTML = "";
  document.getElementById("result-popup").classList.add("hidden");
  document.getElementById("start-btn").textContent = "Playing...";

  const spawnSchedule = getCurrentDifficultySettings().spawnSchedule;
  let phase = 0;

  function startSpawnPhase() {
    clearInterval(spawnIntervalId);
    spawnIntervalId = setInterval(createDrop, spawnSchedule[phase]);
  }

  startSpawnPhase();

  // Count down the timer once per second
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    updateTimer();

    if (timeLeft <= 20 && phase === 0) {
      phase = 1;
      startSpawnPhase();
    } else if (timeLeft <= 10 && phase === 1) {
      phase = 2;
      startSpawnPhase();
    }

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function createDrop() {
  dropCount += 1;

  // Water drops
  const drop = document.createElement("div");
  drop.className = "water-drop";

  if (dropCount % getCurrentDifficultySettings().badDropEvery === 0) {
    drop.classList.add("bad-drop");
  }

  // Make drops different sizes for visual variety
  const initialSize = 30; // Base size in pixels
  const sizeMultiplier = Math.random() * 1.8 + 0.6;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 6 seconds
  drop.style.animationDuration = "6s";

  // Add the new drop to the game screen
  gameContainer.appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}

updateScore();
updateTimer();
updateDifficultyInfo();
