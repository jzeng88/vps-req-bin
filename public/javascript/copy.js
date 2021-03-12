function copy() {
  var copyText = document.querySelector("#url");
  copyText.select();
  document.execCommand("copy");
  console.log("copied")
}
document.querySelector("#copy_url").addEventListener("click", copy);