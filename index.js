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
  let exists = false; //Assume it doesn't exist
  for (let item of favorites) {
    if (item.date === date) {
      exists = true; //Found a match then change to true
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
  const index = favorites.findIndex((item) => item.date === date); //Find the index of the item to be removed
  if (index !== -1) {
    favorites.splice(index, 1); //Remove the item at the found index
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();
  } else {
    alert("Item not found in favorites!");
  }
}

async function renderBanner(dateStr) {
  const formatedDate = dateStr.replaceAll("-", "/"); //Convert date to YYYY/MM/DD format
  try {
    const res = await fetch(`${baseUrl}${formatedDate}`); //Send GET request to Wikimedia API
    const data = await res.json(); //Parse the JSON response
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
          <p>${dateStr}</p>
        </div>
        <p>${data.image.description.text}</p>
        <div>
          <button id='expandImg'>Expand Image</button>
        </div>
      </div>
    `; //Fill the template with fetched data

    // Add event listener for the star button to add to favorites
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
        <img src="./images/remove.svg" alt="removeBtn" />
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

// Event listener for "View All" button
$allBtn.addEventListener("click", () => {
  $favoritePictures.style.flexWrap = "wrap"; //Change layout to wrap
});

//When document loads, set input to today's date and render banner
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  $input.value = today;
  renderBanner(today);
  // Load favorites from localStorage
  const storedFavorites = localStorage.getItem("favorites"); //Retrieve favorites from localStorage
  if (storedFavorites) {
    const parsedFavorites = JSON.parse(storedFavorites); //Parse the JSON string to object
    parsedFavorites.forEach((item) => favorites.push(item));
    renderFavorites();
  }
});
