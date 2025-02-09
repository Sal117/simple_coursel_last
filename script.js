jQuery(document).ready(function($) {
    // --------------------------------------------------------------------------------
    // Grab the primary elements from the page.
    // --------------------------------------------------------------------------------
    const carousel       = document.querySelector(".carousel");             // The overall carousel container.
    const listHTML       = document.querySelector(".carousel .list");         // The container holding all our slide items.
    const nextButton     = document.getElementById("next");                   // The "Next" arrow button.
    const prevButton     = document.getElementById("prev");                   // The "Previous" arrow button.
    const backButton     = document.getElementById("back");                   // The "Back" button to exit detail mode.
    const seeMoreButtons = document.querySelectorAll(".seeMore");             // All the "See More" buttons on each slide.
    const dots           = document.querySelectorAll(".dot");                   // The slide indicator dots.
    
    // For handling touch events, we use the element with id="carousel".
    const touchableElement = document.getElementById("carousel");
  
    // --------------------------------------------------------------------------------
    // Set Up: Tag each slide with its original index.
    // --------------------------------------------------------------------------------
    const items = listHTML.querySelectorAll(".item");
    const totalSlides = items.length;
    items.forEach((item, index) => {
      item.setAttribute("data-index", index); // So we always know each slide's original position.
    });
  
    // We assume that the active (focused/clear) slide is always the second child.
    // So, if there are at least two slides, our currentSlide will be set to the data-index of that slide.
    let currentSlide = 0;
    if (listHTML.children.length >= 2) {
      currentSlide = parseInt(listHTML.children[1].getAttribute("data-index"));
    }
    
    // Hide the "Back" button initially because we aren't in detail view yet.
    backButton.style.display = "none";
    
    // --------------------------------------------------------------------------------
    // Function: Update the Dot Indicators.
    // --------------------------------------------------------------------------------
    // This function makes sure the dot corresponding to the current slide is highlighted.
    function updateIndicators() {
      dots.forEach(dot => dot.classList.remove("active")); // Remove highlight from all dots.
      if (dots[currentSlide]) {
        dots[currentSlide].classList.add("active");          // Highlight the active slide's dot.
      }
    }
    updateIndicators(); // Initialize dot indicators on page load.
  
    // --------------------------------------------------------------------------------
    // Helper: Update the current slide index.
    // --------------------------------------------------------------------------------
    // Since our active slide is always the second child in the list, we read its data-index.
    function updateCurrentSlide() {
      const activeItem = listHTML.children[1];
      if (activeItem && activeItem.getAttribute("data-index") !== null) {
        currentSlide = parseInt(activeItem.getAttribute("data-index"));
      }
    }
  
    // --------------------------------------------------------------------------------
    // Main Slider Function: showSlider
    // --------------------------------------------------------------------------------
    // This function moves the slides in the desired direction and updates everything else.
    let arrowTimeout;
    function showSlider(direction) {
      // Disable arrow clicks temporarily to prevent too-rapid navigation.
      nextButton.style.pointerEvents = "none";
      prevButton.style.pointerEvents = "none";
      
      // Remove any previous directional classes. (These might be used in CSS transitions.)
      carousel.classList.remove("next", "prev");
      
      // Grab the current list of slides.
      const items = listHTML.querySelectorAll(".item");
      
      if (direction === "next") {
        // For "next", move the first item to the end of the list.
        listHTML.appendChild(items[0]);
        carousel.classList.add("next");
      } else {
        // For "prev", move the last item to the beginning of the list.
        listHTML.prepend(items[items.length - 1]);
        carousel.classList.add("prev");
      }
      
      // After reordering, update the current slide index (active slide is assumed to be second).
      updateCurrentSlide();
      updateIndicators();
      
      // If we're in detail mode, update the visible detail block to match the new active slide.
      if (carousel.classList.contains("showDetail")) {
        // First, hide all detail sections.
        document.querySelectorAll(".detail").forEach(detailDiv => {
          detailDiv.style.display = "none";
        });
        // Then, show the detail block inside the current active slide.
        const currentActiveItem = listHTML.children[1];
        if (currentActiveItem) {
          const detailDiv = currentActiveItem.querySelector(".detail");
          if (detailDiv) {
            detailDiv.style.display = "block";
          }
        }
      }
      
      // Re-enable arrow button clicks after a short delay (adjust timing as necessary).
      clearTimeout(arrowTimeout);
      arrowTimeout = setTimeout(() => {
        nextButton.style.pointerEvents = "auto";
        prevButton.style.pointerEvents = "auto";
      }, 1000);
    }
    
    // --------------------------------------------------------------------------------
    // Arrow Button Click Events.
    // --------------------------------------------------------------------------------
    // These simply call showSlider with the appropriate direction.
    nextButton.onclick = function() {
      showSlider("next");
    };
    prevButton.onclick = function() {
      showSlider("prev");
    };
    
    // --------------------------------------------------------------------------------
    // Mouse Wheel Navigation.
    // --------------------------------------------------------------------------------
    // Allow users to navigate by scrolling. We use a timeout to avoid too many events firing.
    let scrollTimeout = null;
    carousel.onwheel = function(e) {
      e.preventDefault();
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        scrollTimeout = null;
      }, 1000);
      
      // Scroll down moves to the next slide; scroll up moves to the previous slide.
      if (e.deltaY > 0) {
        showSlider("next");
      } else {
        showSlider("prev");
      }
    };
    
    // --------------------------------------------------------------------------------
    // "See More" Button: Show Detail View.
    // --------------------------------------------------------------------------------
    // Clicking a "See More" button will switch the carousel into detail mode.
    seeMoreButtons.forEach((btn) => {
      btn.addEventListener("click", function() {
        // Add a class to indicate we're in detail mode.
        carousel.classList.add("showDetail");
        
        // First, hide all detail sections.
        document.querySelectorAll(".detail").forEach(detailDiv => {
          detailDiv.style.display = "none";
        });
        // Then, find and show the detail section within the slide that was clicked.
        const parentItem = btn.closest(".item");
        if (parentItem) {
          const detailDiv = parentItem.querySelector(".detail");
          if (detailDiv) {
            detailDiv.style.display = "block";
          }
        }
        // Show the back button so the user can exit detail mode.
        backButton.style.display = "block";
      });
    });
    
    // --------------------------------------------------------------------------------
    // Back Button: Exit Detail View.
    // --------------------------------------------------------------------------------
    backButton.onclick = function() {
      // Remove the detail mode class.
      carousel.classList.remove("showDetail");
      // Hide all detail sections.
      document.querySelectorAll(".detail").forEach(detailDiv => {
        detailDiv.style.display = "none";
      });
      // Hide the back button.
      backButton.style.display = "none";
    };
    
    // --------------------------------------------------------------------------------
    // Touch (Swipe) Events.
    // --------------------------------------------------------------------------------
    // These events allow the carousel to respond to swipes on touch devices.
    let touchstartX = 0;
    let touchstartY = 0;
    let touchendX = 0;
    let touchendY = 0;
    let lastSwipeTime = 0; // Used to prevent swipes that are too close in time.
    
    // Helper: Check if the touched element is a "See More" button.
    function isSeeMoreButton(target) {
      return target.classList.contains("seeMore");
    }
    
    // Record the starting point of the touch.
    touchableElement.addEventListener("touchstart", function(event) {
      if (isSeeMoreButton(event.target)) return; // Ignore if user is tapping "See More".
      touchstartX = event.changedTouches[0].screenX;
      touchstartY = event.changedTouches[0].screenY;
    }, false);
    
    // When the touch ends, record the ending coordinates and process the gesture.
    touchableElement.addEventListener("touchend", function(event) {
      if (isSeeMoreButton(event.target)) return;
      touchendX = event.changedTouches[0].screenX;
      touchendY = event.changedTouches[0].screenY;
      handleGesture();
    }, false);
    
    // Determine the swipe direction and move the slider accordingly.
    function handleGesture() {
      const currentTime = Date.now();
      if (currentTime - lastSwipeTime < 1000) return;  // Ignore if swipes are happening too fast.
      lastSwipeTime = currentTime;
      
      const horizontalDistance = touchendX - touchstartX;
      const verticalDistance = touchendY - touchstartY;
      
      // If the horizontal swipe is more pronounced than the vertical, treat it as horizontal.
      if (Math.abs(horizontalDistance) > Math.abs(verticalDistance)) {
        if (horizontalDistance < 0) {
          showSlider("next"); // Swipe left: go to next slide.
        } else if (horizontalDistance > 0) {
          showSlider("prev"); // Swipe right: go to previous slide.
        }
      } else {
        // Otherwise, treat it as a vertical swipe.
        if (verticalDistance < 0) {
          showSlider("next"); // Swipe up: next slide.
        } else if (verticalDistance > 0) {
          showSlider("prev"); // Swipe down: previous slide.
        }
      }
    }
    
    // --------------------------------------------------------------------------------
    // (Optional) Dot Navigation.
    // --------------------------------------------------------------------------------
    // If a user clicks on one of the indicator dots, we simulate moving through the slides
    // one at a time until we reach the selected slide.
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        // Calculate how many moves are needed to go from currentSlide to the target slide.
        let moveCount = index - currentSlide;
        if (moveCount > 0) {
          for (let i = 0; i < moveCount; i++) {
            showSlider("next");
          }
        } else if (moveCount < 0) {
          for (let i = 0; i < Math.abs(moveCount); i++) {
            showSlider("prev");
          }
        }
      });
    });
  });
  
