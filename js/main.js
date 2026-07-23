// ============================================
// Three.js 3D Viewer Setup - Mobile Optimized
// ============================================
let scene, camera, renderer, model;
let isModelLoaded = false;
let animationId = null;

function initThreeJS() {
    const container = document.getElementById('threejs-viewer');
    
    if (!container) {
        console.error('Container not found!');
        return;
    }
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    
    // Camera - responsive aspect ratio
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3, 2, 5);
    
    // Renderer - optimized for mobile performance
    try {
        renderer = new THREE.WebGLRenderer({ 
            antialias: window.matchMedia('(min-width: 768px)').matches,
            alpha: false,
            powerPreference: "high-performance"
        });
        
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        
        container.appendChild(renderer.domElement);
        console.log('WebGL Renderer initialized (optimized)');
    } catch (e) {
        console.error('WebGL not supported:', e);
        container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:white;font-size:18px;">WebGL wird nicht unterstützt</div>';
        return;
    }
    
    // Lighting - optimized for performance
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    
    // Add subtle rim light
    const rimLight = new THREE.DirectionalLight(0x4a90e2, 0.3);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);
    
    // Load OBJ model
    loadModel();
    
    // Animation loop with requestAnimationFrame
    animate();
}

function loadModel() {
    const loader = new THREE.OBJLoader();
    
    console.log('Loading model from: models/Projektarbeit.obj');
    
    loader.load(
        'models/Projektarbeit.obj',
        function(object) {
            model = object;
            
            // Center and scale the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            
            if (maxDim > 0) {
                const scale = 2 / maxDim;
                model.scale.setScalar(scale);
                model.position.sub(center.multiplyScalar(scale));
            }
            
            // Add to scene
            scene.add(model);
            isModelLoaded = true;
            
            console.log('Model loaded successfully');
        },
        function(xhr) {
            if (xhr.total > 0) {
                const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
                console.log(`Loading: ${percent}%`);
            }
        },
        function(error) {
            console.error('Error loading model:', error);
            if (renderer && renderer.domElement && renderer.domElement.parentElement) {
                renderer.domElement.parentElement.innerHTML = `
                    <div style="display:flex;align-items:center;justify-content:center;height:100%;color:white;font-size:18px;text-align:center;padding:40px;">
                        <div>
                            <p style="margin-bottom:16px;">3D-Modell konnte nicht geladen werden</p>
                            <a href="models/Projektarbeit.obj" download class="control-btn">OBJ herunterladen</a>
                        </div>
                    </div>
                `;
            }
        }
    );
}

function animate() {
    animationId = requestAnimationFrame(animate);
    
    if (model && isModelLoaded) {
        // Gentle auto-rotation - slower on mobile for battery saving
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const rotationSpeed = isMobile ? 0.001 : 0.002;
        model.rotation.y += rotationSpeed;
    }
    
    renderer.render(scene, camera);
}

// ============================================
// Orbit Controls (simplified version)
// ============================================
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
const container = document.getElementById('threejs-viewer');

if (container) {
    // Mouse controls
    container.addEventListener('mousedown', function(e) {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    container.addEventListener('mousemove', function(e) {
        if (isDragging && model) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            model.rotation.y += deltaX * 0.01;
            model.rotation.x += deltaY * 0.01;
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });

    container.addEventListener('mouseup', function() {
        isDragging = false;
    });

    container.addEventListener('mouseleave', function() {
        isDragging = false;
    });

    // Touch support for mobile - optimized
    let touchStartX, touchStartY;
    
    container.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            isDragging = true;
            previousMousePosition = { 
                x: e.touches[0].clientX, 
                y: e.touches[0].clientY 
            };
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    container.addEventListener('touchmove', function(e) {
        if (isDragging && model && e.touches.length === 1) {
            const deltaX = e.touches[0].clientX - previousMousePosition.x;
            const deltaY = e.touches[0].clientY - previousMousePosition.y;
            
            // Smoother touch rotation on mobile
            model.rotation.y += deltaX * 0.008;
            model.rotation.x += deltaY * 0.008;
            
            previousMousePosition = { 
                x: e.touches[0].clientX, 
                y: e.touches[0].clientY 
            };
        }
    }, { passive: true });

    container.addEventListener('touchend', function() {
        isDragging = false;
    });
}

// ============================================
// GSAP Scroll Animations - Mobile Optimized
// ============================================
function initScrollAnimations() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        console.log('Reduced motion detected - animations disabled');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);
    
    // Animate elements on scroll
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((el, index) => {
        gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: prefersReducedMotion ? 0.3 : 1,
            delay: index * 0.2,
            ease: "power3.out"
        });
    });
    
    // Slide up elements with ScrollTrigger
    const slideElements = document.querySelectorAll('.slide-up');
    slideElements.forEach((el) => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                end: "top 20%",
                toggleActions: "play none none reverse"
            },
            opacity: 1,
            y: 0,
            duration: prefersReducedMotion ? 0.3 : 1,
            ease: "power3.out"
        });
    });
    
    // Parallax effect for hero section - only on desktop
    if (!prefersReducedMotion && window.matchMedia('(min-width: 768px)').matches) {
        gsap.to(".hero h1", {
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            },
            yPercent: -50,
            opacity: 0.3
        });
    }
}

// ============================================
// Smooth scroll for navigation links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Account for fixed navbar height
            const navHeight = document.querySelector('.navbar')?.offsetHeight || 64;
            window.scrollTo({
                top: target.offsetTop - navHeight,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                navLinks.classList.remove('active');
            }
        }
    });
});

// ============================================
// Handle window resize - Three.js & Layout
// ============================================
let resizeTimeout;
window.addEventListener('resize', function() {
    // Debounce resize handler for performance
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        if (camera && renderer) {
            const container = document.getElementById('threejs-viewer');
            if (container) {
                const width = container.clientWidth;
                const height = container.clientHeight || 600;
                
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
                
                // Adjust pixel ratio on resize
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                renderer.setPixelRatio(dpr);
            }
        }
    }, 250);
});

// ============================================
// Mobile Menu Toggle - Enhanced
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        // Initialize aria-expanded
        menuToggle.setAttribute('aria-expanded', 'false');
        
        menuToggle.addEventListener('click', function() {
            const isActive = navLinks.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isActive);
            
            // Update hamburger icon
            if (isActive) {
                menuToggle.innerHTML = '✕';
                document.body.style.overflow = 'hidden';
            } else {
                menuToggle.innerHTML = '☰';
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.innerHTML = '☰';
                document.body.style.overflow = '';
            });
        });
        
        // Close menu on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.innerHTML = '☰';
                document.body.style.overflow = '';
                menuToggle.focus();
            }
        });
    }
});

// ============================================
// Purchase Modal Functions - Enhanced
// ============================================
function openPurchaseModal() {
    const modal = document.getElementById('purchaseModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Focus trap for accessibility
        setTimeout(() => {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) closeBtn.focus();
        }, 100);
    }
}

function closePurchaseModal() {
    const modal = document.getElementById('purchaseModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('purchaseModal');
    if (event.target === modal) {
        closePurchaseModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closePurchaseModal();
    }
});

// ============================================
// Image switching for thumbnails
// ============================================
let currentImageIndex = 0;
const images = [
    './assets/notion-images/notion_image_15.jpg',
    './assets/videos/video1_fixed.mp4',
    './assets/videos/Explosion4.mp4'
];

function switchAnimation(index) {
    const mainImage = document.getElementById('mainProductImage');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    currentImageIndex = index;
    
    // Update active thumbnail
    thumbnails.forEach((thumb, i) => {
        if (i === index) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
    
    // Change main image with fade effect
    mainImage.style.opacity = '0';
    setTimeout(() => {
        mainImage.src = images[index];
        mainImage.style.opacity = '1';
    }, 200);
}

function switchImage(index) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    // Update active gallery item
    galleryItems.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// ============================================
// Easter Egg Function - Fun celebration
// ============================================
function triggerEasterEgg() {
    const button = document.querySelector('.easter-egg-button');
    
    // Add celebration animation
    button.classList.add('easter-egg-active');
    
    // Create confetti effect
    createConfetti();
    
    // Show fun message
    setTimeout(() => {
        alert('🎉 Simulation abgeschlossen!\n\nDanke für dein Interesse am mechanischen Kraftverstärker!\n\nDies war nur eine Demo - es wurde nichts bestellt.\n\nTrotzdem: Das Projekt ist cool, oder? 😄');
        
        // Reset button animation
        setTimeout(() => {
            button.classList.remove('easter-egg-active');
        }, 600);
    }, 300);
}

// ============================================
// Confetti Effect - Optimized for mobile
// ============================================
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#87ceeb'];
    
    // Reduce confetti count on mobile for performance
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const particleCount = isMobile ? 25 : 50;
    
    for (let i = 0; i < particleCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '50%';
        confetti.style.zIndex = '99999';
        confetti.style.pointerEvents = 'none';
        
        document.body.appendChild(confetti);
        
        // Animate falling using Web Animations API (GPU accelerated)
        const animation = confetti.animate([
            { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
            { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 3000 + 2000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.onfinish = () => confetti.remove();
    }
}

// ============================================
// Initialize everything when DOM is loaded
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initThreeJS();
    initScrollAnimations();
    
    console.log('Website initialized successfully!');
});
