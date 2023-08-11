import config from "./config.js";
const summary_btn = document.querySelector(".get_summary_btn");
const summary_links_container = document.querySelector(".summary_links");
const summary_output = document.querySelector(".summary_output");
let links = JSON.parse(localStorage.getItem("links")) || [];

renderLinks();
summary_output.innerHTML = ` <p style="text-align: center; margin-top: 30px">
Let's get summarized this article 😊
</p>`;

summary_btn.addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url;
    links.push(url);
    localStorage.setItem("links", JSON.stringify(links));
    const changedUrl = encodeUrl(url);
    renderLinks();

    getSummary(changedUrl);
  });
});

function encodeUrl(url) {
  return encodeURIComponent(url);
}

function renderLinks() {
  let html = "";
  for (let i = 0; i < links.length; i++) {
    html += `<li><a href="${links[i]}">${links[i]}</a><button class="del" data-index="${i}">Delete</button></li>`;
  }
  summary_links_container.innerHTML = html;

  // Attach event handler using event delegation
  summary_links_container.addEventListener("click", handleDeleteLink);
}

function handleDeleteLink(event) {
  if (event.target.classList.contains("del")) {
    const index = event.target.dataset.index;
    links.splice(index, 1);
    localStorage.setItem("links", JSON.stringify(links));
    renderLinks();
  }
}

async function getSummary(url) {
  const api = `${config.API_URL}?url=${url}`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": `${config.API_KEY}`,
      "X-RapidAPI-Host": "article-extractor-and-summarizer.p.rapidapi.com",
    },
  };
  summary_output.innerHTML = ` <p style="text-align: center; margin-top: 30px">
loading...please wait....
</p>`;
  try {
    const response = await fetch(api, options);
    const result = await response.text();
    console.log("loaded");

    console.log(result);
    summary_output.innerHTML = result.slice(12, -2).replaceAll("\n", "<br/>");
  } catch (error) {
    console.error(error);
  }
}
