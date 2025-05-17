// ====== Splash Screen Control ======
window.addEventListener('load', () => {
  const splash = document.getElementById('splash');
  setTimeout(() => {
    splash.style.opacity = '0';
    splash.style.pointerEvents = 'none';
  }, 2000);
});

// ====== Dark Mode Toggle ======
const darkModeToggle = document.getElementById('darkModeToggle');
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
}

darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
  } else {
    localStorage.setItem('darkMode', 'disabled');
  }
});

// ====== Pomodoro Timer ======
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-timer');
const pauseBtn = document.getElementById('pause-timer');
const resetBtn = document.getElementById('reset-timer');

let timeLeft = 25 * 60; // default 25 min
let timerInterval = null;

// Load saved timer state if any
const savedTime = localStorage.getItem('focusTimerTime');
if (savedTime) {
  timeLeft = parseInt(savedTime, 10);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
  localStorage.setItem('focusTimerTime', timeLeft);
}

function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      alert('🎉 Focus session complete! Take a short break.');
      timeLeft = 25 * 60;
      updateTimerDisplay();
      incrementStreak();
      showMotivation('You did it! Keep up the great work!');
    } else {
      timeLeft--;
      updateTimerDisplay();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  pauseTimer();
  timeLeft = 25 * 60;
  updateTimerDisplay();
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
updateTimerDisplay();

// ====== Goal Tracker ======
const addTaskBtn = document.getElementById('add-task-btn');
const newTaskInput = document.getElementById('new-task');
const taskList = document.getElementById('task-list');

// Load saved tasks
let tasks = JSON.parse(localStorage.getItem('focusTasks')) || [];

function saveTasks() {
  localStorage.setItem('focusTasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.textContent = task.text;
    li.className = task.completed ? 'completed-task' : '';
    li.addEventListener('click', () => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
    });

    // Add delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.className = 'delete-task-btn';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });
    li.appendChild(delBtn);

    taskList.appendChild(li);
  });
}

addTaskBtn.addEventListener('click', () => {
  const taskText = newTaskInput.value.trim();
  if (taskText.length > 0) {
    tasks.push({ text: taskText, completed: false });
    saveTasks();
    renderTasks();
    newTaskInput.value = '';
  }
});

renderTasks();

// ====== Mascot Chat - Motivational Messages ======
const chatMessage = document.getElementById('chat-message');
const motivationalMessages = [
  "Keep going, you’re doing amazing! 💪",
  "Remember, small steps lead to big changes.",
  "Focus Buddy believes in you! 🌟",
  "Stay positive and productive today!",
  "You’ve got this! Take it one step at a time.",
];

function showMotivation(message) {
  chatMessage.textContent = message;
}

function randomMotivation() {
  const msg = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  showMotivation(msg);
}

// Show motivation every 30 seconds during focus timer
setInterval(() => {
  if (timerInterval) {
    randomMotivation();
  }
}, 30000);

// ====== Distraction Blocker (Demo) ======
function blockDistractions() {
  const blockedSites = ['facebook.com', 'youtube.com', 'instagram.com'];
  const hostname = window.location.hostname;
  if (blockedSites.some(site => hostname.includes(site))) {
    alert('Focus Buddy says: Stay focused! Distractions are blocked during focus sessions.');
    window.location.href = 'about:blank'; // simple redirect
  }
}
// You can expand this by integrating focus session active checks, but demo only here.

// ====== Mood Tracker ======
const moodSelect = document.getElementById('mood-select');
const saveMoodBtn = document.getElementById('save-mood-btn');
const moodFeedback = document.getElementById('mood-feedback');

saveMoodBtn.addEventListener('click', () => {
  const mood = moodSelect.value;
  if (!mood) {
    moodFeedback.textContent = 'Please select a mood before saving.';
    moodFeedback.style.color = 'red';
    return;
  }
  localStorage.setItem('focusMood', mood);
  moodFeedback.textContent = `Mood saved: ${mood}`;
  moodFeedback.style.color = 'green';
});

// Load saved mood
const savedMood = localStorage.getItem('focusMood');
if (savedMood) {
  moodSelect.value = savedMood;
  moodFeedback.textContent = `Your saved mood: ${savedMood}`;
  moodFeedback.style.color = 'green';
}

// ====== Gamification: Streaks and Badges ======
function getStreak() {
  return parseInt(localStorage.getItem('focusStreak')) || 0;
}

function incrementStreak() {
  let streak = getStreak() + 1;
  localStorage.setItem('focusStreak', streak);
  showMotivation(`🔥 You're on a ${streak}-day streak! Keep it up!`);
}

function resetStreak() {
  localStorage.setItem('focusStreak', '0');
}

