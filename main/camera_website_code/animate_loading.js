// 
// Synchonous/Fast loading animation
// 
const animateLoader = ()=>{
    const element = document.getElementById("good-component--initial-loader")
    element && element.animate(
        [
            { transform: 'rotate(0turn)' },
            { transform: 'rotate(1turn)' },
        ],
        {
            duration: 1000,
            iterations: Infinity,
            easing: 'ease',
        },
    )
}
document.body ? animateLoader() : document.addEventListener("DOMContentLoaded", animateLoader)