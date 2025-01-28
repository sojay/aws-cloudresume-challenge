/*!
* Start Bootstrap - Resume v7.0.6 (https://startbootstrap.com/theme/resume)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
*/
//
// Scripts
//


var typed = new Typed('#typed', {
    strings: [
        'Automating the Cloud',
        // 'building ',
        // 'Cloud Engineer'
    ],
    typeSpeed: 50,
    backSpeed: 30,
    loop: false
});


var typed_2 = new Typed('#typed_2', {
    strings: [
        // 'Play FIFA, Cult of the Lamb, Hades, Ghost of Tsushima 🕹️',
        'Play the guitar 🎸, and write music 🎼',
        'explore HAM Radio 📡',
        'Cycle 🚴‍♀️',
    ],
    typeSpeed: 50,
    backSpeed: 40,
    loop: false    
});


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const sideNav = document.body.querySelector('#sideNav');
    if (sideNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#sideNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});

const counter = document.querySelector(".counter-number");
async function updateCounter() {
	let response = await fetch("https://kjnbxinxccc3nk7bs6r4qqx7ta0vjwid.lambda-url.ca-central-1.on.aws/");
    let data = await response.json();
	counter.innerHTML = ` 👀 Views: ${data}`;
}

updateCounter();
