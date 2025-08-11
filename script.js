// Existing code unchanged above

// --- Hero banner slider ---

const track = document.querySelector('.hero-track');
const slides = document.querySelectorAll('.hero-slide');
const leftArrow = document.querySelector('.hero-arrow.left');
const rightArrow = document.querySelector('.hero-arrow.right');
const slidesToShow = 3;
let currentIndex = 0;

function updateSlider() {
  const slideWidth = slides[0].offsetWidth;
  track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
}

// Slide right (next)
rightArrow.addEventListener('click', () => {
  if (currentIndex + slidesToShow < slides.length) {
    currentIndex += slidesToShow;
  } else {
    currentIndex = 0; // Loop to start
  }
  updateSlider();
});

// Slide left (previous)
leftArrow.addEventListener('click', () => {
  if (currentIndex - slidesToShow >= 0) {
    currentIndex -= slidesToShow;
  } else {
    // Loop to end (last full set of slides)
    currentIndex = slides.length - slidesToShow;
    if (currentIndex < 0) currentIndex = 0;
  }
  updateSlider();
});

// Responsive: update on window resize
window.addEventListener('resize', updateSlider);

// Initial position
updateSlider();

// --- Movie cards carousel arrows ---

const moviesSection = document.querySelector('.movies-section');
const moviesArrowLeft = document.querySelector('.movies-arrow.left');
const moviesArrowRight = document.querySelector('.movies-arrow.right');

moviesArrowLeft.addEventListener('click', () => {
  moviesSection.scrollBy({ left: -250, behavior: 'smooth' });
});

moviesArrowRight.addEventListener('click', () => {
  moviesSection.scrollBy({ left: 250, behavior: 'smooth' });
});

// --- Modal functionality for Book Ticket ---

const bookBtns = document.querySelectorAll('.book-btn');

bookBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    const card = btn.closest('.movie-card');
    const title = card.querySelector('.movie-title').textContent;
    const poster = card.querySelector('.movie-poster').getAttribute('src');
    const genre = card.querySelector('.movie-genre').textContent;
    const ratingScore = card.querySelector('.movie-rating .rating-score').textContent;
    const ratingVotes = card.querySelector('.movie-rating .rating-votes').textContent;

    const movieDetails = {
      title: title,
      poster: poster,
      genre: genre,
      ratingScore: ratingScore,
      ratingVotes: ratingVotes
    };

    try {
      localStorage.setItem('selectedMovie', JSON.stringify(movieDetails));
      console.log('Movie details saved to localStorage:', movieDetails);
      
      // Show modal at center of screen
      const modal = document.getElementById('booking-modal');
      const modalContent = modal.querySelector('.modal-content');
      const modalMovieTitle = document.getElementById('modal-movie-title');
      
      // Reset any custom positioning to use CSS centering
      modalContent.style.left = '';
      modalContent.style.top = '';
      modalContent.style.position = '';
      
      // Show the modal
      modalMovieTitle.textContent = title;
      modal.style.display = 'block';
      modal.classList.add('active');
    } catch (e) {
      console.error('Error saving movie details to localStorage:', e);
      alert('An error occurred. Please try again.');
    }
  });
});

// Modal functionality for language and format selection
const modal = document.getElementById('booking-modal');
const closeModal = document.querySelector('.close-modal');
const modalMovieTitle = document.getElementById('modal-movie-title');
const confirmBtn = document.querySelector('.confirm-btn');

// Modal event listeners
closeModal.addEventListener('click', () => {
  modal.classList.remove('active');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
});

// Language and format selection
document.querySelectorAll('.option-group').forEach(group => {
  group.addEventListener('click', function (e) {
    if (e.target.classList.contains('option-btn')) {
      group.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
      e.target.classList.add('selected');
    }
  });
});

// Confirm button to proceed to seat selection
confirmBtn.addEventListener('click', () => {
  const selectedLanguageBtn = document.querySelector('.option-group:nth-of-type(1) .option-btn.selected');
  const selectedFormatBtn = document.querySelector('.option-group:nth-of-type(2) .option-btn.selected');

  const selectedLanguage = selectedLanguageBtn ? selectedLanguageBtn.dataset.value : null;
  const selectedFormat = selectedFormatBtn ? selectedFormatBtn.dataset.value : null;

  if (selectedLanguage && selectedFormat) {
    let movieDetails = null;
    try {
      movieDetails = JSON.parse(localStorage.getItem('selectedMovie'));
      console.log('Movie details retrieved from localStorage:', movieDetails);
    } catch (e) {
      console.error('Error parsing movie details from localStorage:', e);
      alert('An error occurred with movie data. Please try again.');
      return;
    }

    if (movieDetails) {
      movieDetails.language = selectedLanguage;
      movieDetails.format = selectedFormat;
      console.log('Updated movie details:', movieDetails);
      try {
        localStorage.setItem('selectedMovie', JSON.stringify(movieDetails));
        console.log('Updated movie details saved to localStorage.');
        
        // Close modal and redirect to seat selection
        modal.classList.remove('active');
        setTimeout(() => {
          modal.style.display = 'none';
          window.location.href = 'movie-details-template.html';
        }, 300);
      } catch (e) {
        console.error('Error saving updated movie details to localStorage:', e);
        alert('An error occurred saving your selection. Please try again.');
      }
    } else {
      console.error('No movie details found in localStorage.');
      alert('Movie details not found. Please select a movie again.');
    }
  } else {
    alert('Please select both language and format before proceeding.');
  }
});

// Confirm button functionality is now handled in the inline options system



// --- Search bar with autocomplete functionality ---

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const autocompleteList = document.getElementById('autocomplete-list');
const movieCards = document.querySelectorAll('.movie-card');

// Extract movie data (title and poster src) from the DOM
const movieData = Array.from(movieCards).map(card => {
  return {
    title: card.querySelector('.movie-title').textContent.trim(),
    poster: card.querySelector('.movie-poster').getAttribute('src')
  };
});

// Clear autocomplete suggestions
function clearAutocomplete() {
  autocompleteList.innerHTML = '';
  autocompleteList.style.display = 'none';
}

// Create autocomplete suggestion item with image
function createSuggestionItem(movie) {
  const item = document.createElement('div');
  item.classList.add('autocomplete-item');

  const img = document.createElement('img');
  img.src = movie.poster;
  img.alt = movie.title;
  img.classList.add('autocomplete-item-img');

  const span = document.createElement('span');
  span.textContent = movie.title;
  span.classList.add('autocomplete-item-text');

  item.appendChild(img);
  item.appendChild(span);

  item.addEventListener('click', () => {
    searchInput.value = movie.title;
    clearAutocomplete();
    filterMovies(movie.title);
  });
  return item;
}

// Show autocomplete suggestions based on input
function showAutocomplete(value) {
  clearAutocomplete();
  if (!value) return;
  const filtered = movieData.filter(movie => movie.title.toLowerCase().includes(value.toLowerCase()));
  if (filtered.length === 0) return;
  filtered.forEach(movie => {
    const item = createSuggestionItem(movie);
    autocompleteList.appendChild(item);
  });
  autocompleteList.style.display = 'block';
}

// Filter movie cards based on search query
function filterMovies(query) {
  const lowerQuery = query.toLowerCase();
  movieCards.forEach(card => {
    const title = card.querySelector('.movie-title').textContent.toLowerCase();
    if (title.includes(lowerQuery)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// Event listeners
searchInput.addEventListener('input', (e) => {
  showAutocomplete(e.target.value);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    clearAutocomplete();
    filterMovies(searchInput.value);
  }
});

searchButton.addEventListener('click', () => {
  clearAutocomplete();
  filterMovies(searchInput.value);
});

// Close autocomplete when clicking outside
document.addEventListener('click', (e) => {
  if (e.target !== searchInput && e.target.parentNode !== autocompleteList) {
    clearAutocomplete();
  }
});

// --- Profile area hover effect ---
const signinBtn = document.querySelector('.signin-btn');
const signinTextWrapper = document.querySelector('.signin-text-wrapper');
const signupText = document.querySelector('.signup-text');
const signinText = document.querySelector('.signin-text');

if (signinBtn && signinTextWrapper && signupText && signinText) {
  signinBtn.addEventListener('mousemove', (e) => {
    const rect = signinBtn.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element

    if (x < rect.width / 2) {
      // Left half: show Sign Up
      signupText.style.opacity = '1';
      signinText.style.opacity = '0';
    } else {
      // Right half: show Sign In
      signupText.style.opacity = '0';
      signinText.style.opacity = '1';
    }
  });

  signinBtn.addEventListener('mouseleave', () => {
    // Hide both when mouse leaves the button
    signupText.style.opacity = '0';
    signinText.style.opacity = '0';
  });
}
// --- My Shows Modal Functionality ---

const myShowsBtn = document.querySelector('.my-shows-btn');
const myShowsModal = document.getElementById('my-shows-modal');
const closeMyShows = document.querySelector('.close-my-shows');
const myShowsList = document.getElementById('my-shows-list');

// Open My Shows modal
myShowsBtn.addEventListener('click', () => {
  renderMyShows();
  myShowsModal.style.display = 'block';
  myShowsModal.classList.add('active');
});

// Close modal
closeMyShows.addEventListener('click', () => {
  myShowsModal.classList.remove('active');
  setTimeout(() => {
    myShowsModal.style.display = 'none';
  }, 300);
});
window.addEventListener('click', (e) => {
  if (e.target === myShowsModal) {
    myShowsModal.classList.remove('active');
    setTimeout(() => {
      myShowsModal.style.display = 'none';
    }, 300);
  }
});

// Function to render user's booked shows
function renderMyShows() {
  const userShows = JSON.parse(localStorage.getItem('bookedShows') || '[]');
  if (userShows.length === 0) {
    myShowsList.innerHTML = '<p style="color:#aaa;">No tickets booked yet.</p>';
    return;
  }
  myShowsList.innerHTML = userShows.map(show => `
    <div class="my-show-item">
      <h4>${show.movieName}</h4>
      <p><strong>Date:</strong> ${show.date} &nbsp; <strong>Time:</strong> ${show.time}</p>
      <p><strong>Seat:</strong> ${show.seat} &nbsp; <strong>Price:</strong> ₹${show.price}</p>
    </div>
  `).join('');
}

// Example: When booking is confirmed, save show details
// Call this function wherever the ticket booking is finalized
function saveBookedShow(showDetails) {
  // showDetails: { movieName, date, time, seat, price }
  const shows = JSON.parse(localStorage.getItem('bookedShows') || '[]');
  shows.push(showDetails);
  localStorage.setItem('bookedShows', JSON.stringify(shows));
}
 document.addEventListener('DOMContentLoaded', function() {
  const myShowsBtn = document.querySelector('.my-shows-btn');
  const myShowsModal = document.getElementById('my-shows-modal');
  const closeMyShows = document.querySelector('.close-my-shows');
  const myShowsList = document.getElementById('my-shows-list');

  function renderMyShows() {
    const userShows = JSON.parse(localStorage.getItem('bookedShows') || '[]');
    if (userShows.length === 0) {
      myShowsList.innerHTML = '<p class="no-shows">No tickets booked yet.</p>';
      return;
    }
    myShowsList.innerHTML = userShows.map(show => `
      <div class="my-show-item">
        <div class="my-show-poster">
          <img src="${show.poster}" alt="${show.movieName}">
        </div>
        <div class="my-show-details">
          <h4>${show.movieName}</h4>
          <p><span>Date:</span> ${show.date} &nbsp; <span>Time:</span> ${show.time}</p>
          <p><span>Seat:</span> ${show.seat} &nbsp; <span>Price:</span> <strong style="color:#e94560;">₹${show.price}</strong></p>
        </div>
      </div>
    `).join('');
    // Add Cancel Ticket buttons
    myShowsList.querySelectorAll('.my-show-item').forEach((item, idx) => {
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel Ticket';
      cancelBtn.classList.add('cancel-ticket-btn');
      cancelBtn.setAttribute('data-cancel-idx', idx);
      item.appendChild(cancelBtn);
    });
      // Add click event to all new Cancel Ticket buttons
    document.querySelectorAll('.cancel-ticket-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-cancel-idx'));
        if (confirm('Are you sure you want to cancel this ticket?')) {
          cancelTicket(idx);
        }
      });
    });
  }

  function cancelTicket(idx) {
    let userShows = JSON.parse(localStorage.getItem('bookedShows') || '[]');
    userShows.splice(idx, 1);
    localStorage.setItem('bookedShows', JSON.stringify(userShows));
    renderMyShows();
  }

  myShowsBtn.addEventListener('click', () => {
    renderMyShows();
    myShowsModal.style.display = 'block';
    myShowsModal.classList.add('active');
  });

  closeMyShows.addEventListener('click', () => {
    myShowsModal.classList.remove('active');
    setTimeout(() => {
      myShowsModal.style.display = 'none';
    }, 300);
  });
  window.addEventListener('click', (e) => {
    if (e.target === myShowsModal) {
      myShowsModal.classList.remove('active');
      setTimeout(() => {
        myShowsModal.style.display = 'none';
      }, 300);
    }
  });
});
