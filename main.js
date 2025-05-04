const moves = document.getElementById("moves");
const container = document.querySelector(".container");
const buttons = document.querySelector(".buttons");
const startButton = document.getElementById("start-button");
const nextButton = document.getElementById("next-button");
const prevButton = document.getElementById("prev-button");
const reshuffle = document.getElementById("reshuffle");
const coverScreen = document.querySelector(".cover-screen");
const right = document.querySelector(".fa-chevron-right");
const left = document.querySelector(".fa-chevron-left");
const result = document.getElementById("result");
const timerDisplay = document.getElementById("timer");
let currentElement = "";
let movesCount,
  imagesArr = [];
let imgFolder = 1;

// Timer variables
let seconds = 0;
let minutes = 0;
let timerInterval = null;


// Timer functions
const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  seconds = 0;
  minutes = 0;
  timerInterval = setInterval(updateTimer, 1000);
  timerDisplay.classList.remove('hide');
};

const stopTimer = () => {
  clearInterval(timerInterval);
};

const updateTimer = () => {
  seconds++;
  if (seconds === 60) {
    seconds = 0;
    minutes++;
  }
  timerDisplay.innerText = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const isTouchDevice = () => {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
};

const getInversionCount = (arr) => {
  const puzzleArray = [...arr];
  const withoutBlank = puzzleArray.filter(num => num !== 9);
  let inversions = 0;

  for (let i = 0; i < withoutBlank.length - 1; i++) {
    for (let j = i + 1; j < withoutBlank.length; j++) {
      if (withoutBlank[i] > withoutBlank[j]) {
        inversions++;
      }
    }
  }

  return inversions;
};

const isSolvable = (arr) => {
  const inversions = getInversionCount(arr);
  return inversions % 2 === 0;
};

const generateSolvableConfig = () => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  do {
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
  } while (!isSolvable(numbers));

  return numbers;
};

const randomImages = () => {
  imagesArr = generateSolvableConfig();
};

const getCoords = (element) => {
  const [row, col] = element.getAttribute("data-position").split("_");
  return [parseInt(row), parseInt(col)];
};

const checkAdjacent = (row1, row2, col1, col2) => {
  if (row1 == row2) {
    if (col2 == col1 - 1 || col2 == col1 + 1) {
      return true;
    }
  } else if (col1 == col2) {
    if (row2 == row1 - 1 || row2 == row1 + 1) {
      return true;
    }
  }
  return false;
};

const gridGenerator = () => {
  let count = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let div = document.createElement("div");
      div.setAttribute("data-position", `${i}_${j}`);
      div.addEventListener("click", selectImage);
      div.classList.add("image-container");
      div.innerHTML = `<img src="images${imgFolder}/image_part_00${
        imagesArr[count]
      }.png" id="${imagesArr[count]}" class="image ${
        imagesArr[count] == 9 ? "target" : ""
      }" data-index="${imagesArr[count]}"/>`;
      count += 1;
      container.appendChild(div);
    }
  }
};

const selectImage = (e) => {
  e.preventDefault();
  currentElement = e.target;
  let targetElement = document.querySelector(".target");
  let currentParent = currentElement.parentElement;
  let targetParent = targetElement.parentElement;

  const [row1, col1] = getCoords(currentParent);
  const [row2, col2] = getCoords(targetParent);

  if (checkAdjacent(row1, row2, col1, col2)) {
    currentElement.remove();
    targetElement.remove();
    let currentIndex = parseInt(currentElement.getAttribute("data-index"));
    let targetIndex = parseInt(targetElement.getAttribute("data-index"));
    currentElement.setAttribute("data-index", targetIndex);
    targetElement.setAttribute("data-index", currentIndex);
    currentParent.appendChild(targetElement);
    targetParent.appendChild(currentElement);
    let currentArrIndex = imagesArr.indexOf(currentIndex);
    let targetArrIndex = imagesArr.indexOf(targetIndex);
    [imagesArr[currentArrIndex], imagesArr[targetArrIndex]] = [
      imagesArr[targetArrIndex],
      imagesArr[currentArrIndex],
    ];

    let imagesAll = [...document.querySelectorAll('.image')]
    imagesAll = imagesAll.map(image => {
      return image.id
    })

    if (imagesAll.join("") == "123456789") {
      setTimeout(() => {
        stopTimer();
        moves.classList.add('hide');
        timerDisplay.classList.add('hide');
        nextButton.classList.remove('hide');
        prevButton.classList.remove('hide');
        coverScreen.classList.remove("hide");
        container.classList.add("hide");
        result.innerText = `Total Moves: ${movesCount}\nTime: ${timerDisplay.innerText.slice(6)}\nGreat Job!`;
        startButton.innerText = "Restart Game";
      }, 1000);
    }
    movesCount += 1;
    moves.innerText = `Moves: ${movesCount}`;
  }
};

startButton.addEventListener("click", () => {
  showNew();
  moves.innerText = `Moves: ${movesCount}`;
  startTimer();
});

window.onload = () => {
  coverScreen.classList.remove("hide");
  container.classList.add("hide");
  moves.classList.add('hide');
  timerDisplay.classList.add('hide');
};

nextButton.addEventListener('click', () => {
  if (imgFolder > 9) {
    imgFolder = 9;
    return;
  }
  imgFolder++;
  showNew();
  startTimer();
});

right.addEventListener('click', () => {
  if (imgFolder > 9) {
    imgFolder = 9;
    return;
  }
  imgFolder++;
  showNew();
  startTimer();
});

prevButton.addEventListener('click', () => {
  if (imgFolder < 2) {
    imgFolder = 1;
    return;
  }
  imgFolder--;
  showNew();
  startTimer();
});

left.addEventListener('click', () => {
  if (imgFolder < 2) {
    imgFolder = 1;
    return;
  }
  imgFolder--;
  showNew();
  startTimer();
});

reshuffle.addEventListener('click', () => {
  container.innerHTML = '';
  moves.innerText = `Moves: 0`;
  movesCount = 0;
  imagesArr = [];
  randomImages();
  gridGenerator();
  startTimer();
});

function showNew() {
  container.classList.remove("hide");
  coverScreen.classList.add("hide");
  moves.classList.remove("hide");
  container.innerHTML = "";
  imagesArr = [];
  randomImages();
  gridGenerator();
  movesCount = 0;
  moves.innerText = `Moves: 0`;
}