/*!
* Start Bootstrap - Resume v7.0.6 (https://startbootstrap.com/theme/resume)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
*/
//
// Scripts
//

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Typed.js
    if (typeof Typed !== 'undefined') {
        new Typed('#typed', {
            strings: [
                'Cloud Computing',
                'DevOps',
                'Automation',
                'Problem Solving'
            ],
            typeSpeed: 70,
            backSpeed: 50,
            backDelay: 1500,
            startDelay: 500,
            loop: true
        });
        
        new Typed('#typed_2', {
            strings: [
                'automate everything',
                'solve complex problems',
                'build resilient systems',
                'learn continuously'
            ],
            typeSpeed: 70,
            backSpeed: 50,
            backDelay: 1500,
            startDelay: 500,
            loop: true
        });
    }
    
    // View counter
    const viewCounter = async function() {
        try {
            console.log("Starting to fetch view count...");
            const counter = document.querySelector(".counter-number");
            console.log("Counter element found:", counter);
            
            const response = await fetch("https://kjnbxinxccc3nk7bs6r4qqx7ta0vjwid.lambda-url.ca-central-1.on.aws/");
            console.log("Response received:", response);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("View count data:", data);
            
            if (counter) {
                // Add a subtle flash animation effect
                counter.style.transition = "all 0.3s ease";
                counter.style.transform = "scale(1.05)";
                counter.innerHTML = `<span class="inline-flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    <span>${data}</span>&nbsp;views
                </span>`;
                
                // Return to normal scale after animation
                setTimeout(() => {
                    counter.style.transform = "scale(1)";
                }, 300);
                
                console.log("Counter updated with:", data);
            }
        } catch (error) {
            console.error("Error updating view count:", error);
        }
    };
    
    // Call the view counter function
    viewCounter();
});
