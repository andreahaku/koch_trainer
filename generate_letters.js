const fs = require("fs").promises;
const wav = require("wav");
const path = require("path");

const morseCode = {
  K: "-.-",
  M: "--",
  R: ".-.",
  S: "...",
  U: "..-",
  A: ".-",
  P: ".--.",
  T: "-",
  L: ".-..",
  O: "---",
  W: ".--",
  I: "..",
  N: "-.",
  J: ".---",
  F: "..-.",
  D: "-..",
  X: "-..-",
  B: "-...",
  C: "-.-.",
  Y: "-.--",
  Z: "--..",
  G: "--.",
  Q: "--.-",
  V: "...-",
  5: ".....",
  H: "....",
  3: "...--",
  4: "....-",
  6: "-....",
  7: "--...",
  8: "---..",
  9: "----.",
  2: "..---",
  1: ".----",
  0: "-----",
  E: ".",
  // Punctuation
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
};

const commonCWWords = [
  "CQ",
  "QRZ",
  "QTH",
  "QSL",
  "QSO",
  "QRM",
  "QRN",
  "QSY",
  "QRP",
  "DE",
  "RST",
  "73",
  "88",
  "PSE",
  "TNX",
  "HW",
  "BK",
  "KN",
  "K",
  "AR",
  "SK",
  "R",
  "ANT",
  "PWR",
  "WX",
  "NAME",
  "RIG",
  "HR",
  "FB",
  "GA",
  "GM",
  "GE",
  "HI",
  "VY",
  "ES",
  "OM",
  "YL",
  "EL",
  "DX",
  "TEST",
  "NR",
  "AGN",
  "PWR",
  "WID",
  "W/O",
  "SIGS",
  "CFM",
  "RPRT",
  "RIG",
  "73",
];

const sampleRate = 8000; // Sample rate in Hz
const defaultFrequency = 550; // Frequency in Hz

function createTone(duration, frequency = defaultFrequency) {
  const numSamples = Math.floor(duration * sampleRate);
  const buffer = Buffer.alloc(numSamples * 2); // 2 bytes per sample

  for (let i = 0; i < numSamples; ++i) {
    const sample = Math.round(
      32767 * Math.sin((2 * Math.PI * frequency * i) / sampleRate)
    );
    if (i * 2 < buffer.length) {
      buffer.writeInt16LE(sample, i * 2);
    }
  }

  return buffer;
}

async function generateMorseCodeWav(character, code, wpm, outputDirectory) {
  const ditDuration = 1.2 / wpm; // Dit duration in seconds

  try {
    await fs.mkdir(outputDirectory, { recursive: true });

    const filePath = path.join(outputDirectory, `${character}.wav`);
    await new Promise((resolve, reject) => {
      const writer = new wav.FileWriter(filePath, {
        channels: 1,
        sampleRate: sampleRate,
        bitDepth: 16,
      });

      writer.on("error", reject);
      writer.on("finish", resolve);

      for (const symbol of code) {
        if (symbol === ".") {
          writer.write(createTone(ditDuration)); // Dot duration
        } else if (symbol === "-") {
          writer.write(createTone(ditDuration * 3)); // Dash duration
        }
        writer.write(createTone(ditDuration, 0)); // Pause
      }

      writer.end();
    });
  } catch (error) {
    console.error(`Error generating WAV for ${character}:`, error);
  }
}

async function main() {
  for (let wpm = 15; wpm <= 40; wpm += 5) {
    const wpmDirectory = path.join(__dirname, "wav", `wpm_${wpm}`);

    const allEntries = {
      ...morseCode,
      // ...Object.fromEntries(
      //   commonCWWords.map((word) => [
      //     word,
      //     word
      //       .split("")
      //       .map((char) => morseCode[char.toUpperCase()] || "")
      //       .join(" "),
      //   ])
      // ),
    };

    const promises = Object.entries(allEntries).map(([entry, code]) =>
      generateMorseCodeWav(entry, code, wpm, wpmDirectory)
    );

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error("Error generating WAV files:", error);
    }
  }
}

main();
