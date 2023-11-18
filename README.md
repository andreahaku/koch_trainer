# Koch Trainer

## Introduction

The Koch Trainer is a tool designed to help individuals learn and practice Morse code (CW) using the Koch method. The Koch method is a highly effective technique for learning Morse code by progressively introducing characters at higher speeds. This project includes tools for generating Morse code WAV files and a training program for practicing CW.

## Getting Started

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/your-username/koch-trainer.git
   cd koch-trainer
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Generate Morse Code WAV Files:

   To generate the Morse code WAV files, use the following command:

   ```bash
   npm run generate-letters
   ```

   This will create WAV files for Morse code characters at different speeds (WPM).

4. Run the CW Training Program:

   To start the CW training program, use the following command:

   ```bash
   npm run lessons
   ```

   Follow the on-screen instructions to select the training parameters, including WPM, lesson number, and duration.

## Morse Code Lessons

The training program will guide you through Morse code lessons using the Koch method. Here's a brief overview:

- Choose a Words-Per-Minute (WPM) speed from 15, 20, 25, 30, 35, or 40.
- Select a lesson number from 1 to the maximum available lesson.
- Set the duration of the training session in minutes.
- The program will play Morse code characters at the selected speed, and you'll be prompted to type the corresponding character.
- The program will adjust the difficulty based on your performance, focusing on characters you find challenging.

## Koch Method

The Koch method is an effective way to learn Morse code by starting with just two characters and progressively adding more as you become proficient. It's a proven technique for building strong Morse code skills quickly.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- The Koch method, developed by Friedrich Koch, has been widely adopted for Morse code training.
- Special thanks to the authors and contributors of the dependencies used in this project.

Happy CW learning!
