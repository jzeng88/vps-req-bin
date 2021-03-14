const socket = io();

socket.emit('binUrl', window.location.pathname);
socket.on('message', (msg) => {
  let tbody = document.querySelector('tbody');
  tbody.insertAdjacentHTML("afterbegin", msg);
})

socket.on('animatebin', () => {
  let closeBin = document.querySelector('.closed-bin');
  let openBin = document.querySelector('.open');
  closeBin.classList.add("hidden");
  openBin.classList.remove("hidden");
  openBin.classList.add("inline");

  setTimeout(function(){
    closeBin.classList.remove("hidden");
    closeBin.classList.add("inline");
    openBin.classList.add("hidden");
    closeBin.classList.remove("inline");
  }, 1000)
})