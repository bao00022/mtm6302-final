const baseURL = "https://quizapi.io/api/v1/questions";
const API_KEY = "replace_with_your_api_key"; // Replace with your actual API key
const LIMIT = 3;
const $correct = document.getElementById("correct");
const $wrong = document.getElementById("wrong");
const $reset = document.getElementById("reset");
const $message = document.getElementById("message");
const $results = document.getElementById("results");
const $start = document.getElementById("start");
const $quiz = document.getElementById("quiz");
const $quizCards = document.getElementById("quiz-cards");

// Define global variables to store state information such as score, questions, correct answers, user answers, and score card.
// The score needs to be reset manually by the user clicking a button;
// Other variables are reset each time a new test begins.

let score = { correct: 0, wrong: 0 };
let questions = [];
let correctAnswers = []; // [[answer_a], [answer_c], [answer_b, answer_d] ...]
let userAnswers = [];
let scorecard = []; // [true, false, true, ...]

// ------------------------------------ Auxiliary function ------------------------------------ //
// Show/Clear Message Prompts
function showMessage(msg, type = "loading") {
  $message.textContent = msg;
  $message.classList.add(`msg-${type}`);
}

function clearMessage() {
  $message.textContent = "";
  $message.classList.value = "";
}

// Show/hide elements
function hiddenElement($el) {
  $el.classList.add("hidden");
}

function showElement($el) {
  $el.classList.remove("hidden");
}

// Update score display and save to localstorage
function updateScore() {
  $correct.textContent = score.correct;
  $wrong.textContent = score.wrong;
  localStorage.setItem("quizScore", JSON.stringify(score));
}

// Initialize score display, read initial score from localstorage
function initScore() {
  const savedScore = localStorage.getItem("quizScore");
  if (savedScore) {
    score = JSON.parse(savedScore);
  } else {
    score = { correct: 0, wrong: 0 };
  }
  updateScore();
}

// Extract the correct answer for each question and store the correct answers from the `questions` array into the `correctAnswers` array for later use.
function extractCorrectAnswers() {
  for (let i = 0; i < questions.length; i++) {
    const answerObj = questions[i].correct_answers;
    const correctForThisQuestion = [];
    for (const [key, value] of Object.entries(answerObj)) {
      if (value === "true") {
        correctForThisQuestion.push(key.slice(0, -8)); // Remove the "_correct" suffix
      }
    }
    correctAnswers.push(correctForThisQuestion);
  }
  // console.log(correctAnswers);
}

// Compare whether the data in two arrays are the same
function compareArrays(arr1, arr2) {
  // sort both arrays
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();
  // compare sorted arrays as JSON strings
  return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
}

// Check user answers against correct answers, update score and scorecard
function checkAnswers() {
  extractCorrectAnswers();
  for (let i = 0; i < userAnswers.length; i++) {
    const isCorrect = compareArrays(userAnswers[i], correctAnswers[i]);
    // record whether each question was answered correctly
    scorecard.push(isCorrect);
    // update total score
    if (isCorrect) {
      score.correct += 1;
    } else {
      score.wrong += 1;
    }
  }
  // update score display
  updateScore();
}

// ------------------------------------ Fetch Quiz Questions ------------------------------------ //
// Fetch quiz questions from the API based on the selected difficulty level
async function fetchQuizQuestions(difficulty) {
  try {
    // show loading message
    showMessage("Loading quiz questions...", "loading");

    // simulate network delay for testing
    // await new Promise((resolve) => setTimeout(resolve, 2000));

    // send fetch request to API
    const response = await fetch(`${baseURL}?apiKey=${API_KEY}&limit=${LIMIT}&difficulty=${difficulty}`);

    // check for HTTP errors
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // parse and return JSON data
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  } finally {
    // clear loading message
    clearMessage();
  }
}

// ------------------------------------ Render Quiz and Results ------------------------------------ //
// Render quiz questions and options to the page
function renderQuiz() {
  $quizCards.innerHTML = "";
  questions.forEach((question, index) => {
    const $cardDiv = document.createElement("div");
    $cardDiv.classList.add("flex", "flex-col", "gap-4");
    // Multiple choice or single choice
    const multiple = question.multiple_correct_answers === "true";
    const options = question.answers;

    // render question title
    const $h3 = document.createElement("h3");
    $h3.classList.add("text-lg", "font-bold");
    $h3.textContent = `${index + 1}. `; // display question number

    const $span = document.createElement("span");
    $span.classList.add(
      "text-sm",
      "px-2",
      "py-1",
      "rounded-md",
      "ml-4",
      `${multiple ? "bg-indigo-300" : "bg-lime-300"}`,
    );
    $span.textContent = multiple ? "Multiple" : "Single";
    $h3.appendChild($span); // display question type tag
    const $h3Text = document.createTextNode(` ${question.question}`); // display question text
    $h3.appendChild($h3Text);
    $cardDiv.appendChild($h3);

    // render options
    // Object.entries(obj) method transforms the object into a two-dimensional array, where each item is a [key, value] array
    for (const [key, value] of Object.entries(options)) {
      if (value) {
        const $label = document.createElement("label");
        $label.classList.add(
          "block",
          "px-4",
          "py-2",
          "rounded",
          "hover:bg-amber-200",
          "cursor-pointer",
          "ml-4",
        );
        const $input = document.createElement("input");
        $input.type = `${multiple ? "checkbox" : "radio"}`; // set input type based on question type
        $input.name = `q${index + 1}`;
        $input.value = key;

        $label.appendChild($input);
        const textNode = document.createTextNode(` ${key.slice(-1).toUpperCase()}. ${value}`);
        $label.appendChild(textNode);
        $cardDiv.appendChild($label);
      }
    }

    $quizCards.appendChild($cardDiv);
  });
}

// render quiz results to the page
function renderResults() {
  showElement($results);
  $results.innerHTML = "";

  questions.forEach((question, index) => {
    const $resultCard = document.createElement("div");
    $resultCard.classList.add("flex", "flex-col", "gap-4");
    const $h3 = document.createElement("h3");
    $h3.classList.add("text-lg", "font-bold");
    $h3.textContent = `${index + 1}. ${question.question}`;
    $resultCard.appendChild($h3);

    const options = question.answers;
    for (const [key, value] of Object.entries(options)) {
      if (value) {
        const $optionP = document.createElement("p");
        $optionP.classList.add("ml-4");
        $optionP.textContent = `${key.slice(-1).toUpperCase()}. ${value}`;
        $resultCard.appendChild($optionP);
      }
    }

    // display whether the user's answer was correct or wrong, along with the correct answers and the user's answers
    const $resultP = document.createElement("p");
    $resultP.classList.add("ml-4", `${scorecard[index] ? "text-green-600" : "text-red-600"}`);
    $resultP.textContent = `${scorecard[index] ? "Correct" : "Wrong"}. Correct answer(s): ${correctAnswers[
      index
    ]
      .map((ans) => ans.slice(-1).toUpperCase())
      .join(
        ", ",
      )}. Your answer(s): ${userAnswers[index].map((ans) => ans.slice(-1).toUpperCase()).join(", ")}`;
    $resultCard.appendChild($resultP);
    $results.appendChild($resultCard);
  });
}

// ------------------------------------ envent listener ------------------------------------ //
// listen for start form submission to begin the quiz
$start.addEventListener("submit", async function (e) {
  e.preventDefault();
  const formData = new FormData($start);
  const selectedDifficulty = formData.get("difficulty");

  // hide start form, clear previous messages and results
  hiddenElement($start);
  clearMessage();
  hiddenElement($results);
  // clear previous quiz data
  questions = [];
  correctAnswers = [];
  userAnswers = [];
  scorecard = [];

  try {
    // fetch quiz questions based on selected difficulty
    questions = await fetchQuizQuestions(selectedDifficulty);
    // render quiz form
    showElement($quiz);
    renderQuiz();
  } catch (error) {
    console.error("Failed to start quiz:", error);
    showMessage(`${error.message}, please try again later.`, "error");
    showElement($start);
  }
});

// listen for quiz form submission to collect answers and show results
$quiz.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData($quiz);
  // console.log(formData);

  // gather user answers
  userAnswers = []; // reset userAnswers array
  for (let i = 0; i < questions.length; i++) {
    const qid = `q${i + 1}`;
    const answer = formData.getAll(qid); // use getAll to handle multiple selections
    userAnswers.push(answer);
  }
  // console.log(userAnswers);

  // compare answers and update score
  checkAnswers();

  // render results
  renderResults();

  // hide quiz form and show start form for a new quiz
  hiddenElement($quiz);
  showElement($start);
});

// reset score when reset button is clicked
$reset.addEventListener("click", function () {
  score = { correct: 0, wrong: 0 };
  updateScore();
});

// initialize score display on page load
window.addEventListener("load", initScore);
