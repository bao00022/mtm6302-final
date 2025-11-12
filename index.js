// console.log("Hello World");

const $banner = document.querySelector(".banner");
const $input = document.querySelector("input");

async function renderBanner(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    $banner.innerHTML = `
      <div class="bannerImg">
        <img src=${data.image.image.source} alt=${data.image.title}>
        <div class="starBtn">
          <img src="./images/star.svg" alt="a star icon">
        </div>   
      </div>
      <div class="bannerContent">
        <div>
          <h2>${data.image.title}</h2>
          <p>${data.mostread.date.slice(0, -1)}</p>
          </div>                   
            <p >${data.image.description.text}</p>
          <div>
          <button>Read More</button>
        </div>               
      </div>             
    `;
  } catch (err) {
    console.error("Error:", err);
  }
}

$input.addEventListener("change", (e) => {
  const date = e.target.value;
  console.log(date);
  const replacedDate = date.replaceAll("-", "/");
  console.log(replacedDate);
  const url = `https://api.wikimedia.org/feed/v1/wikipedia/en/featured/${replacedDate}`;
  renderBanner(url);
});

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}/${month}/${day}`;
  const url = `https://api.wikimedia.org/feed/v1/wikipedia/en/featured/${formattedDate}`;
  renderBanner(url);
  $input.value = `${year}-${month}-${day}`;
});
