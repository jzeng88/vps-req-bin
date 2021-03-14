const animation = document.querySelector('.seal-approval');
animation.addEventListener('animationend', () => {
  let preloader = document.querySelector(".loader_bg");

  setTimeout(function(){preloader.style.opacity = '0';}, 1500);
  setTimeout(function(){preloader.remove()}, 2000);
});