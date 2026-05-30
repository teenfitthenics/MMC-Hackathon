console.log("SCRIPT LOADED");
/* =========================
   COURSE DATA
========================= */

const courses = [
    "HTML & CSS Basics",
    "JavaScript Essentials",
    "React Beginner",
    "UI/UX Design",
    "Python Basics",
    "Machine Learning"
];

// Search suggestion keyboard state
let suggestionIndex = -1;

function debounce(fn, wait) {
    let t;
    return function(...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}

/* =========================
   SEARCH SYSTEM
========================= */

function generateCourses() {

    const box = document.getElementById("suggestions");

    if (!box) return;

    box.innerHTML = "";
    box.style.display = "block";

    courses.forEach((course, idx) => {
        const div = document.createElement("div");
        div.className = "course";
        div.innerText = course;
        div.setAttribute('data-index', idx);
        div.tabIndex = -1;

        div.onclick = () => {
            const search = document.getElementById("search");
            if (search) {
                search.value = course;
                search.focus();
                searchCourses();
            }
            box.style.display = "none";
        };

        div.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                div.click();
            }
        });

        div.addEventListener('mouseover', () => {
            suggestionIndex = idx;
            highlightSuggestion(suggestionIndex);
        });

        box.appendChild(div);
    });
}

function clearHighlights() {
    document.querySelectorAll('.search-results .course.highlight').forEach(el => el.classList.remove('highlight'));
}

function highlightSuggestion(index) {
    const items = Array.from(document.querySelectorAll('.search-results .course'));
    clearHighlights();
    if (index < 0 || index >= items.length) return;
    const el = items[index];
    if (!el || el.classList.contains('no-results')) return;
    el.classList.add('highlight');
    el.scrollIntoView({block: 'nearest'});
}

function searchCourses() {

    const input = document.getElementById("search");

    const box = document.getElementById("suggestions");
    if (!input || !box) return;

    const value = input.value.trim().toLowerCase();
    if (value === "") {
        box.style.display = "none";
        return;
    } else {
        box.style.display = "block";
    }

    const items = document.querySelectorAll(".course");
    let any = false;
    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        const show = text.includes(value);
        item.style.display = show ? "block" : "none";
        if (show) any = true;
    });

    const no = box.querySelector('.no-results');
    if (!any) {
        if (!no) {
            const el = document.createElement('div');
            el.className = 'course no-results';
            el.innerText = 'No courses found';
            box.appendChild(el);
        }
    } else if (no) {
        no.remove();
    }

    // reset suggestion index to first visible
    const visible = Array.from(document.querySelectorAll('.search-results .course')).filter(el => el.style.display !== 'none' && !el.classList.contains('no-results'));
    suggestionIndex = visible.length ? Number(visible[0].dataset.index) : -1;
    if (suggestionIndex >= 0) highlightSuggestion(suggestionIndex);
}

/* =========================
   QUIZ SYSTEM
========================= */

let qIndex = 0;
let score = 0;
let selectedAnswer = null;

const quiz = [
    {
        q: "HTML is used for structure?",
        options: ["True", "False"],
        a: 0,
        hint: "HTML provides the content structure for web pages."
    },
    {
        q: "CSS is used for styling?",
        options: ["True", "False"],
        a: 0,
        hint: "CSS controls layout, colors, and typography."
    },
    {
        q: "JavaScript is only backend?",
        options: ["True", "False"],
        a: 1,
        hint: "JavaScript runs both in the browser and on servers."
    },
    {
        q: "React is a JavaScript library?",
        options: ["True", "False"],
        a: 0,
        hint: "React is used to build user interfaces."
    },
    {
        q: "CSS stands for Computer Style Sheets?",
        options: ["True", "False"],
        a: 1,
        hint: "CSS actually stands for Cascading Style Sheets."
    }
];

function loadQuiz() {
    const question = document.getElementById("question");
    const optionsContainer = document.getElementById("options");
    const indexLabel = document.getElementById("questionIndex");
    const progress = document.getElementById("quizProgress");
    const feedback = document.getElementById("feedback");
    const nextBtn = document.getElementById("nextBtn");
    const restartBtn = document.getElementById("restartBtn");
    const scoreElement = document.getElementById("score");

    if (!question || !optionsContainer || !indexLabel || !progress) return;

    selectedAnswer = null;
    if (feedback) feedback.innerText = "";
    if (scoreElement) scoreElement.innerText = "";
    if (restartBtn) restartBtn.hidden = true;
    if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.innerText = qIndex < quiz.length - 1 ? "Next" : "Finish";
    }

    const current = quiz[qIndex];
    indexLabel.innerText = `Question ${qIndex + 1} of ${quiz.length}`;
    question.innerText = current.q;
    progress.style.width = `${(qIndex / quiz.length) * 100}%`;

    optionsContainer.innerHTML = "";
    current.options.forEach((option, index) => {
        const button = document.createElement("button");
        button.className = "quiz-option";
        button.type = "button";
        button.innerText = option;
        button.onclick = () => selectOption(index);
        optionsContainer.appendChild(button);
    });
}

function selectOption(index) {
    selectedAnswer = index;
    document.querySelectorAll(".quiz-option").forEach((button, idx) => {
        button.classList.toggle("active", idx === index);
    });
    const feedback = document.getElementById("feedback");
    const current = quiz[qIndex];
    if (feedback) {
        feedback.innerText = `Hint: ${current.hint}`;
    }
}

function nextQuestion() {
    const feedback = document.getElementById("feedback");
    if (selectedAnswer === null) {
        if (feedback) feedback.innerText = "Please select an answer before continuing.";
        return;
    }

    if (selectedAnswer === quiz[qIndex].a) {
        score += 1;
    }

    qIndex += 1;

    if (qIndex < quiz.length) {
        loadQuiz();
    } else {
        showResults();
    }
}

function showResults() {
    const question = document.getElementById("question");
    const optionsContainer = document.getElementById("options");
    const scoreElement = document.getElementById("score");
    const progress = document.getElementById("quizProgress");
    const nextBtn = document.getElementById("nextBtn");
    const restartBtn = document.getElementById("restartBtn");
    const indexLabel = document.getElementById("questionIndex");

    if (!question || !optionsContainer || !scoreElement || !progress || !nextBtn || !restartBtn || !indexLabel) return;

    question.innerText = "Quiz Completed!";
    optionsContainer.innerHTML = "";
    progress.style.width = "100%";
    indexLabel.innerText = `Final Score`;
    scoreElement.innerHTML = `You answered <strong>${score}</strong> of <strong>${quiz.length}</strong> questions correctly.`;
    nextBtn.disabled = true;
    restartBtn.hidden = false;
}

function restartQuiz() {
    qIndex = 0;
    score = 0;
    selectedAnswer = null;

    const scoreElement = document.getElementById("score");
    const feedback = document.getElementById("feedback");

    if (scoreElement) scoreElement.innerText = "";
    if (feedback) feedback.innerText = "";

    loadQuiz();
}

/* =========================
   STUDY PLANNER
========================= */

let plannerFilter = "all";

function addTask() {
    const titleInput = document.getElementById("taskTitle");
    const dateInput = document.getElementById("taskDate");
    const categoryInput = document.getElementById("taskCategory");

    if (!titleInput || !dateInput || !categoryInput) return;

    const title = titleInput.value.trim();
    const due = dateInput.value;
    const category = categoryInput.value;

    if (title === "") return;

    const task = {
        title,
        due,
        category,
        completed: false,
        created: new Date().toISOString()
    };

    let tasks = [];

    try {
        tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    } catch (e) {
        tasks = [];
    }

    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    titleInput.value = "";
    dateInput.value = "";
    categoryInput.value = "Study";

    renderTasks();
}

function renderTasks() {
    const list = document.getElementById("list");
    const totalTasks = document.getElementById("totalTasks");
    const completedTasks = document.getElementById("completedTasks");
    const overdueTasks = document.getElementById("overdueTasks");

    if (!list) return;

    let tasks = [];
    try {
        tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    } catch (e) {
        tasks = [];
    }

    const now = new Date();
    const overdueCount = tasks.filter(task => task.due && new Date(task.due) < now && !task.completed).length;
    const completedCount = tasks.filter(task => task.completed).length;

    if (totalTasks) totalTasks.innerText = tasks.length;
    if (completedTasks) completedTasks.innerText = completedCount;
    if (overdueTasks) overdueTasks.innerText = overdueCount;

    list.innerHTML = "";

    const filtered = tasks
        .map((task, index) => ({ task, index }))
        .filter(({ task }) => {
            if (plannerFilter === "completed") return task.completed;
            if (plannerFilter === "active") return !task.completed;
            if (plannerFilter === "overdue") return task.due && new Date(task.due) < now && !task.completed;
            return true;
        });

    filtered.sort((a, b) => {
        if (!a.task.due) return 1;
        if (!b.task.due) return -1;
        return new Date(a.task.due) - new Date(b.task.due);
    });

    filtered.forEach(({ task, index }) => {
        const li = document.createElement("li");
        li.className = task.completed ? "planner-item completed" : "planner-item";

        const dueLabel = task.due ? formatDate(task.due) : "No due date";
        const overdueClass = task.due && new Date(task.due) < now && !task.completed ? " overdue" : "";

        li.innerHTML = `
            <div class="task-main${overdueClass}">
                <label class="task-checkbox">
                    <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask(${index})" />
                    <span>${task.title}</span>
                </label>
                <div class="task-meta">
                    <span class="task-category">${task.category}</span>
                    <span class="task-due">${dueLabel}</span>
                </div>
            </div>
            <button class="task-delete" onclick="deleteTask(${index})">Remove</button>
        `;

        list.appendChild(li);
    });
}

function toggleTask(index) {
    let tasks = [];
    try {
        tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    } catch (e) {
        tasks = [];
    }
    if (!tasks[index]) return;

    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
}

function deleteTask(index) {
    let tasks = [];
    try {
        tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    } catch (e) {
        tasks = [];
    }

    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
}

function setPlannerFilter(filter) {
    plannerFilter = filter;
    document.querySelectorAll(".filter-btn").forEach(button => {
        button.classList.toggle("active", button.innerText.toLowerCase() === filter);
    });
    renderTasks();
}

function formatDate(value) {
    const date = new Date(value);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* =========================
   DASHBOARD
========================= */

function loadDashboard() {

    const progressRing =
        document.getElementById("progressRing");
    const progressPercent =
        document.getElementById("progressPercent");
    const taskCountEl =
        document.getElementById("taskCount");
    const badgeCountEl =
        document.getElementById("badgeCount");
    const attendanceRateEl =
        document.getElementById("attendanceRate");
    const attendanceFill =
        document.getElementById("attendanceFill");
    const participationRateEl =
        document.getElementById("participationRate");
    const participationFill =
        document.getElementById("participationFill");
    const examCountdown =
        document.getElementById("examCountdown");
    const deadlineList =
        document.getElementById("deadlineList");

    if (!progressPercent || !taskCountEl || !badgeCountEl) return;

    const taskCount =
        JSON.parse(
            localStorage.getItem("tasks")
        )?.length || 0;

    const progressValue =
        Math.min(20 + taskCount * 12, 100);

    progressPercent.innerText =
        `${progressValue}%`;

    if (progressRing) {
        const circumference =
            2 * Math.PI * 52;
        progressRing.style.strokeDasharray =
            `${circumference}`;
        progressRing.style.strokeDashoffset =
            `${circumference - (progressValue / 100) * circumference}`;
    }

    taskCountEl.innerText =
        `${taskCount} Tasks`;
    badgeCountEl.innerText =
        `${Math.max(Math.floor(taskCount / 2), 1)} Badges`;

    const attendanceValue =
        Math.min(88 + taskCount * 3, 100);
    const participationValue =
        Math.min(76 + taskCount * 4, 100);

    if (attendanceRateEl) {
        attendanceRateEl.innerText =
            `${attendanceValue}%`;
    }
    if (attendanceFill) {
        attendanceFill.style.width =
            `${attendanceValue}%`;
    }

    if (participationRateEl) {
        participationRateEl.innerText =
            `${participationValue}%`;
    }
    if (participationFill) {
        participationFill.style.width =
            `${participationValue}%`;
    }

    const nextExam = {
        name: "Math Final Exam",
        date: new Date("2026-06-15T09:00:00")
    };

    if (examCountdown) {
        renderExamCountdown(
            examCountdown,
            nextExam.date
        );
        setInterval(() => {
            renderExamCountdown(
                examCountdown,
                nextExam.date
            );
        }, 1000);
    }

    if (deadlineList) {
        renderDeadlines(deadlineList);
    }
}

function renderExamCountdown(container, examDate) {
    const now = new Date();
    const diff = examDate - now;
    const days = Math.max(
        Math.floor(diff / (1000 * 60 * 60 * 24)),
        0
    );
    const hours = Math.max(
        Math.floor(
            (diff / (1000 * 60 * 60)) % 24
        ),
        0
    );
    const minutes = Math.max(
        Math.floor((diff / (1000 * 60)) % 60),
        0
    );
    const seconds = Math.max(
        Math.floor((diff / 1000) % 60),
        0
    );

    document.getElementById("daysLeft").innerText =
        days.toString().padStart(2, "0");
    document.getElementById("hoursLeft").innerText =
        hours.toString().padStart(2, "0");
    document.getElementById("minutesLeft").innerText =
        minutes.toString().padStart(2, "0");
    document.getElementById("secondsLeft").innerText =
        seconds.toString().padStart(2, "0");
}

function renderDeadlines(listElement) {
    const deadlines = [
        {
            title: "UI Design Project",
            due: "2026-06-05T23:59:00"
        },
        {
            title: "JavaScript Quiz Prep",
            due: "2026-06-10T18:00:00"
        },
        {
            title: "Python Coding Challenge",
            due: "2026-06-12T12:00:00"
        }
    ];

    listElement.innerHTML = "";

    deadlines.forEach(item => {
        const dueDate = new Date(item.due);
        const now = new Date();
        const diff = Math.max(
            Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)),
            0
        );
        const li = document.createElement("li");
        li.className = "deadline-item";
        li.innerHTML = `
            <strong>${item.title}</strong>
            <span>${diff} days</span>
        `;
        listElement.appendChild(li);
    });
}

/* =========================
   CONTACT FORM
========================= */

function submitContact(event) {

    event.preventDefault();

    const name =
        document.getElementById("contact-name");

    const email =
        document.getElementById("contact-email");

    const message =
        document.getElementById("contact-message");

    const notice =
        document.getElementById("contact-notice");

    if (
        !name ||
        !email ||
        !message ||
        !notice
    ) return;

    if (
        name.value.trim() === "" ||
        email.value.trim() === "" ||
        message.value.trim() === ""
    ) {
        notice.innerText =
            "Please fill in all fields.";
        return;
    }

    notice.innerText =
        `Thanks, ${name.value.trim()}! Your message has been received.`;

    name.value = "";
    email.value = "";
    message.value = "";
}

function submitLogin(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");
    const notice = document.getElementById("loginNotice");

    if (!email || !password || !notice) return;

    if (email.value.trim() === "" || password.value.trim() === "") {
        notice.innerText = "Please enter email and password.";
        return;
    }

    notice.innerText = "Login successful. Redirecting...";
    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 1000);
}

/* =========================
   PAGE INITIALIZATION
========================= */

window.onload = () => {

    if (document.getElementById("question")) {
        loadQuiz();
    }

    if (document.getElementById("list")) {
        renderTasks();
    }

    if (
        document.getElementById("progressPercent") ||
        document.getElementById("progressData")
    ) {
        loadDashboard();
    }

    if (document.getElementById("suggestions")) {
        generateCourses();
    }

    // wire search keyboard and focus behavior
    const searchInput = document.getElementById('search');
    const suggestionsBox = document.getElementById('suggestions');
    if (searchInput && suggestionsBox) {
        searchInput.addEventListener('keydown', function(e) {
            const visible = Array.from(document.querySelectorAll('.search-results .course')).filter(el => el.style.display !== 'none' && !el.classList.contains('no-results'));
            if (!visible.length) return;

            let pos = visible.findIndex(el => Number(el.dataset.index) === suggestionIndex);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                pos = (pos + 1) % visible.length;
                suggestionIndex = Number(visible[pos].dataset.index);
                highlightSuggestion(suggestionIndex);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                pos = (pos - 1 + visible.length) % visible.length;
                suggestionIndex = Number(visible[pos].dataset.index);
                highlightSuggestion(suggestionIndex);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (suggestionIndex >= 0) {
                    const el = document.querySelector(`.search-results .course[data-index="${suggestionIndex}"]`);
                    if (el) el.click();
                }
            } else if (e.key === 'Escape') {
                suggestionsBox.style.display = 'none';
            }
        });

        // show suggestions on focus
        searchInput.addEventListener('focus', function() {
            if (searchInput.value.trim() !== '') {
                suggestionsBox.style.display = 'block';
            }
        });

        // debounce input searches
        searchInput.addEventListener('input', debounce(searchCourses, 120));

        // click outside to close suggestions
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.style.display = 'none';
            }
        });
    }
};