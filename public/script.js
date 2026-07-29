// ==========================
// TYPING EFFECT
// ==========================


const texts = [

    "IT Student",
    "Frontend Developer",
    "Backend Enthusiast",
    "Technology Explorer"

];


let textIndex = 0;
let charIndex = 0;
let deleting = false;


const typingElement = document.getElementById("typing");



function typingEffect() {


    const currentText = texts[textIndex];


    if (!deleting) {


        typingElement.textContent =
            currentText.substring(0, charIndex + 1);


        charIndex++;



        if (charIndex === currentText.length) {


            deleting = true;


            setTimeout(typingEffect, 1500);


            return;


        }


    } else {


        typingElement.textContent =
            currentText.substring(0, charIndex - 1);



        charIndex--;



        if (charIndex === 0) {


            deleting = false;


            textIndex++;



            if (textIndex >= texts.length) {

                textIndex = 0;

            }


        }


    }



    setTimeout(
        typingEffect,
        deleting ? 40 : 80
    );


}



typingEffect();








// ==========================
// SMOOTH SCROLL
// ==========================


document.querySelectorAll("a[href^='#']")
.forEach(link => {


    link.addEventListener("click", function(e){


        e.preventDefault();



        const target =
            document.querySelector(
                this.getAttribute("href")
            );



        if(target){


            target.scrollIntoView({

                behavior:"smooth"

            });


        }


    });


});








// ==========================
// 3D CARD EFFECT
// ==========================


const cards =
document.querySelectorAll(".card");



cards.forEach(card => {


    card.addEventListener(
        "mousemove",
        (event)=>{


        const rect =
        card.getBoundingClientRect();



        const x =
        event.clientX - rect.left;



        const y =
        event.clientY - rect.top;



        const rotateX =
        -(y - rect.height / 2) / 15;



        const rotateY =
        (x - rect.width / 2) / 15;




        card.style.transform = `

        perspective(700px)

        rotateX(${rotateX}deg)

        rotateY(${rotateY}deg)

        scale(1.05)

        `;



    });



    card.addEventListener(
        "mouseleave",
        ()=>{


        card.style.transform = "";


    });



});









// ==========================
// SCROLL REVEAL
// ==========================


const sections =
document.querySelectorAll("section");



const observer =
new IntersectionObserver(
(entries)=>{


entries.forEach(entry=>{


if(entry.isIntersecting){


entry.target.classList.add(
"show"
);


}


});


},
{

threshold:0.2

});



sections.forEach(section=>{


section.classList.add("hidden");


observer.observe(section);


});