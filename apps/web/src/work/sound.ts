let alarmAudio: HTMLAudioElement | null = null;
let countdownAudio: HTMLAudioElement | null = null;

export const preloadSounds = () => {
  if (typeof window === "undefined") return;
  alarmAudio = new Audio("/sounds/alarm.wav");
  countdownAudio = new Audio("/sounds/countdown.wav");
};

export const playAlarmSound = () => {
  if (!alarmAudio) preloadSounds();
  alarmAudio?.play().catch((e) => console.warn("Could not play alarm:", e));
};

export const playCountdownSound = () => {
  if (!countdownAudio) preloadSounds();
  countdownAudio
    ?.play()
    .catch((e) => console.warn("Could not play countdown:", e));
};
