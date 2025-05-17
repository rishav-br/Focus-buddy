(() => {
  const app = document.getElementById('app');
  const tabs = ['timer', 'tasks', 'journal', 'analytics'];
  let currentTab = 'timer';

  // Timer Elements
  const timerLabel = document.getElementById('timer-label');
  const timerDisplay = document.getElementById('timer-display');
  const startPauseBtn = document.getElementById('start-pause-btn');
  const resetBtn = document.getElementById('reset-btn');
  const focusInput = document.getElementById('focus-minutes');
  const shortBreakInput = document.getElementById('short-break');
  const longBreakInput = document.getElementById('long-break');

  // Task Elements
  const tasksList = document.getElementById('tasks-list');
  const newTaskInput = document.getElementById('new-task-input');
  const taskPrioritySelect = document.getElementById('task-priority');
  const addTaskBtn = document.getElementById('add-task-btn');

  // Journal Elements
  const moodSelect = document.getElementById('mood-select');
  const energySelect = document.getElementById('energy-select');
  const journalEntry = document.getElementById('journal-entry');

  // Motivation Elements
  const motivationDiv = document.getElementById('motivation');
  const hearQuoteBtn = document.getElementById('hear-quote');
  const quotes = [
    "Stay positive, work hard, make it happen!",
    "Focus on being productive instead of busy.",
    "Every minute counts. Keep pushing!",
    "You’re capable of amazing things!",
    "Small steps lead to big results."
  ];
  let quoteIndex = 0;

  // Analytics Elements
  const analyticsBars = document.getElementById('analytics-bars');
  const streakCountSpan = document.getElementById('streak-count');
  const productivityScoreSpan = document.getElementById('productivity-score');
  const weeklyFocusMinutes = [120, 150, 100, 180, 200, 90, 130];
  const streakCount = 4;
  const productivityScore = 85;

  // Timer state
  let phase = 'focus';
  let timerSeconds = parseInt(focusInput.value) * 60;
  let timerRunning = false;
  let timerInterval = null;
  let completedCycles = 0;

  // Show/hide tabs
  function showTab(tab) {
    tabs.forEach(t => {
      const section = document.getElementById(t + '-section');
      if (section) section.style.display = t === tab ? 'block' : 'none';
      const btn = document.querySelector(`nav button[data-tab="${t}"]`);
      if (btn) {
        btn.classList.toggle('active', t === tab);
        btn.setAttribute('aria-current', t === tab ? 'page' : 'false');
      }
    });
    currentTab = tab;
  }
  showTab('timer');

  // Timer display formatting
  function formatSeconds(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  function updateTimerDisplay() {
    const labelMap = { focus: 'Focus Session', shortBreak: 'Short Break', longBreak: 'Long Break' };
    timerLabel.textContent = labelMap[phase] || 'Focus Session';
    timerDisplay.textContent = formatSeconds(timerSeconds);
    startPauseBtn.textContent = timerRunning ? 'Pause' : 'Start';
  }

  // Timer tick
  function timerTick() {
    if (timerRunning) {
      timerSeconds--;
      if (timerSeconds < 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        handleTimerEnd();
        return;
      }
      updateTimerDisplay();
    }
  }
  function handleTimerEnd() {
    if (phase === 'focus') {
      completedCycles++;
      if (completedCycles % 4 === 0) {
        phase = 'longBreak';
        timerSeconds = parseInt(longBreakInput.value) * 60;
        alert('Long break! Relax and recharge.');
      } else {
        phase = 'shortBreak';
        timerSeconds = parseInt(shortBreakInput.value) * 60;
        alert('Short break! Breathe and relax.');
      }
    } else {
      phase = 'focus';
      timerSeconds = parseInt(focusInput.value) * 60;
      alert('Back to focus!');
    }
    updateTimerDisplay();
  }
  startPauseBtn.onclick = () => {
    if (timerRunning) {
      clearInterval(timerInterval);
      timerRunning = false;
    } else {
      timerRunning = true;
      timerInterval = setInterval(timerTick, 1000);
    }
    updateTimerDisplay();
  };
  resetBtn.onclick = () => {
    clearInterval(timerInterval);
    timerRunning = false;
    timerSeconds = (phase === 'focus' ? parseInt(focusInput.value) :
      phase === 'shortBreak' ? parseInt(shortBreakInput.value) :
        parseInt(longBreakInput.value)) * 60;
    updateTimerDisplay();
  };

  [focusInput, shortBreakInput, longBreakInput].forEach(input => {
    input.addEventListener('change', () => {
      if (phase === 'focus') timerSeconds = parseInt(focusInput.value) * 60;
      else if (phase === 'shortBreak') timerSeconds = parseInt(shortBreakInput.value) * 60;
      else timerSeconds = parseInt(longBreakInput.value) * 60;
      updateTimerDisplay();
    });
  });
  updateTimerDisplay();

  // Task manager logic
  let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  function saveTasks() { localStorage.setItem('tasks', JSON.stringify(tasks)); }
  function renderTasks() {
    tasksList.innerHTML = '';
    tasks.forEach(task => {
      const taskDiv = document.createElement('div');
      taskDiv.className = 'task-item';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;
      checkbox.className = 'task-checkbox';
      checkbox.setAttribute('aria-label', 'Mark task as done: ' + task.text);
      checkbox.addEventListener('change', () => {
        task.done = checkbox.checked;
        saveTasks();
        renderTasks();
      });
      const textSpan = document.createElement('span');
      textSpan.className = 'task-text' + (task.done ? ' done' : '');
      textSpan.textContent = task.text;
      const prioritySpan = document.createElement('span');
      prioritySpan.className = 'task-priority priority-' + task.priority;
      prioritySpan.textContent = task.priority;
      const delBtn = document.createElement('span');
      delBtn.className = 'task-delete';
      delBtn.setAttribute('role', 'button');
      delBtn.setAttribute('tabindex', '0');
      delBtn.setAttribute('aria-label', 'Delete task ' + task.text);
      delBtn.textContent = '✕';
      delBtn.onclick = () => {
        if (confirm('Delete task "' + task.text + '" ?')) {
          tasks = tasks.filter(t => t !== task);
          saveTasks();
          renderTasks();
        }
      };
      delBtn.onkeypress = e => {
        if (e.key === 'Enter') delBtn.onclick();
      };
      taskDiv.appendChild(checkbox);
      taskDiv.appendChild(textSpan);
      taskDiv.appendChild(prioritySpan);
      taskDiv.appendChild(delBtn);
      tasksList.appendChild(taskDiv);
    });
  }
  addTaskBtn.onclick = () => {
    const text = newTaskInput.value.trim();
    const priority = taskPrioritySelect.value;
    if (text) {
      tasks.unshift({ text, priority, done: false });
      saveTasks();
      renderTasks();
      newTaskInput.value = '';
      taskPrioritySelect.value = 'Normal';
    }
  };
  renderTasks();

  // Journal logic
  moodSelect.value = localStorage.getItem('dailyMood') || '3';
  energySelect.value = localStorage.getItem('dailyEnergy') || '3';
  journalEntry.value = localStorage.getItem('journalEntry') || '';
  moodSelect.addEventListener('change', () => localStorage.setItem('dailyMood', moodSelect.value));
  energySelect.addEventListener('change', () => localStorage.setItem('dailyEnergy', energySelect.value));
  journalEntry.addEventListener('input', () => localStorage.setItem('journalEntry', journalEntry.value));

  // Motivational quotes with soulful voice
  hearQuoteBtn.onclick = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(quotes[quoteIndex]);
      const voices = window.speechSynthesis.getVoices();
      // Choose a softer, more soulful voice if available
      let soulfulVoice = voices.find(v =>
        /(english|uk|female|sarah|kate)/i.test(v.name)
      );
      if (!soulfulVoice) soulfulVoice = voices[0];
      utter.voice = soulfulVoice;
      utter.rate = 0.85;
      utter.pitch = 1.3;
      window.speechSynthesis.speak(utter);
    } else alert('Speech synthesis not supported.');
  };
  function cycleQuote() {
    quoteIndex = (quoteIndex + 1) % quotes.length;
    motivationDiv.textContent = '"' + quotes[quoteIndex] + '"';
  }
  setInterval(cycleQuote, 15000);

  // Analytics bars
  function renderAnalytics() {
    analyticsBars.innerHTML = '';
    const maxM = Math.max(...weeklyFocusMinutes);
    weeklyFocusMinutes.forEach((min, idx) => {
      const bar = document.createElement('div');
      bar.className = 'analytics-bar';
      const fill = document.createElement('div');
      fill.className = 'analytics-bar-fill';
      fill.style.height = (min / maxM * 100) + '%';
      fill.title = min + ' minutes focused';
      const label = document.createElement('div');
      label.className = 'analytics-bar-label';
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      const di = (today.getDay() - 6 + idx + 7) % 7;
      label.textContent = days[di];
      bar.appendChild(fill);
      bar.appendChild(label);
      analyticsBars.appendChild(bar);
    });
    streakCountSpan.textContent = streakCount;
    productivityScoreSpan.textContent = productivityScore;
  }
  renderAnalytics();

  // Navigation buttons
  document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      showTab(btn.getAttribute('data-tab'));
    });
  });

  // Theme toggle logic
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    const currentTheme = app.getAttribute('data-theme');
    if (currentTheme === 'light') {
      app.setAttribute('data-theme', 'dark');
      themeToggle.innerHTML = '🌞 <span>Light Mode</span>';
      // Adjust body background for dark
      document.body.style.background = 'linear-gradient(135deg, #2f2d4e 0%, #1a1a34 100%)';
      // Adjust text color
      app.style.color = '#d0d3f0';
      app.style.background = '#1a1a34cc';
    } else {
      app.setAttribute('data-theme', 'light');
      themeToggle.innerHTML = '🌙 <span>Dark Mode</span>';
      document.body.style.background = 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)';
      app.style.color = '#2d3a6a';
      app.style.background = '#f0f4ffcc';
    }
  });
  // Accessibility: allow Enter & Space keys on theme toggle
  themeToggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      themeToggle.click();
    }
  });
})();
