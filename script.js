const coffeeCupImg = document.getElementById('coffeeCupImg');
const answerElement = document.getElementById('answer');
const answerContainer = document.getElementById('answerContainer');
const questionElement = document.querySelector('.question');

let fadeOutTimer = null;

// Parallax effect
const parallaxLayers = document.querySelectorAll('.parallax-layer');
let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;

// Coffee wisdom responses
const coffeeWisdom = [
    "YES"
];

// Mouse move parallax effect
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
    mouseY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
});

// Smooth parallax animation loop
function animateParallax() {
    // Smooth interpolation for natural movement
    currentX += (mouseX - currentX) * 0.1;
    currentY += (mouseY - currentY) * 0.1;

    // Animate background layers
    parallaxLayers.forEach(layer => {
        const speed = parseFloat(layer.getAttribute('data-speed'));
        const x = currentX * speed * 50;
        const y = currentY * speed * 50;

        layer.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    });

    // Animate coffee cup image
    const cupSpeed = parseFloat(coffeeCupImg.getAttribute('data-speed'));
    const cupX = currentX * cupSpeed * 50;
    const cupY = currentY * cupSpeed * 50;
    coffeeCupImg.style.transform = `translate(calc(-50% + ${cupX}px), calc(-50% + ${cupY}px))`;

    requestAnimationFrame(animateParallax);
}

// Start parallax animation
animateParallax();

// Random wisdom function
function getRandomWisdom() {
    const randomIndex = Math.floor(Math.random() * coffeeWisdom.length);
    return coffeeWisdom[randomIndex];
}

// Show answer with animation
function showAnswer() {
    // Clear any existing fade-out timer
    if (fadeOutTimer) {
        clearTimeout(fadeOutTimer);
    }

    // Add pulse animation to coffee cup
    const cupSpeed = parseFloat(coffeeCupImg.getAttribute('data-speed'));
    const cupX = currentX * cupSpeed * 50;
    const cupY = currentY * cupSpeed * 50;

    coffeeCupImg.style.transform = `translate(calc(-50% + ${cupX}px), calc(-50% + ${cupY}px)) scale(0.95)`;
    setTimeout(() => {
        coffeeCupImg.style.transform = `translate(calc(-50% + ${cupX}px), calc(-50% + ${cupY}px)) scale(1)`;
    }, 200);

    // Get random wisdom
    const wisdom = getRandomWisdom();

    // Hide current answer and question
    answerElement.classList.remove('show');
    questionElement.style.opacity = '0';

    // Show new answer after a brief delay
    setTimeout(() => {
        answerElement.textContent = wisdom;
        answerElement.classList.add('show');

        // Auto-fade out after 10 seconds
        fadeOutTimer = setTimeout(() => {
            answerElement.classList.remove('show');
            // Show question again
            setTimeout(() => {
                questionElement.style.opacity = '1';
            }, 300);
        }, 10000);
    }, 300);
}

// Create canvas for transparency detection
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
let imageData = null;

// Load image data once the image is loaded
coffeeCupImg.addEventListener('load', () => {
    canvas.width = coffeeCupImg.naturalWidth;
    canvas.height = coffeeCupImg.naturalHeight;
    ctx.drawImage(coffeeCupImg, 0, 0);
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
});

// If image is already loaded (cached)
if (coffeeCupImg.complete) {
    canvas.width = coffeeCupImg.naturalWidth;
    canvas.height = coffeeCupImg.naturalHeight;
    ctx.drawImage(coffeeCupImg, 0, 0);
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// Check if clicked pixel is transparent
function isPixelTransparent(x, y) {
    if (!imageData) return false;

    // Calculate the position in the image
    const rect = coffeeCupImg.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const imageX = Math.floor((x - rect.left) * scaleX);
    const imageY = Math.floor((y - rect.top) * scaleY);

    // Check bounds
    if (imageX < 0 || imageX >= canvas.width || imageY < 0 || imageY >= canvas.height) {
        return true; // Out of bounds = transparent
    }

    // Get pixel data
    const index = (imageY * canvas.width + imageX) * 4;
    const alpha = imageData.data[index + 3];

    // Return true if alpha is less than 10 (essentially transparent)
    return alpha < 10;
}

// Coffee cup click event with transparency check
coffeeCupImg.addEventListener('click', (e) => {
    // Try transparency check if image data is available
    if (imageData) {
        if (!isPixelTransparent(e.clientX, e.clientY)) {
            showAnswer();
        }
    } else {
        // Fallback: just allow all clicks
        showAnswer();
    }
});

// Change cursor based on transparency
coffeeCupImg.addEventListener('mousemove', (e) => {
    if (imageData) {
        const transparent = isPixelTransparent(e.clientX, e.clientY);
        coffeeCupImg.style.cursor = transparent ? 'default' : 'pointer';
    } else {
        // Fallback: always show pointer
        coffeeCupImg.style.cursor = 'pointer';
    }
});

// Reset cursor when leaving the image
coffeeCupImg.addEventListener('mouseleave', () => {
    coffeeCupImg.style.cursor = 'default';
});

// Easter egg: Konami code for extra caffeine enthusiasm
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join('') === konamiSequence.join('')) {
        answerElement.textContent = "🎮 ULTRA MEGA COFFEE MODE ACTIVATED! ☕☕☕";
        answerElement.classList.add('show');
        document.body.style.animation = 'rainbow 2s infinite';
    }
});

// Reduce parallax effect on mobile/tablet
if (window.innerWidth <= 768) {
    parallaxLayers.forEach(layer => {
        const speed = parseFloat(layer.getAttribute('data-speed'));
        layer.setAttribute('data-speed', speed * 0.3); // Reduce effect by 70%
    });
}
