# 🍆 Project Goonodoro

A no-nonsense Pomodoro timer built for the gooniverse. Stay locked in, take your breaks, repeat.

## Live

**[goonodoro.oaln04.xyz](https://goonodoro.oaln04.xyz)**

## Features

- Custom work and break durations — set your own session length, no defaults forced on you
- Auto-looping work → break → work cycle — no manual restart needed
- Smooth audio chimes on mode transitions — sine wave with fade envelope, distinct tones for work end vs break end
- Session counter — tracks how many Pomodoros you've completed this sitting
- Dynamic glow states — card border and ambient overlay shift color based on current mode (running, paused, break)
- Dynamic mode label — color changes with each state for instant visual feedback
- Ghost-style Reset button — visually distinct from Start/Pause to prevent accidental resets
- Zero dependencies — pure HTML, CSS, and Vanilla JavaScript

## How to Run

No installs. No build tools. No dependencies.

Clone the repo and open `index.html` in your browser, or visit the live site above.

## Built With

- HTML5
- CSS3 (Flexbox, CSS transitions, ambient glow effects)
- Vanilla JavaScript (Web Audio API, DOM manipulation, interval-based timer logic)
- Bebas Neue — Google Fonts

## Roadmap

- [x] Custom work / break durations
- [x] Auto-start break timer after session ends
- [x] Audio notification when session ends
- [x] Session counter
- [ ] Lifetime session counter per user (Supabase backend)
- [ ] Email authentication
- [ ] Leaderboard — most sessions completed
- [ ] Keyboard shortcuts
- [ ] Progress bar

---

*Built by Omar Al Nuaimi*