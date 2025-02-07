jQuery(document).ready(function($) {
let nextButton = document.getElementById("next");
let prevButton = document.getElementById("prev");
let carousel = document.querySelector(".carousel");
let listHTML = document.querySelector(".carousel .list");
let seeMoreButtons = document.querySelectorAll(".seeMore");
let backButton = document.getElementById("back");

nextButton.onclick = function () {
  showSlider("next");
};

prevButton.onclick = function () {
  showSlider("prev");
};

let unAcceppClick;
const showSlider = (type) => {
  nextButton.style.pointerEvents = "none";
  prevButton.style.pointerEvents = "none";

  carousel.classList.remove("next", "prev");
  let items = document.querySelectorAll(".carousel .list .item");
  if (type === "next") {
    listHTML.appendChild(items[0]);
    carousel.classList.add("next");
  } else {
    listHTML.prepend(items[items.length - 1]);
    carousel.classList.add("prev");
  }

  clearTimeout(unAcceppClick);
  unAcceppClick = setTimeout(() => {
    nextButton.style.pointerEvents = "auto";
    prevButton.style.pointerEvents = "auto";
  }, 2000);
};

let scrollTimeout;

// Scroll functionality
carousel.onwheel = function (e) {
  e.preventDefault();
  if (scrollTimeout) return;

  // Set a timeout to disable further scroll actions for 2 seconds
  scrollTimeout = setTimeout(() => {
    scrollTimeout = null; // Re-enable scroll after 2 seconds
  }, 1500);

  if (e.deltaY > 0) {
    showSlider("next");
  } else {
    showSlider("prev");
  }
};

backButton.style.display = "none";

seeMoreButtons.forEach((button) => {
  button.onclick = function () {
    carousel.classList.remove("next", "prev");
    carousel.classList.add("showDetail");

    backButton.style.display = "block";
  };
});

backButton.onclick = function () {
  carousel.classList.remove("showDetail");
  backButton.style.display = "none";

};

// Touch implementations
const touchableElement = document.getElementById("carousel");

let touchstartX = 0;
let touchstartY = 0;
let touchendX = 0;
let touchendY = 0;
let lastSwipeTime = 0; // Store the timestamp of the last swipe

// Function to check if the touch target is a "See More" button
function isSeeMoreButton(target) {
  return target.classList.contains("seeMore");
}

touchableElement.addEventListener(
  "touchstart",
  function (event) {
    if (isSeeMoreButton(event.target)) {
      return; // Ignore touchstart if it's on the "See More" button
    }
    touchstartX = event.changedTouches[0].screenX;
    touchstartY = event.changedTouches[0].screenY;
  },
  false
);

touchableElement.addEventListener(
  "touchend",
  function (event) {
    if (isSeeMoreButton(event.target)) {
      return; // Ignore touchend if it's on the "See More" button
    }
    touchendX = event.changedTouches[0].screenX;
    touchendY = event.changedTouches[0].screenY;
    handleGesture();
  },
  false
);

function handleGesture() {
  const currentTime = Date.now(); // Get the current timestamp

  // Only allow one swipe action at a time, regardless of direction
  if (currentTime - lastSwipeTime < 2000) {
    return; // Ignore the swipe if it's too soon
  }

  // Update the last swipe time to the current timestamp
  lastSwipeTime = currentTime;

  // Calculate the distance moved
  const horizontalDistance = touchendX - touchstartX;
  const verticalDistance = touchendY - touchstartY;

  // Determine swipe direction and execute action
  if (Math.abs(horizontalDistance) > Math.abs(verticalDistance)) {
    // Horizontal swipe
    if (horizontalDistance < 0) {
      showSlider("next"); // Swipe left
    } else if (horizontalDistance > 0) {
      showSlider("prev"); // Swipe right
    }
  } else {
    // Vertical swipe
    if (verticalDistance < 0) {
      showSlider("next"); // Swipe up
    } else if (verticalDistance > 0) {
      showSlider("prev"); // Swipe down
    }
  }
}
});