import './style.css'

console.log("Testing initialasaiton of index,js");

const contentDiv = document.querySelector("#content");
const testH1 = document.createElement("h1");
testH1.textContent = "Hello World testting content from mainJS";
contentDiv.appendChild(testH1);