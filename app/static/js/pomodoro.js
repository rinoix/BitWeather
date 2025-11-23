import { store } from './store.js';

const { createApp, ref, computed, onMounted, onUnmounted } = Vue;

const pomodoroApp = createApp({
  setup() {

        const playWorkEndSound = () => {
      const a = document.getElementById('work-end-sound');
      if (a) { a.currentTime = 0; a.play(); }
    };

    const playBreakEndSound = () => {
      const a = document.getElementById('break-end-sound');
      if (a) { a.currentTime = 0; a.volume = 0.5; a.play(); }
    };

    const timer = ref(25 * 60);
    const isRunning = ref(false);
    let timerInterval = null;

    const sessions = ['work','shortBreak','work','shortBreak','work','shortBreak','work','longBreak'];
    const sessionTimes = { work: 25*60, shortBreak: 5*60, longBreak: 15*60 };
    const sessionLabels = { work: '作業', shortBreak: '短い休憩', longBreak: '長い休憩' };
    let currentSessionIndex = 0;
    const currentSession = ref(sessions[currentSessionIndex]);

    const moveToNextSession = () => {
      currentSessionIndex = (currentSessionIndex + 1) % sessions.length;
      currentSession.value = sessions[currentSessionIndex];
      timer.value = sessionTimes[currentSession.value];
    };

    const startTimer = () => {
      if (timerInterval) return;

      isRunning.value = true;
      timerInterval = setInterval(() => {

        if (timer.value > 0) {
          timer.value--;

          if (timer.value === 0) {
            if (currentSession.value === 'work') {
              playWorkEndSound();
            } else {
              playBreakEndSound();
            }
          }

        } else {
          moveToNextSession();
        }

      }, 1000);
    };

    const stopTimer = () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      isRunning.value = false;
    };

    const toggleTimer = () => {
      if (isRunning.value) stopTimer();
      else startTimer();
    };

    const skipSession = () => {
      stopTimer();
      moveToNextSession();
    };

    const formattedTimer = computed(() => {
      const m = Math.floor(timer.value / 60).toString().padStart(2,'0');
      const s = (timer.value % 60).toString().padStart(2,'0');
      return `${m}:${s}`;
    });

    const sessionLabel = computed(() => sessionLabels[currentSession.value]);

    const toggleMainContainerClass = (on) => {
      const container = document.querySelector('#mainApp .front-container');
      if (!container) return;
      if (on) container.classList.add('pomodoro-shift');
      else container.classList.remove('pomodoro-shift');
    };

    const togglePomodoro = () => {
      if (store.showPomodoro && isRunning.value) {
        stopTimer();
      }
      store.showPomodoro = !store.showPomodoro;
      toggleMainContainerClass(store.showPomodoro);
    };

    onMounted(() => {
      toggleMainContainerClass(store.showPomodoro);
    });

    onUnmounted(() => {
      stopTimer();
    });

    return {
      store,
      timer,
      isRunning,
      formattedTimer,
      sessionLabel,
      toggleTimer,
      skipSession,
      togglePomodoro
    };
  }
});

pomodoroApp.config.compilerOptions.delimiters = ['[[', ']]'];
pomodoroApp.mount('#pomodoro');
