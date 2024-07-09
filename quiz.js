let quizData;
let currentQuiz;
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 10;
let userStats;

const mainMenuEl = document.getElementById("main-menu");
const startQuizBtnEl = document.getElementById("start-quiz-btn");
const viewStatsBtnEl = document.getElementById("view-stats-btn");
const quizTypeEl = document.getElementById("quiz-type");
const startQuizBtn = document.getElementById("start-quiz");
const quizSelectionEl = document.getElementById("quiz-selection");
const quizAreaEl = document.getElementById("quiz-area");
const quizHeaderEl = document.getElementById("quiz-header");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const resultEl = document.getElementById("result");
const timerEl = document.getElementById("timer");
const progressEl = document.getElementById("progress");
const scoreDisplayEl = document.getElementById("score-display");
const statsAreaEl = document.getElementById("stats-area");
const overallStatsEl = document.getElementById("overall-stats");
const highScoresEl = document.getElementById("high-scores");
const recentQuizzesEl = document.getElementById("recent-quizzes");
const clearStatsBtn = document.getElementById("clear-stats");
const backToMenuBtn = document.getElementById("back-to-menu");

// Fetch quiz data and populate quiz type dropdown
fetch('quizzes.json')
    .then(response => response.json())
    .then(data => {
        quizData = data;
        for (let quizType in quizData) {
            const option = document.createElement('option');
            option.value = quizType;
            option.textContent = quizData[quizType].name;
            quizTypeEl.appendChild(option);
        }
    });

// Load user stats from localStorage
userStats = JSON.parse(localStorage.getItem('quizAppUserStats')) || {
    totalQuizzes: 0,
    totalScore: 0,
    highScores: {},
    recentQuizzes: []
};

startQuizBtnEl.addEventListener('click', () => {
    mainMenuEl.style.display = 'none';
    quizSelectionEl.style.display = 'block';
});

viewStatsBtnEl.addEventListener('click', showStats);
startQuizBtn.addEventListener('click', startQuiz);
clearStatsBtn.addEventListener('click', clearStats);
backToMenuBtn.addEventListener('click', () => {
    statsAreaEl.style.display = 'none';
    mainMenuEl.style.display = 'block';
});

function startQuiz() {
    currentQuiz = quizData[quizTypeEl.value];
    currentQuestion = 0;
    score = 0;
    quizSelectionEl.style.display = 'none';
    quizAreaEl.style.display = 'block';
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestion >= currentQuiz.questions.length) {
        showFinalResult();
        return;
    }

    const question = currentQuiz.questions[currentQuestion];
    questionEl.textContent = `Question ${currentQuestion + 1}: ${question.question}`;

    optionsEl.innerHTML = "";
    question.options.forEach((option, index) => {
        const button = document.createElement("button");
        button.textContent = option;
        button.onclick = () => selectAnswer(index);
        optionsEl.appendChild(button);
    });

    resultEl.textContent = "";
    timeLeft = 10;
    updateTimer();
    startTimer();
}

function selectAnswer(selectedIndex) {
    clearInterval(timer);
    disableButtons();
    const question = currentQuiz.questions[currentQuestion];
    if (selectedIndex === question.correct) {
        score++;
        resultEl.textContent = "Correct!";
        resultEl.style.color = "green";
        setTimeout(() => {
            currentQuestion++;
            loadQuestion();
        }, 1000);
    } else {
        resultEl.textContent = "Incorrect. The correct answer is: " + question.options[question.correct];
        resultEl.style.color = "red";
        setTimeout(() => {
            currentQuestion++;
            loadQuestion();
        }, 2000);
    }
    updateScoreDisplay();
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            clearInterval(timer);
            disableButtons();
            resultEl.textContent = "Time's up!";
            resultEl.style.color = "red";
            setTimeout(() => {
                currentQuestion++;
                loadQuestion();
            }, 2000);
        }
    }, 1000);
}

function updateTimer() {
    timerEl.textContent = `Time left: ${timeLeft}s`;
    progressEl.style.width = `${(timeLeft / 10) * 100}%`;
}

function showFinalResult() {
    quizHeaderEl.style.display = "none";
    questionEl.textContent = "Quiz Completed!";
    optionsEl.innerHTML = "";
    resultEl.textContent = `Your final score: ${score} out of ${currentQuiz.questions.length}`;
    resultEl.style.color = "blue";
    
    updateUserStats();
    
    const restartButton = document.createElement("button");
    restartButton.textContent = "Restart Quiz";
    restartButton.onclick = restartQuiz;
    optionsEl.appendChild(restartButton);

    const menuButton = document.createElement("button");
    menuButton.textContent = "Back to Menu";
    menuButton.onclick = () => {
        quizAreaEl.style.display = 'none';
        mainMenuEl.style.display = 'block';
    };
    optionsEl.appendChild(menuButton);
}

function disableButtons() {
    const buttons = optionsEl.getElementsByTagName("button");
    for (let button of buttons) {
        button.disabled = true;
    }
}

function updateScoreDisplay() {
    scoreDisplayEl.textContent = `Score: ${score}`;
}

function restartQuiz() {
    quizAreaEl.style.display = 'none';
    quizSelectionEl.style.display = 'block';
    quizHeaderEl.style.display = "block";
    currentQuestion = 0;
    score = 0;
    updateScoreDisplay();
}

function updateUserStats() {
    userStats.totalQuizzes++;
    userStats.totalScore += score;

    // Update high score
    if (!userStats.highScores[currentQuiz.name] || score > userStats.highScores[currentQuiz.name]) {
        userStats.highScores[currentQuiz.name] = score;
    }

    // Add to recent quizzes
    userStats.recentQuizzes.unshift({
        quizName: currentQuiz.name,
        score: score,
        totalQuestions: currentQuiz.questions.length,
        date: new Date().toISOString()
    });

    // Keep only the last 5 quizzes
    if (userStats.recentQuizzes.length > 5) {
        userStats.recentQuizzes.pop();
    }

    // Save to localStorage
    localStorage.setItem('quizAppUserStats', JSON.stringify(userStats));
}

function showStats() {
    mainMenuEl.style.display = 'none';
    statsAreaEl.style.display = 'block';

    // Overall stats
    const averageScore = userStats.totalQuizzes > 0 ? (userStats.totalScore / userStats.totalQuizzes).toFixed(2) : 0;
    overallStatsEl.innerHTML = `
        <p>Total Quizzes Taken: ${userStats.totalQuizzes}</p>
        <p>Average Score: ${averageScore}</p>
    `;

    // High scores
    let highScoresHTML = '<table><tr><th>Quiz</th><th>High Score</th></tr>';
    for (let quiz in userStats.highScores) {
        highScoresHTML += `<tr><td>${quiz}</td><td>${userStats.highScores[quiz]}</td></tr>`;
    }
    highScoresHTML += '</table>';
    highScoresEl.innerHTML = highScoresHTML;

    // Recent quizzes
    let recentQuizzesHTML = '<table><tr><th>Quiz</th><th>Score</th><th>Date</th></tr>';
    userStats.recentQuizzes.forEach(quiz => {
        const date = new Date(quiz.date).toLocaleDateString();
        recentQuizzesHTML += `<tr><td>${quiz.quizName}</td><td>${quiz.score}/${quiz.totalQuestions}</td><td>${date}</td></tr>`;
    });
    recentQuizzesHTML += '</table>';
    recentQuizzesEl.innerHTML = recentQuizzesHTML;
}

function clearStats() {
    if (confirm('Are you sure you want to clear all your stats? This action cannot be undone.')) {
        userStats = {
            totalQuizzes: 0,
            totalScore: 0,
            highScores: {},
            recentQuizzes: []
        };
        localStorage.setItem('quizAppUserStats', JSON.stringify(userStats));
        showStats(); // Refresh the stats display
    }
}