A modern, responsive **Block Blast** puzzle game featuring a cute Hello Kitty theme, dynamic score-roll animations, scaling combo sound effects, and full **Progressive Web App (PWA)** support.

---

## 🌟 Key Features

* **Classic Block Blast Gameplay:** Drag and drop block shapes onto the 8x8 grid to clear full rows and columns for points!
* **Hello Kitty Mascot:** Features a cute mascot that reacts dynamically and turns happy upon successful line clears.
* **Combo System:** Clear lines consecutively to increase your multiplier and play progressively pitch-scaled combo sounds (Combo 1–10).
* **Arcade Game Over Experience:**
  * Clean, full-screen UI design without card containers.
  * Dramatic **4-second score roll animation** counting up from $0$ to your final score.
  * Glowing yellow **`NEW HIGHSCORE!`** highlight whenever a record is broken.
  * Randomized fun Game Over messages.
  * Smooth, springy pop-up animation for the *New Game* button after a subtle 0.5s pause.
* **PWA & Offline Support:** Installable on iOS and Android home screens, fully playable without an internet connection thanks to Service Worker caching.
* **Audio Control:** Toggle sound effects on/off instantly with a dedicated Mute button.

---

## 🛠️ Tech Stack

* **HTML5 Canvas:** Renders the main game board, shapes, line clear animations, and drag-and-drop overlays.
* **CSS3:** Fullscreen layouts, custom UI components, and `cubic-bezier` pop-up animations.
* **Vanilla JavaScript (ES Modules):** Clean, modular codebase built without external frameworks.
* **Web Audio API & HTML5 Audio:** Dynamic audio handling and multi-channel sound playback.
* **Service Worker:** Offline-first caching strategy via the Cache API.

---

## 📁 Project Structure

```
├── etc/
├── scripts/
│   ├── audio.js              # Audio controller & sound playback logic
│   ├── logic.js              # Core game mechanics (piece placement, clearing)
│   ├── main.js               # Event handling, rendering & Game Over flow
│   ├── pieces.js             # Shape definitions and block templates
│   └── state.js              # Global state management & high score storage
├── sounds/                   # Sound effects (woosh, place, gameover, combo1-10)
├── deploy.bat                # Automated deployment script
├── gradient_horizontal.png   # Line clear highlight asset
├── gradient_vertical.png     # Line clear highlight asset
├── happykitty.png            # Mascot image for successful moves
├── hellokitty.png            # Default mascot image
├── icon.png                  # App icon for PWA
├── index.html                # Main HTML entry point & overlays
├── manifest.json             # PWA configuration manifest
├── style.css                 # Global full-screen styling & transitions
├── sw.js                     # Service Worker for offline asset caching
└── the_object.png            # Main block sprite asset

```


---

## 🚀 Local Development

Since this project utilizes native **ES Modules** (`import/export`), it requires a local web server to run properly:

1. **Using VS Code Live Server**:

	-  Open the project folder in VS Code.
	-  Right click in the **index.html** file and click on **Open with Live Server**

2. **Using Python HTTP Server**:

```
python -m http.server 800
```
Then navigate to `http://localhost:8000` in your web browser.

## 📱 Mobile Installation (PWA)

1. Open the game's URL on your mobile browser (Safari on iOS or Chrome on Android).
2. Tap the **Share / Options** menu button.
3. Select **Add to Home Screen.**
4. Launch the app directly from your home screen for an immersive, full-screen experience!

## 📜 License

Created as a hobby project. Feel free to use, modify, and play! 💖
