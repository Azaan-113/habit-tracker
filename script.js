
const habitInput = document.getElementById("habitInput");
const addHabitBtn = document.getElementById("addHabitBtn");
const habitList = document.getElementById("habitList");

const totalHabits = document.getElementById("totalHabits");
const completedHabits = document.getElementById("completedHabits");
const progress = document.getElementById("progress");
const progressFill = document.getElementById("progressFill");

const streakCount = document.getElementById("streakCount");
const todayDate = document.getElementById("todayDate");
const weeklyActivity = document.getElementById("weeklyActivity");

// Get today's date in local time
function getDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

let currentDate = getDateKey();

// Load saved habits and completed days
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let completedDays =
    JSON.parse(localStorage.getItem("completedDays")) || [];

// Reset habits when a new day starts
habits.forEach(habit => {
    if (habit.date !== currentDate) {
        habit.completed = false;
        habit.date = currentDate;
    }
});

// Save everything
function saveHabits() {
    habits.forEach(habit => {
        habit.date = currentDate;
    });

    localStorage.setItem("habits", JSON.stringify(habits));
    localStorage.setItem(
        "completedDays",
        JSON.stringify(completedDays)
    );
}

// Record whether all habits are completed today
function syncTodayCompletion() {
    const allCompleted =
        habits.length > 0 &&
        habits.every(habit => habit.completed);

    if (allCompleted) {
        if (!completedDays.includes(currentDate)) {
            completedDays.push(currentDate);
        }
    } else {
        completedDays = completedDays.filter(
            day => day !== currentDate
        );
    }
}

// Add a new habit
function addHabit() {
    const habitName = habitInput.value.trim();

    if (habitName === "") {
        alert("Please enter a habit!");
        return;
    }

    habits.push({
        id: Date.now(),
        name: habitName,
        completed: false,
        date: currentDate
    });

    habitInput.value = "";

    renderHabits();
}

// Delete a habit
function deleteHabit(id) {
    habits = habits.filter(habit => habit.id !== id);
    renderHabits();
}

// Mark habit as completed
function toggleHabit(id) {
    const habit = habits.find(habit => habit.id === id);

    if (habit) {
        habit.completed = !habit.completed;
    }

    renderHabits();
}

// Display habits
function renderHabits() {
    habitList.innerHTML = "";

    if (habits.length === 0) {
        habitList.innerHTML =
            '<p class="empty-message">No habits yet. Add your first habit!</p>';
    }

    habits.forEach(habit => {
        const habitItem = document.createElement("div");

        habitItem.className = habit.completed
            ? "habit-item completed"
            : "habit-item";

        const left = document.createElement("div");
        left.className = "habit-left";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = habit.completed;

        checkbox.addEventListener("change", () => {
            toggleHabit(habit.id);
        });

        const name = document.createElement("span");
        name.textContent = habit.name;

        left.appendChild(checkbox);
        left.appendChild(name);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            deleteHabit(habit.id);
        });

        habitItem.appendChild(left);
        habitItem.appendChild(deleteButton);

        habitList.appendChild(habitItem);
    });

    updateProgress();
    saveHabits();
}

// Update progress statistics
function updateProgress() {
    const total = habits.length;

    const completed = habits.filter(
        habit => habit.completed
    ).length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    totalHabits.textContent = total;
    completedHabits.textContent = completed;
    progress.textContent = percentage + "%";

    progressFill.style.width = percentage + "%";

    syncTodayCompletion();
    updateStreak();
    updateWeeklyActivity();
}

// Display today's date
function displayDate() {
    todayDate.textContent = new Date().toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short"
        }
    );
}

// Calculate consecutive completed days
function updateStreak() {
    let streak = 0;

    let checkDate = new Date();

    if (!completedDays.includes(currentDate)) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (completedDays.includes(getDateKey(checkDate))) {
        streak++;

        checkDate.setDate(checkDate.getDate() - 1);
    }

    streakCount.textContent = streak + " 🔥";
}

// Display last 7 days
function updateWeeklyActivity() {
    weeklyActivity.innerHTML = "";

    for (let i = 6; i >= 0; i--) {
        const date = new Date();

        date.setDate(date.getDate() - i);

        const dateKey = getDateKey(date);

        const completed = completedDays.includes(dateKey);

        const dayName = date.toLocaleDateString(
            "en-IN",
            { weekday: "short" }
        );

        const dayBox = document.createElement("div");
        dayBox.className = "day-box";

        const bar = document.createElement("div");
        bar.className = completed
            ? "day-bar active"
            : "day-bar";

        bar.style.height = completed ? "65px" : "12px";

        const label = document.createElement("span");
        label.textContent = dayName;

        const status = document.createElement("small");
        status.textContent = completed ? "✓" : "–";

        dayBox.appendChild(bar);
        dayBox.appendChild(status);
        dayBox.appendChild(label);

        weeklyActivity.appendChild(dayBox);
    }
}

// Add habit button
addHabitBtn.addEventListener("click", addHabit);

// Add habit using Enter key
habitInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addHabit();
    }
});

// Initial display
displayDate();
renderHabits();
