let alarmAudio: HTMLAudioElement | null = null;
let countdownAudio: HTMLAudioElement | null = null;
let alarmTimeout: NodeJS.Timeout | null = null;
let countdownTimeout: NodeJS.Timeout | null = null;

export const preloadSounds = () => {
  if (typeof window === "undefined") return;
  alarmAudio = new Audio("/sounds/alarm.wav");
  countdownAudio = new Audio("/sounds/countdown.wav");
};

export const playAlarmSound = () => {
  if (!alarmAudio) preloadSounds();

  // Clear existing timeout if any
  if (alarmTimeout) {
    clearTimeout(alarmTimeout);
    alarmTimeout = null;
  }

  // Reset and play
  if (alarmAudio) {
    alarmAudio.currentTime = 0;
    alarmAudio.play().catch((e) => console.warn("Could not play alarm:", e));

    // Pause after 2 seconds
    alarmTimeout = setTimeout(() => {
      if (alarmAudio) {
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
      }
      alarmTimeout = null;
    }, 2000);
  }
};

export const playCountdownSound = () => {
  if (!countdownAudio) preloadSounds();

  // Clear existing timeout if any
  if (countdownTimeout) {
    clearTimeout(countdownTimeout);
    countdownTimeout = null;
  }

  // Reset and play
  if (countdownAudio) {
    countdownAudio.currentTime = 0;
    countdownAudio
      .play()
      .catch((e) => console.warn("Could not play countdown:", e));

    // Pause after 5 seconds
    countdownTimeout = setTimeout(() => {
      if (countdownAudio) {
        countdownAudio.pause();
        countdownAudio.currentTime = 0;
      }
      countdownTimeout = null;
    }, 5000);
  }
};
