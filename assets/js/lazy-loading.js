/**
 * Lazy Loading Implementation for RightCareHome
 * Optimized for performance and accessibility
 */

class LazyLoader {
    constructor() {
        this.imageObserver = null;
        this.init();
    }

    init() {
        // Check if IntersectionObserver is supported
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '50px 0px', // Start loading 50px before image enters viewport
            threshold: 0.01
        };

        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.imageObserver.unobserve(entry.target);
                }
            });
        }, options);

        // Observe all lazy images
        this.observeImages();
    }

    observeImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            this.imageObserver.observe(img);
        });
    }

    loadImage(img) {
        const src = img.getAttribute('data-src');
        const srcset = img.getAttribute('data-srcset');
        const sizes = img.getAttribute('data-sizes');

        if (src) {
            // Create a new image to preload
            const imageLoader = new Image();
            
            imageLoader.onload = () => {
                // Image loaded successfully
                img.src = src;
                if (srcset) img.srcset = srcset;
                if (sizes) img.sizes = sizes;
                
                img.classList.add('lazy-loaded');
                img.classList.remove('lazy-loading');
                
                // Remove data attributes
                img.removeAttribute('data-src');
                img.removeAttribute('data-srcset');
                img.removeAttribute('data-sizes');
                
                // Trigger custom event
                img.dispatchEvent(new CustomEvent('lazyLoaded', {
                    detail: { src, srcset, sizes }
                }));
            };

            imageLoader.onerror = () => {
                // Image failed to load
                img.classList.add('lazy-error');
                img.classList.remove('lazy-loading');
                
                // Show fallback or error state
                this.handleImageError(img);
                
                // Trigger custom event
                img.dispatchEvent(new CustomEvent('lazyError', {
                    detail: { src, srcset, sizes }
                }));
            };

            // Start loading
            img.classList.add('lazy-loading');
            imageLoader.src = src;
            if (srcset) imageLoader.srcset = srcset;
        }
    }

    handleImageError(img) {
        // Add error placeholder or fallback
        img.alt = img.alt || 'Image failed to load';
        
        // Optional: Set a fallback image
        if (img.getAttribute('data-fallback')) {
            img.src = img.getAttribute('data-fallback');
        }
    }

    loadAllImages() {
        // Fallback for browsers without IntersectionObserver
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            this.loadImage(img);
        });
    }

    // Method to manually load an image
    loadImageNow(img) {
        if (img.getAttribute('data-src')) {
            this.loadImage(img);
        }
    }

    // Method to load all remaining images
    loadAllRemaining() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            this.loadImage(img);
        });
    }
}

// CSS for lazy loading states
const lazyLoadingCSS = `
/* Lazy Loading Styles */
.lazy-loading {
    opacity: 0.6;
    filter: blur(2px);
    transition: opacity 0.3s ease, filter 0.3s ease;
}

.lazy-loaded {
    opacity: 1;
    filter: none;
    transition: opacity 0.3s ease, filter 0.3s ease;
}

.lazy-error {
    opacity: 0.5;
    background: #f0f0f0;
    border: 2px dashed #ccc;
}

.lazy-placeholder {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
}

@keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* Responsive images */
img[data-src] {
    width: 100%;
    height: auto;
    display: block;
}

/* Aspect ratio containers for better layout */
.lazy-container {
    position: relative;
    width: 100%;
    height: 0;
    overflow: hidden;
}

.lazy-container img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Aspect ratio classes */
.aspect-16-9 { padding-bottom: 56.25%; }
.aspect-4-3 { padding-bottom: 75%; }
.aspect-1-1 { padding-bottom: 100%; }
.aspect-3-2 { padding-bottom: 66.67%; }
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = lazyLoadingCSS;
document.head.appendChild(style);

// Initialize lazy loader when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.lazyLoader = new LazyLoader();
    });
} else {
    window.lazyLoader = new LazyLoader();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoader;
}
