// Basic Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    // Reveal animations
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => observer.observe(card));

    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Logo hover effect
    const logo = document.querySelector('.logo');
    if (logo) {
        const logoIcon = logo.querySelector('.logo-icon');
        if (logoIcon) {
            logo.addEventListener('mouseenter', () => {
                logoIcon.classList.add('animate-spin-slow');
            });
            logo.addEventListener('mouseleave', () => {
                logoIcon.classList.remove('animate-spin-slow');
            });
        }
    }
});
