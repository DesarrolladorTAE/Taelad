/* Theme Name: Appexy - Responsive bootsrap 4 Landing Page Template
   Author: Coderthemes
   Version: 1.0.0
   Created: May 2018
   File Description: Main Js file of the template
*/



// Sticky Navbar

function windowScroll() {
    const navbar = document.getElementById("navbar-sticky");
    if (navbar) {
        if (document.body.scrollTop >= 50 || document.documentElement.scrollTop >= 50) {
            navbar.classList.add("nav-sticky");
        } else {
            navbar.classList.remove("nav-sticky");
        }
    }
}

window.addEventListener("scroll", (ev) => {
    ev.preventDefault();
    windowScroll();
});
