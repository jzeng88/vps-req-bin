const socket = io();

socket.emit('binUrl', window.location.pathname);
socket.on('message', (msg) => {
  let tbody = document.querySelector('tbody');
  tbody.insertAdjacentHTML("afterbegin", msg);
})