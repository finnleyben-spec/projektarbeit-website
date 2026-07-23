// Three.js 3D Viewer Setup - Fixed version
let scene, camera, renderer, model;
let isModelLoaded = false;

function initThreeJS() {
    const container = document.getElementById('threejs-viewer');
    
    if (!container) {
        console.error('Container not found!');
        return;
    }
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    
    // Camera
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3, 2, 5);
    
    // Renderer - simplified for better compatibility
    try {
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: false,
            powerPreference: "high-performance"
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        container.appendChild(renderer.domElement);
        console.log('WebGL Renderer initialized');
    } catch (e) {
        console.error('WebGL not supported:', e);
        container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:white;font-size:18px;">WebGL wird nicht unterstützt</div>';
        return;
    }
    
    // Lighting - simplified for better performance
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
    
    // Animation loop
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
    requestAnimationFrame(animate);
    
    if (model && isModelLoaded) {
        // Gentle auto-rotation
        model.rotation.y += 0.002;
    }
    
    renderer.render(scene, camera);
}

// Orbit Controls (simplified version without external dependency)
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
const container = document.getElementById('threejs-viewer');

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

// Touch support for mobile
container.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { 
            x: e.touches[0].clientX, 
            y: e.touches[0].clientY 
        };
    }
});

container.addEventListener('touchmove', function(e) {
    if (isDragging && model && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;
        
        model.rotation.y += deltaX * 0.01;
        model.rotation.x += deltaY * 0.01;
        
        previousMousePosition = { 
            x: e.touches[0].clientX, 
            y: e.touches[0].clientY 
        };
    }
});

container.addEventListener('touchend', function() {
    isDragging = false;
});

// GSAP Scroll Animations
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Animate elements on scroll
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((el, index) => {
        gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: index * 0.2,
            ease: "power3.out"
        });
    });
    
    // Slide up elements
    const slideElements = document.querySelectorAll('.slide-up');
    slideElements.forEach((el) => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 80%",
                end: "top 20%",
                toggleActions: "play none none reverse"
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out"
        });
    });
    
    // Parallax effect for hero section
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

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Handle window resize
window.addEventListener('resize', function() {
    const container = document.getElementById('threejs-viewer');
    
    if (camera && renderer) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
});

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Update aria-expanded for accessibility
            const isExpanded = navLinks.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
});

// Purchase Modal Functions
function openPurchaseModal() {
    const modal = document.getElementById('purchaseModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closePurchaseModal() {
    const modal = document.getElementById('purchaseModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
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

// Image switching for thumbnails
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

// Easter Egg Function - Fun celebration instead of ordering
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

// Confetti Effect
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#87ceeb'];
    
    for (let i = 0; i < 50; i++) {
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
        
        // Animate falling
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initThreeJS();
    initScrollAnimations();
    
    console.log('Website initialized successfully!');
});
