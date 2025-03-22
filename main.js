const gameContainer = document.querySelector(".game");
const numberOfLetters = 25;
const numberOfRows = 5;
const numberOfColumns = 5;
let usedQuestions =
  JSON.parse(window.sessionStorage.getItem("usedQuestions")) || {};
// Fetches question data from the specified API endpoint

const getQuestions = async (api) => {
  const response = await fetch(api);
  const data = await response.json();
  return data;
};

// Sets up the game by fetching questions and rendering the grid

const setGame = async () => {
  const questions = await getQuestions("questions.json");
  const shuffledLetters = Object.keys(questions).sort(
    () => Math.random() - 0.5
  );
  shuffledLetters.length = numberOfLetters;
  addLetters(shuffledLetters);
  gameContainer.addEventListener("click", (e) => {
    handleClick(e, questions);
  });
};

// Renders a grid of letters into the game container

const addLetters = (arrayOfLetters) => {
  let currentLetter = 0;
  for (let i = 0; i < 5; i++) {
    const row = document.createElement("div");
    row.classList.add("row");
    for (let j = 0; j < numberOfColumns; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      const letter = document.createElement("span");
      letter.classList.add("letter");
      letter.textContent = arrayOfLetters[currentLetter];
      cell.appendChild(letter);
      row.appendChild(cell);
      currentLetter++;
    }
    gameContainer.appendChild(row);
  }
};

// Display a question popup for a letter

const getQuestion = (letterElement, questions) => {
  const letter = letterElement.textContent;
  const letterQuestions = questions[letter];
  usedQuestions[letter] = usedQuestions[letter] || [];
  const letterUsedQuestions = usedQuestions[letter];
  if (letterUsedQuestions.length === letterQuestions.length) {
    letterUsedQuestions.length = 0;
  }

  let question;

  do {
    const randomNumber = Math.floor(Math.random() * letterQuestions.length);
    question = letterQuestions[randomNumber];
  } while (letterUsedQuestions.includes(question.question));
  letterUsedQuestions.push(question.question);
  saveQuestion();
  letterElement.classList.add("clicked");
  displayQuestion(question, letterElement);
};

const saveQuestion = () => {
  window.sessionStorage.setItem("usedQuestions", JSON.stringify(usedQuestions));
};

const displayQuestion = ({ question, answer }, letter) => {
  const questionPopup = document.createElement("div");
  questionPopup.classList.add("popup");
  questionPopup.innerHTML = `
  <div class="question" data-letter="${letter.textContent}">
  <span class="close-button">&times;</span>
  <details>
  <summary>
  <h2>${question}</h2>
  </summary>
  <div class="answer">
    <p>${answer}</p>
  <div class="buttons">
  <button class="orange"></button>
  <button class="green"></button>
  </div>
  </div>
  </details>
  </div>
  `;
  gameContainer.appendChild(questionPopup);
};

// Close the popup and reset the clicked state

const closePopup = () => {
  const popup = document.querySelector(".popup");
  if (popup) popup.remove();
  const clickedLetter = document.querySelector(".clicked");
  clickedLetter.classList.remove("clicked");
};

// Apply or toggle color on a letter

const applyColorToLetter = (clickedButton) => {
  const color = clickedButton.className;
  const clickedLetter = document.querySelector(".clicked");
  clickedLetter.textContent = "";
  clickedLetter.classList.add(color);
  closePopup();
};

// Toggle color between orange and green on an already colored letter

const toggleColor = (letter) => {
  if (letter.classList.contains("green")) {
    letter.classList.replace("green", "orange"); // More efficient than remove/add
  } else if (letter.classList.contains("orange")) {
    letter.classList.replace("orange", "green");
  }
};

// Centralized click handler

const handleClick = (e, questions) => {
  const target = e.target;
  if (target.classList.contains("letter")) {
    if (target.classList.length === 1) {
      getQuestion(target, questions);
    } else {
      toggleColor(target);
    }
  } else if (target.classList.contains("close-button")) {
    closePopup();
  } else if (target.tagName === "BUTTON") {
    applyColorToLetter(target);
  }
};

// Start the game

setGame();
