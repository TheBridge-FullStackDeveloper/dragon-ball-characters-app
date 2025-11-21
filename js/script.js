const charactersContainer = document.getElementById("characters")
const btnPrev = document.getElementById("btn_prev")
const btnNext = document.getElementById("btn_next")
const favoritesContainer = document.getElementById("favorites")
const searchInput = document.getElementById("searchInput")

let currentUrl = "https://dragonball-api.com/api/characters"
let characters = []

let favorites = JSON.parse(localStorage.getItem("favorites")) || []

const loadCharacters = (url) => {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al acceder a la API")
      }
      return response.json()
    })
    .then((data) => {
      console.log("Datos recibidos", data)

      characters = data.items || data

      if (data.links && charactersContainer) {
        updatePagination(data.links.next, data.links.previous)
      }

      if (charactersContainer) {
        renderCharacters(characters, charactersContainer)
      }

      if (favoritesContainer) {
        renderCharacters(favorites, favoritesContainer)
      }
    })
    .catch((err) => console.error("Error al cargar", err))
}

loadCharacters(currentUrl)

const renderCharacters = (characterList, container) => {
  container.innerHTML = ""
  if (!characterList) return

  for (const character of characterList) {
    const { id, name, race, gender, ki, maxKi, affiliation, image } = character

    const card = document.createElement("div")
    card.className = "card"

    const isFav = favorites.some((favorite) => favorite.id === id)
    if (isFav) {
      card.classList.add("card_favorite")
    }

    card.innerHTML = `
    <div class="container_img">
      <img src="${image}" alt="${name}" class="img_character">
    </div>
    <div class="container_info">
        <h3>${name}</h3>
        <span class="info_orange">${race} - ${gender}</span>
        <span class="info_white">Base KI:</span>
        <span class="info_orange">${ki}</span>
        <span class="info_white">Total KI:</span>
        <span class="info_orange">${maxKi}</span>
        <span class="info_white">Affiliation</span>
        <span class="info_orange">${affiliation}</span>
    </div>
    `
    card.addEventListener("click", () => {
      toggleFavorites(id)
    })

    container.appendChild(card)
  }
}

const updatePagination = (nextUrl, prevUrl) => {
  if (nextUrl) {
    btnNext.disabled = false
    btnNext.dataset.url = nextUrl
  } else {
    btnNext.disabled = true
  }

  if (prevUrl) {
    btnPrev.disabled = false
    btnPrev.dataset.url = prevUrl
  } else {
    btnPrev.disabled = true
  }
}

if (charactersContainer) {
  btnNext.addEventListener("click", () => {
    const nextUrl = btnNext.dataset.url
    if (nextUrl) loadCharacters(nextUrl)
  })

  btnPrev.addEventListener("click", () => {
    const prevUrl = btnPrev.dataset.url
    if (prevUrl) loadCharacters(prevUrl)
  })
}

const toggleFavorites = (id) => {
  const exists = favorites.some((favorite) => favorite.id === id)

  if (exists) {
    favorites = [...favorites.filter((favorite) => favorite.id !== id)]
  } else {
    const newFavCharacter = characters.find((character) => character.id === id)
    favorites = [...favorites, newFavCharacter]
  }

  localStorage.setItem("favorites", JSON.stringify(favorites))

  if (favoritesContainer) {
    renderCharacters(favorites, favoritesContainer)
  }

  if (charactersContainer) {
    renderCharacters(characters, charactersContainer)
  }
}

if (searchInput && charactersContainer) {
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.trim().toLowerCase()

    if (term !== "") {
      loadCharacters(`${currentUrl}?name=${term}`)
    } else {
      loadCharacters(currentUrl)
    }
  })
}

if (searchInput && favoritesContainer) {
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.trim().toLowerCase()
    const filtered = favorites.filter((favorite) =>
      favorite.name.toLowerCase().includes(term)
    )
    renderCharacters(filtered, favoritesContainer)
  })
}
