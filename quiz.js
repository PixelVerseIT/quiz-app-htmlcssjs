let quizData;
let currentQuiz;
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 10;

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

startQuizBtn.addEventListener('click', startQuiz);

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
    
    const restartButton = document.createElement("button");
    restartButton.textContent = "Restart Quiz";
    restartButton.onclick = restartQuiz;
    optionsEl.appendChild(restartButton);
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