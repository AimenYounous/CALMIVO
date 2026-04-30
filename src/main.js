import ColorThief from 'colorthief';
import { gsap } from 'gsap';

// Initialize ColorThief
const colorThief = new ColorThief();

// DOM Elements
const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const indicator = document.querySelector('.indicator');

let currentIndex = 0;
const totalSlides = slides.length;

// Extract Color from Image and apply to CSS Variables
function updateDynamicColor(img) {
  if (img.complete) {
    try {
      const color = colorThief.getColor(img);
      document.documentElement.style.setProperty('--dynamic-color', color.join(', '));
    } catch (e) {
      console.warn("Could not extract color. Perhaps CORS issue or image not loaded properly.", e);
    }
  } else {
    img.addEventListener('load', function() {
      try {
        const color = colorThief.getColor(img);
        document.documentElement.style.setProperty('--dynamic-color', color.join(', '));
      } catch (e) {
        console.warn("Could not extract color on load.", e);
      }
    });
  }
}

// Update Carousel State
function updateCarousel() {
  slides.forEach((slide, index) => {
    slide.className = 'slide';
    
    if (index === currentIndex) {
      slide.classList.add('active');
      const img = slide.querySelector('img');
      updateDynamicColor(img);
    } else if (index === (currentIndex + 1) % totalSlides) {
      slide.classList.add('next');
    } else if (index === (currentIndex - 1 + totalSlides) % totalSlides) {
      slide.classList.add('prev');
    }
  });
  
  const currentDisplay = String(currentIndex + 1).padStart(2, '0');
  const totalDisplay = String(totalSlides).padStart(2, '0');
  indicator.textContent = `${currentDisplay} / ${totalDisplay}`;
}

// Event Listeners for controls
let autoplayInterval;
let isHovered = false;

function startAutoplay() {
  autoplayInterval = setInterval(() => {
    if (!isHovered) {
      currentIndex = (currentIndex + 1) % totalSlides;
      updateCarousel();
    }
  }, 3500); // Change image every 3.5 seconds
}

function resetAutoplay() {
  clearInterval(autoplayInterval);
  startAutoplay();
}

const carouselElement = document.getElementById('carousel');
if(carouselElement) {
  carouselElement.addEventListener('mouseenter', () => { isHovered = true; });
  carouselElement.addEventListener('mouseleave', () => { isHovered = false; });
}

nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % totalSlides;
  updateCarousel();
  resetAutoplay();
});

prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
  updateCarousel();
  resetAutoplay();
});

// Initial entrance animation
window.addEventListener('load', () => {
  updateCarousel();
  startAutoplay(); // Start automatic sliding
  
  gsap.from('.premium-nav', {
    y: -50,
    opacity: 0,
    duration: 1,
    ease: "power3.out"
  });
  
  gsap.from('.stagger-text', {
    y: 30,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: "power3.out",
    delay: 0.3
  });
  
  gsap.from('.carousel', {
    scale: 0.8,
    opacity: 0,
    duration: 1.5,
    ease: "power4.out",
    delay: 0.5
  });

  // Scroll animations for video section
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        gsap.from('.stagger-video-text h2, .stagger-video-text p', {
          y: 50,
          opacity: 0,
          duration: 1,
          stagger: 0.3,
          ease: "power3.out"
        });
        observer.disconnect(); // Animate only once
      }
    });
  }, { threshold: 0.5 });
  
  const videoSection = document.querySelector('.video-story-section');
  if(videoSection) observer.observe(videoSection);

  // Video Interaction Logic
  const videoContainer = document.getElementById('video-container');
  const storyVideo = document.getElementById('story-video');
  const playOverlay = document.getElementById('play-overlay');
  const fullscreenBtn = document.getElementById('fullscreen-btn');

  if (videoContainer) {
    videoContainer.addEventListener('click', () => {
      if (storyVideo.paused) {
        storyVideo.play();
        playOverlay.style.opacity = '0';
        storyVideo.style.filter = 'brightness(1)';
      } else {
        storyVideo.pause();
        playOverlay.style.opacity = '1';
        storyVideo.style.filter = 'brightness(0.7)';
      }
    });
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevet videoContainer click event from firing

      if (storyVideo.requestFullscreen) {
        storyVideo.requestFullscreen();
      } else if (storyVideo.webkitRequestFullscreen) { /* Safari */
        storyVideo.webkitRequestFullscreen();
      } else if (storyVideo.msRequestFullscreen) { /* IE11 */
        storyVideo.msRequestFullscreen();
      }
    });

    // Toggle native controls when in fullscreen
    storyVideo.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement) {
        storyVideo.setAttribute('controls', 'true');
      } else {
        storyVideo.removeAttribute('controls');
      }
    });
  }

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Smooth scroll for Buy Button
  const buyBtn = document.getElementById('buy-btn');
  if (buyBtn) {
    buyBtn.addEventListener('click', () => {
      const shopSection = document.querySelector('#shop');
      if (shopSection) shopSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Scroll animations for Shop section
  const shopObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        gsap.from('.stagger-shop, .card', {
          y: 50,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out"
        });
        shopObserver.disconnect(); // Animate only once
      }
    });
  }, { threshold: 0.2 });
  
  const shopSection = document.getElementById('shop');
  if(shopSection) shopObserver.observe(shopSection);
});
