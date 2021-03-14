let btn = document.querySelector(".create-bin");

btn.addEventListener("click", async (event) => {
  let res = await fetch("/create", {
    method: "POST",
  })

  res = await res.text()

  if (res) {
    window.location.href = `/${res}`
  }
});