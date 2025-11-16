const $banner = document.querySelector(".banner");
const $input = document.querySelector("input");
const $overlay = document.querySelector(".overlay");
const $favoritePictures = document.querySelector(".favoritePictures");
const $allBtn = document.getElementById("allBtn");

const baseUrl = "https://api.wikimedia.org/feed/v1/wikipedia/en/featured/";

// Array to hold favorite images
// interface FavoriteItem {
//   date: string;
//   imageThumb: string;
//   imageSource: string;
// }
// const favorites: FavoriteItem[] = [];
const favorites = [];

function displayFull(src) {
  $overlay.style.visibility = "visible";
  $overlay.innerHTML = `
    <img src='${src}' alt='Full Size Image'>
  `;
  $overlay.addEventListener("click", () => {
    $overlay.style.visibility = "hidden";
    $overlay.innerHTML = "";
  });
}

function addtoFavorites(date, imageThumb, imageSource) {
  //Check if the image is already in favorites
  let exists = false;
  for (let item of favorites) {
    if (item.date === date) {
      exists = true;
      break;
    }
  }
  if (!exists) {
    favorites.push({ date, imageThumb, imageSource });
    renderFavorites();
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert("Added to favorites!");
  } else {
    alert("Already in favorites!");
  }
}

function removeFromFavorites(date) {
  const index = favorites.findIndex((item) => item.date === date);
  if (index !== -1) {
    favorites.splice(index, 1);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();
  } else {
    alert("Item not found in favorites!");
  }
}

async function renderBanner(dateStr) {
  const formatedDate = dateStr.replaceAll("-", "/");
  try {
    const res = await fetch(`${baseUrl}${formatedDate}`);
    const data = await res.json();
    $banner.innerHTML = `
      <div class="bannerImg">
        <img src='${data.image.thumbnail.source}' alt='${data.image.title}'>
        <div class="starBtn">
          <img src="./images/star.svg" alt="a star icon">
        </div>
      </div>
      <div class="bannerContent">
        <div>
          <h2>${data.image.title.split(":")[1]}</h2>
          <p>${data.mostread.date.slice(0, -1)}</p>
          </div>
            <p >${data.image.description.text}</p>
          <div>
          <button id='expandImg'>Expand Image</button>
        </div>
      </div>
    `;

    // Add event listener for the star button
    const $starBtn = document.querySelector(".starBtn");
    $starBtn.addEventListener("click", () => {
      addtoFavorites(
        dateStr,
        data.image.thumbnail.source,
        data.image.image.source
      );
    });

    // Add event listener for the "Expand Image" button
    const $expandImg = document.getElementById("expandImg");
    $expandImg.addEventListener("click", () => {
      displayFull(data.image.image.source);
    });
  } catch (err) {
    $banner.innerHTML = `
      <div class="bannerImg">
        <img src="./images/noimage.png" alt="image placeholder">  
      </div>
      <div class="bannerContent">
        <div>
          <h2>Unable to fetch the image </h2>
          <p>${err.message}</p>
        </div>               
      </div>
    `;
    console.error("Error:", err);
  }
}

function renderFavorites() {
  $favoritePictures.innerHTML = "";
  favorites.forEach((item) => {
    const favDiv = document.createElement("div");
    favDiv.className = "favoriteImg";
    favDiv.innerHTML = `
      <img src='${item.imageThumb}' alt='Favorite Image'>
      <div class="removeBtn">
        <img src="./images/remove.svg" alt="" />
      </div>
    `;

    // Add event listener for remove button
    const $removeBtn = favDiv.querySelector(".removeBtn");
    $removeBtn.addEventListener("click", () => {
      removeFromFavorites(item.date);
    });
    $favoritePictures.appendChild(favDiv);

    // Add event listener to display full image on click
    const $favImg = favDiv.querySelector("img");
    $favImg.addEventListener("click", () => {
      displayFull(item.imageSource);
    });
  });
}

$input.addEventListener("change", (e) => {
  const date = e.target.value;
  renderBanner(date);
});

//When document loads, set input to today's date and render banner
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  $input.value = today;
  renderBanner(today);
  // Load favorites from localStorage
  const storedFavorites = localStorage.getItem("favorites");
  if (storedFavorites) {
    const parsedFavorites = JSON.parse(storedFavorites);
    parsedFavorites.forEach((item) => favorites.push(item));
    renderFavorites();
  }
});

// Event listener for "View All" button
$allBtn.addEventListener("click", () => {
  $favoritePictures.style.flexWrap = "wrap";
});
