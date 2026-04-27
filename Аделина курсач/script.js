const header = document.getElementById("header");
const heroMedia = document.getElementById("heroMedia");
const missionBg = document.querySelector(".mission__bg");
const revealItems = document.querySelectorAll(".reveal-up");

function updateHeaderState() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 20);
}

function handleHeroMouseMove(event) {
  if (!heroMedia) return;
  const x = (event.clientX / window.innerWidth - 0.5) * 12;
  const y = (event.clientY / window.innerHeight - 0.5) * 8;
  heroMedia.style.transform = `scale(1.07) translate3d(${x}px, ${y}px, 0)`;
}

function handleHeroMouseLeave() {
  if (!heroMedia) return;
  heroMedia.style.transform = "scale(1.07) translate3d(0, 0, 0)";
}

function updateMissionParallax() {
  if (!missionBg) return;
  const section = document.getElementById("mission");
  if (!section) return;
  const rect = section.getBoundingClientRect();
  const offset = (rect.top - window.innerHeight / 2) * -0.16;
  missionBg.style.transform = `translate3d(0, ${offset}px, 0) scale(1.04)`;
}

function initRevealAnimation() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach(item => observer.observe(item));
}

function init() {
  updateHeaderState();
  updateMissionParallax();
  initRevealAnimation();
  document.addEventListener("mousemove", handleHeroMouseMove);
  document.addEventListener("mouseleave", handleHeroMouseLeave);
  window.addEventListener("scroll", () => {
    updateHeaderState();
    updateMissionParallax();
  });
}

init();
// ========== ОТЗЫВЫ НА СТРАНИЦЕ ПИТОМЦЫ ==========
(function() {
  // Проверяем, что мы на странице питомцев
  const reviewsGrid = document.getElementById('reviewsGrid');
  if (!reviewsGrid) return;

  let reviews = [];

  // Загрузка отзывов из localStorage
  function loadReviews() {
    const saved = localStorage.getItem('pugachan_reviews');
    if (saved) {
      try {
        reviews = JSON.parse(saved);
        renderReviews();
      } catch(e) { console.error(e); }
    }
  }

  // Сохранение отзывов
  function saveReviews() {
    localStorage.setItem('pugachan_reviews', JSON.stringify(reviews));
  }

  // Определение типа питомца
  function getPetType(petName) {
    const cats = ['Тея', 'Бакс', 'Белла', 'Амелия', 'Оскар'];
    const dogs = ['Боня', 'Соня', 'Хлоя', 'Каштанка'];
    if (cats.includes(petName)) return 'cat';
    if (dogs.includes(petName)) return 'dog';
    return 'all';
  }

  // Рендер отзывов
  function renderReviews(filter = 'all') {
    if (!reviewsGrid) return;
    
    let filteredReviews = reviews;
    if (filter === 'cat') {
      filteredReviews = reviews.filter(r => getPetType(r.pet) === 'cat');
    } else if (filter === 'dog') {
      filteredReviews = reviews.filter(r => getPetType(r.pet) === 'dog');
    }
    
    if (filteredReviews.length === 0) {
      reviewsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:2rem; color:#888;">Пока нет отзывов. Будьте первым!</div>`;
      return;
    }
    
    reviewsGrid.innerHTML = filteredReviews.map(review => `
      <article class="review-card" data-id="${review.id}" data-pet-type="${getPetType(review.pet)}">
        <button class="review-card__delete" onclick="deleteReview('${review.id}')">×</button>
        ${review.image 
          ? `<img class="review-card__image" src="${review.image}" alt="Фото">`
          : `<div class="review-card__no-image">🐾</div>`
        }
        <div class="review-card__content">
          <span class="review-card__pet">${escapeHtml(review.pet)}</span>
          <p class="review-card__text">${escapeHtml(review.text)}</p>
          <div class="review-card__author">
            <strong>${escapeHtml(review.author)}</strong> • ${review.date}
          </div>
        </div>
      </article>
    `).join('');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Удаление отзыва
  window.deleteReview = function(id) {
    if (confirm('Удалить этот отзыв?')) {
      reviews = reviews.filter(r => r.id !== id);
      saveReviews();
      const currentFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
      renderReviews(currentFilter);
    }
  };

  // Получение текущей даты
  function getFormattedDate() {
    const now = new Date();
    const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }

  // Обработка формы
  const form = document.getElementById('reviewForm');
  if (form) {
    const photoInput = document.getElementById('reviewPhoto');
    const imagePreview = document.getElementById('imagePreview');
    
    photoInput?.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(event) {
          imagePreview.innerHTML = `<img src="${event.target.result}" alt="Превью">`;
          imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        imagePreview.innerHTML = '';
        imagePreview.style.display = 'none';
      }
    });
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const author = document.getElementById('reviewName')?.value.trim();
      const pet = document.getElementById('reviewPet')?.value;
      const text = document.getElementById('reviewText')?.value.trim();
      const photoFile = photoInput?.files[0];
      
      if (!author) {
        alert('Пожалуйста, введите ваше имя');
        return;
      }
      if (!text) {
        alert('Пожалуйста, напишите текст отзыва');
        return;
      }
      if (text.length < 5) {
        alert('Отзыв должен содержать хотя бы 5 символов');
        return;
      }
      
      const newReview = {
        id: Date.now().toString(),
        author: author,
        pet: pet,
        text: text,
        date: getFormattedDate(),
        image: null
      };
      
      if (photoFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
          newReview.image = event.target.result;
          reviews.unshift(newReview);
          saveReviews();
          renderReviews(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
          form.reset();
          imagePreview.innerHTML = '';
          imagePreview.style.display = 'none';
          alert('Отзыв опубликован! Спасибо!');
        };
        reader.readAsDataURL(photoFile);
      } else {
        reviews.unshift(newReview);
        saveReviews();
        renderReviews(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
        form.reset();
        alert('Отзыв опубликован! Спасибо!');
      }
    });
  }
  
  // Фильтры
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filter = this.dataset.filter;
      renderReviews(filter);
    });
  });
  
  // Загружаем отзывы
  loadReviews();
})();