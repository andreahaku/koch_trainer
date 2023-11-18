const readline = require("readline");
const path = require("path");
const player = require("play-sound")();

const kochSequence = "KMRSUAPTLOWINJFXBDCYZGQVH3456789201E";
let globalLessonNumber;
const letterWeights = {};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function playLetter(wpm, character) {
  const filePath = path.join(
    __dirname,
    "wav",
    `wpm_${wpm}`,
    `${character}.wav`
  );
  player.play(filePath, function (err) {
    if (err) console.error("Error playing sound:", err);
  });
}

function initializeWeights(lessonCharacters) {
  lessonCharacters.split("").forEach((char) => {
    letterWeights[char] = 100; // Reset weight to 100 for each letter in the lesson
  });
}

// Initialize a new object to track performance for each letter
const letterPerformance = {};

function initializePerformance(lessonCharacters) {
  lessonCharacters.split("").forEach((char) => {
    letterPerformance[char] = { correctStreak: 0, incorrectStreak: 0 };
  });
}

function adjustWeight(character, isCorrect) {
  if (isCorrect) {
    letterPerformance[character].correctStreak++;
    letterPerformance[character].incorrectStreak = 0;
    // Decrease weight more if on a correct streak
    const decreaseAmount = Math.min(
      10 + letterPerformance[character].correctStreak,
      20
    );
    letterWeights[character] = Math.max(
      10,
      letterWeights[character] - decreaseAmount
    ); // Minimum weight is 10
  } else {
    letterPerformance[character].correctStreak = 0;
    letterPerformance[character].incorrectStreak++;
    // Increase weight more if on an incorrect streak
    const increaseAmount = Math.min(
      10 + letterPerformance[character].incorrectStreak * 2,
      30
    );
    letterWeights[character] = Math.min(
      100,
      letterWeights[character] + increaseAmount
    ); // Maximum weight is 100
  }
}

function weightedRandom(lessonCharacters) {
  let totalWeight = 0;
  let ranges = lessonCharacters.split("").map((char) => {
    totalWeight += letterWeights[char];
    return { char, end: totalWeight };
  });

  let randomNum = Math.random() * totalWeight;
  return ranges.find((range) => randomNum <= range.end).char;
}

async function startTraining(wpm, lessonNumber, duration) {
  const lessonCharacters = kochSequence.substring(0, lessonNumber + 1);
  initializeWeights(lessonCharacters);
  initializePerformance(lessonCharacters); // Initialize performance tracking

  console.log(`\n--- Lesson ${lessonNumber} ---`);
  console.log(
    `Letters in this lesson: ${lessonCharacters.split("").join(", ")}\n`
  );

  const endTime = Date.now() + duration * 60000;
  let correct = 0,
    total = 0;

  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  console.log(
    "Type the letters as they are played. Press 'ESC' to quit early."
  );

  const displayWeights = () => {
    return lessonCharacters
      .split("")
      .map((char) => `${char}: ${letterWeights[char]}`)
      .join(", ");
  };

  const playNextLetter = () => {
    if (Date.now() >= endTime) {
      process.stdin.pause();
      console.log(
        `\nTotal letters: ${total}, Accuracy: ${(
          (correct / total) *
          100
        ).toFixed(2)}%`
      );
      setTimeout(() => askNextAction(wpm, duration), 5000); // Wait 5 seconds
      return;
    }

    const randomChar = weightedRandom(lessonCharacters);
    playLetter(wpm, randomChar);

    console.log(`Weights: ${displayWeights()}`); // Display current weights

    process.stdin.once("keypress", (str, key) => {
      if (key.name === "escape") {
        process.stdin.pause();
        console.log(
          `\nTotal letters: ${total}, Accuracy: ${(
            (correct / total) *
            100
          ).toFixed(2)}%`
        );
        process.exit();
      }

      const isCorrect = str.toUpperCase() === randomChar;
      adjustWeight(randomChar, isCorrect);

      if (isCorrect) {
        correct++;
      } else {
        console.error(`Incorrect. The correct letter was '${randomChar}'.`);
      }

      total++;
      playNextLetter();
    });
  };

  playNextLetter();
}

async function askNextAction(wpm, duration) {
  console.log(
    "Continue with next lesson (c), repeat this lesson (r), or exit (e)?"
  );

  process.stdin.resume();
  process.stdin.on("keypress", (str, key) => {
    if (key && key.name === "escape") {
      console.log("Exiting training session.");
      process.exit();
    }

    const action = str.toLowerCase();
    if (action === "c" || action === "r" || action === "e") {
      process.stdin.removeAllListeners("keypress"); // Remove keypress listener

      switch (action) {
        case "c":
          globalLessonNumber++;
          startTraining(wpm, globalLessonNumber, duration);
          break;
        case "r":
          startTraining(wpm, globalLessonNumber, duration);
          break;
        case "e":
          console.log("Exiting training session.");
          process.exit();
          break;
      }
    }
  });
}

async function initiateTraining() {
  const wpm = await askQuestion("Enter WPM (15, 20, 25, 30, 35, 40): ");
  globalLessonNumber = parseInt(
    await askQuestion(
      "Enter lesson number (1 to " + (kochSequence.length - 1) + "): "
    ),
    10
  );
  const duration = parseInt(
    await askQuestion("Enter duration in minutes: "),
    10
  );

  startTraining(wpm, globalLessonNumber, duration);
}

initiateTraining();
