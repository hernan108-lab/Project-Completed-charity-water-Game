// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let timerInterval; // Will store the countdown timer
let score = 0; // Tracks the player's points
let timeLeft = 30; // Countdown time in seconds
let dropCount = 0; // Tracks how many drops have spawned
let spawnIntervalId; // Stores the active drop spawn timer

const gameContainer = document.getElementById("game-container");

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("reset-btn").addEventListener("click", resetGame);
gameContainer.addEventListener("pointerdown", handleDropHit);

function updateScore() {
  document.getElementById("score").textContent = score;
}

function updateTimer() {
  document.getElementById("time").textContent = timeLeft;
}

function handleDropHit(event) {
  const drop = event.target.closest(".water-drop");

  if (!drop || !gameRunning) return;

  if (drop.classList.contains("bad-drop")) {
    score -= 2;
  } else {
    score += 1;
  }

  updateScore();
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

  if (score > 40) {
    title.textContent = "Good Job!";
    message.textContent = "You collected enough water to complete Charity Water's mission!";
    createCelebrationEffect(true);
  } else {
    title.textContent = "Mission failed!";
    message.textContent = "You did not collect enough water.";
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
  updateScore();
  updateTimer();

  gameContainer.querySelectorAll(".water-drop").forEach((drop) => drop.remove());
  document.getElementById("confetti-layer").innerHTML = "";
  document.getElementById("result-popup").classList.add("hidden");
  document.getElementById("start-btn").textContent = "Start Game";
}

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  score = 0;
  timeLeft = 30;
  dropCount = 0;
  updateScore();
  updateTimer();

  const gameContainer = document.getElementById("game-container");
  gameContainer.querySelectorAll(".water-drop").forEach((drop) => drop.remove());

  gameRunning = true;
  document.getElementById("confetti-layer").innerHTML = "";
  document.getElementById("result-popup").classList.add("hidden");
  document.getElementById("start-btn").textContent = "Playing...";

  const spawnSchedule = [900, 500, 250];
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

  if (dropCount % 10 === 0) {
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
