let lastScrollTop = 0;
const navbar = document.getElementById('scrollNavbar');

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop) {
        // Scroll down, hide navbar
        navbar.style.top = '0px';
    } else {
        // Scroll up, show navbar
        navbar.style.top = '-100px';
    }

    lastScrollTop = scrollTop;
});


