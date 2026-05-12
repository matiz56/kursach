// ==================== ОСНОВНЫЕ ФУНКЦИИ (БЕЗ ДУБЛИРОВАНИЯ) ====================

const header = document.getElementById("header");
const heroMedia = document.getElementById("heroMedia");
const missionBg = document.querySelector(".mission__bg");
const revealItems = document.querySelectorAll(".reveal-up");

function updateHeaderState() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 20);
}

// === ПАРАЛЛАКС - ИСПРАВЛЕННАЯ ВЕРСИЯ (НЕ СЪЕЗЖАЕТ) ===
let ticking = false;
let lastScrollY = 0;

function updateParallax() {
  const scrollY = window.scrollY;
  
  // Параллакс для hero - очень медленное движение, ограниченное
  if (heroMedia) {
    const offset = Math.min(scrollY * 0.2, 80);
    heroMedia.style.transform = `translate3d(0, ${offset}px, 0) scale(1.07)`;
  }
  
  // Параллакс для секции миссии
  if (missionBg) {
    const section = document.getElementById("mission");
    if (section) {
      const rect = section.getBoundingClientRect();
      const offset = Math.max(Math.min((rect.top - window.innerHeight / 2) * -0.1, 50), -50);
      missionBg.style.transform = `translate3d(0, ${offset}px, 0) scale(1.04)`;
    }
  }
  
  ticking = false;
}

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(updateParallax);
    ticking = true;
  }
  updateHeaderState();
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
  updateParallax();
  initRevealAnimation();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => requestAnimationFrame(updateParallax));
}

init();

// ==================== ОТЗЫВЫ НА СТРАНИЦЕ ПИТОМЦЫ ====================
(function() {
  const reviewsGrid = document.getElementById('reviewsGrid');
  if (!reviewsGrid) return;

  let reviews = [];

  function loadReviews() {
    const saved = localStorage.getItem('pugachan_reviews');
    if (saved) {
      try {
        reviews = JSON.parse(saved);
        renderReviews();
      } catch(e) { console.error(e); }
    }
  }

  function saveReviews() {
    localStorage.setItem('pugachan_reviews', JSON.stringify(reviews));
  }

  function getPetType(petName) {
    const cats = ['Тея', 'Бакс', 'Белла', 'Амелия', 'Оскар'];
    const dogs = ['Боня', 'Соня', 'Хлоя', 'Каштанка'];
    if (cats.includes(petName)) return 'cat';
    if (dogs.includes(petName)) return 'dog';
    return 'all';
  }

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

  window.deleteReview = function(id) {
    if (confirm('Удалить этот отзыв?')) {
      reviews = reviews.filter(r => r.id !== id);
      saveReviews();
      const currentFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
      renderReviews(currentFilter);
    }
  };

  function getFormattedDate() {
    const now = new Date();
    const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }

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
      
      function publishReview() {
        reviews.unshift(newReview);
        saveReviews();
        renderReviews(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
        form.reset();
        if (imagePreview) {
          imagePreview.innerHTML = '';
          imagePreview.style.display = 'none';
        }
        alert('Отзыв опубликован! Спасибо!');
      }
      
      if (photoFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
          newReview.image = event.target.result;
          publishReview();
        };
        reader.readAsDataURL(photoFile);
      } else {
        publishReview();
      }
    });
  }
  
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filter = this.dataset.filter;
      renderReviews(filter);
    });
  });
  
  loadReviews();
})();

// ==================== ПЛАВНОЕ ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ ====================
(function() {
    const animatedElements = document.querySelectorAll('.priority, .pet-item, .review-card, .partner, .help__grid article, .about__text, .about__image');
    
    if (animatedElements.length === 0) return;
    
    // Добавляем CSS классы
    const style = document.createElement('style');
    style.textContent = `
        .fade-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1), transform 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        .fade-on-scroll.visible {
            opacity: 1;
            transform: translateY(0);
        }
        .scroll-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: #41b9c2;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .scroll-to-top.show {
            opacity: 1;
            visibility: visible;
        }
        .scroll-to-top:hover {
            background: #359ea6;
            transform: scale(1.1);
        }
        @media (max-width: 768px) {
            .scroll-to-top {
                width: 40px;
                height: 40px;
                font-size: 20px;
                bottom: 20px;
                right: 20px;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Добавляем класс анимации всем элементам
    animatedElements.forEach(el => {
        el.classList.add('fade-on-scroll');
    });
    
    // Настройка IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -30px 0px" });
    
    document.querySelectorAll('.fade-on-scroll').forEach(el => {
        observer.observe(el);
    });
})();

// ==================== КНОПКА "НАВЕРХ" ====================
(function() {
    if (document.querySelector('.scroll-to-top')) return;
    
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.setAttribute('aria-label', 'Наверх');
    document.body.appendChild(scrollBtn);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    });
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();

// ==================== ПОДСВЕТКА АКТИВНОГО МЕНЮ ====================
(function() {
    const navLinks = document.querySelectorAll('.nav a');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (href === './index.html#hero' && currentPage === 'index.html')) {
            link.style.color = '#41b9c2';
            link.style.fontWeight = '700';
        }
    });
})();

// ==================== ПЛАВНАЯ ПРОКРУТКА ДЛЯ ЯКОРЕЙ ====================
(function() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
})();