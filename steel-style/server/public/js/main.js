document.addEventListener('DOMContentLoaded', function() {

  var page = window.location.pathname;

  /* ===== SHARED: Modal, Mobile menu, Toast ===== */

  /* Mobile menu */
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileClose = document.getElementById('mobileClose');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() { mobileMenu.classList.add('open'); });
    if (mobileClose) mobileClose.addEventListener('click', function() { mobileMenu.classList.remove('open'); });
    document.addEventListener('click', function(e) {
      if (mobileMenu.classList.contains('open') && !mobileMenu.contains(e.target) && e.target !== hamburger) {
        mobileMenu.classList.remove('open');
      }
    });
  }

  /* Modal */
  window.openModal = function(type) {
    var overlay = document.getElementById('modalOverlay');
    if (!overlay) return;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.getElementById('formSuccess').classList.remove('show');
    document.getElementById('contactForm').style.display = '';
    document.getElementById('contactForm').reset();
  };

  window.closeModal = function() {
    var overlay = document.getElementById('modalOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  var modalOv = document.getElementById('modalOverlay');
  if (modalOv) {
    modalOv.addEventListener('click', function(e) {
      if (e.target === e.currentTarget) window.closeModal();
    });
  }
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') window.closeModal(); });

  /* Phone mask */
  var phoneInput = document.getElementById('formPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function() {
      var v = this.value.replace(/\D/g, '');
      if (v.length === 0) { this.value = ''; return; }
      if (v.startsWith('7') || v.startsWith('8')) v = '7' + v.slice(1);
      var formatted = '+7 ';
      if (v.length > 1) formatted += '(' + v.slice(1, 4);
      if (v.length >= 5) formatted += ') ' + v.slice(4, 7);
      if (v.length >= 8) formatted += '-' + v.slice(7, 9);
      if (v.length >= 10) formatted += '-' + v.slice(9, 11);
      this.value = formatted;
    });
  }

  /* Contact form */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var btn = document.getElementById('formSubmit');
      var name = document.getElementById('formName').value.trim();
      var phone = document.getElementById('formPhone').value.trim();
      var email = document.getElementById('formEmail').value.trim();
      var message = document.getElementById('formMessage').value.trim();
      if (!name || !phone) return;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
      try {
        var res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name, phone: phone, email: email, message: message })
        });
        var data = await res.json();
        if (data.success) {
          document.getElementById('contactForm').style.display = 'none';
          document.getElementById('formSuccess').classList.add('show');
          showToast('Сообщение отправлено!', 'success');
        } else {
          showToast('Ошибка: ' + (data.error || 'попробуйте позже'), 'error');
        }
      } catch (e) {
        showToast('Ошибка соединения. Попробуйте позже.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Отправить <i class="fas fa-arrow-right"></i>';
      }
    });
  }

  /* Toast */
  function showToast(text, type) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<i class="fas ' + (type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle') + '"></i><span>' + text + '</span>';
    document.body.appendChild(toast);
    requestAnimationFrame(function() { toast.classList.add('show'); });
    setTimeout(function() {
      toast.classList.remove('show');
      setTimeout(function() { toast.remove(); }, 400);
    }, 4000);
  }

  /* ===== PAGE: Catalog ===== */

  if (page === '/catalog') {
    var currentSeries = 'all';
    var currentSort = 'default';
    var allProducts = [];

    window.filterSeries = function(series) {
      currentSeries = series;
      document.querySelectorAll('.side-menu a[data-filter]').forEach(function(a) {
        a.classList.toggle('active', a.dataset.filter === series);
      });
      loadProducts();
      return false;
    };

    window.sortProducts = function(sort) {
      currentSort = sort;
      loadProducts();
    };

    function loadProducts() {
      var grid = document.getElementById('productGrid');
      var count = document.getElementById('catalogCount');
      if (!grid) return;
      grid.innerHTML = '<div class="loader-mini"></div>';
      var params = new URLSearchParams();
      if (currentSeries !== 'all') params.set('series', currentSeries);
      if (currentSort !== 'default') params.set('sort', currentSort);
      fetch('/api/products?' + params.toString())
        .then(function(r) { return r.json(); })
        .then(function(data) {
          allProducts = data;
          if (!data.length) {
            grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;padding:60px 0">Нет товаров</p>';
            if (count) count.textContent = '0 товаров';
            return;
          }
          if (count) count.textContent = data.length + ' ' + declOfNum(data.length, ['товар','товара','товаров']);
          grid.innerHTML = data.map(function(p) {
            return '<div class="product-card" onclick="location.href=\'/product?id=' + p.id + '\'">' +
              '<div class="product-card-image"><img src="' + p.img + '" alt="' + p.name + '" loading="lazy" onerror="this.src=\'images/unnamed.jpg\'"></div>' +
              '<div class="product-card-body">' +
              '<div class="product-card-name">' + p.name + '</div>' +
              '<div class="product-card-series">' + (p.series === 'standart' ? 'Стандарт' : p.series === 'mechta' ? 'Мечта' : 'Уют') + '</div>' +
              '<button class="product-card-btn">Подробнее</button></div></div>';
          }).join('');
        })
        .catch(function() {
          grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#e74c3c;padding:60px 0">Ошибка загрузки</p>';
        });
    }

    function declOfNum(n, forms) {
      return forms[n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
    }

    loadProducts();
  }

  /* ===== PAGE: About ===== */

  if (page === '/about') {
    var aboutData = {
      'about': { title: 'О компании', html: '<p style="font-size:1.05em">ООО ПКФ «Стальной стиль» является одной из ведущих фирм Республики Марий Эл по производству металлических дверей. Начало производства датируется 2010 годом, за это время нами приобретен большой опыт в данной сфере, применяются современные технологии производства.</p><p>Предприятием ежемесячно разрабатываются новые модели по дизайну, с различными вариантами замков и фурнитуры, толщине косяка и полотна. В начале 2019 году запущена новая линия по производству дверей на пенополистироле, тем самым увеличив мощности до 4000 тысяч дверей в месяц.</p><p>Продукция ООО ПКФ «Стальной стиль» пользуется спросом, как на Российском рынке, так и в странах ближнего и дальнего зарубежья.</p><blockquote>Цель компании — создание лучших условий в работе с партнерами!<br><strong>Залог нашего успеха — Наша команда, и наши надежные партнеры!</strong></blockquote>' },
      'production': { title: 'Производство', html: '<p>Собственное производство компании ООО ПКФ «Стальной стиль» оснащено современным оборудованием, позволяющим выпускать металлические двери высокого качества.</p><p>Производственные мощности позволяют изготавливать до 4000 дверей в месяц. Мы постоянно расширяем ассортимент и внедряем новые технологии.</p><p>Мы используем только качественные материалы: листовой металл, минеральную вату и пенополистирол для утепления, надежные замки и фурнитуру от ведущих производителей.</p>' },
      'vacancies': { title: 'Вакансии', html: '<p>В связи с расширением производства мы приглашаем к сотрудничеству специалистов различных направлений.</p><p>По вопросам трудоустройства обращайтесь по телефону: <strong>8 (8362) 33-53-41</strong></p><p>Или направляйте резюме на e-mail: <strong>st.style@bk.ru</strong></p>' },
      'certificate': { title: 'Сертификат', html: '<p>Продукция ООО ПКФ «Стальной стиль» сертифицирована и соответствует всем требованиям качества и безопасности.</p><p>По вопросам получения копий сертификатов обращайтесь к нашим менеджерам.</p>' },
      'warranty': { title: 'Гарантия', html: '<p>Мы предоставляем гарантию на все наши изделия. Сроки гарантии обсуждаются индивидуально и зависят от модели двери и условий эксплуатации.</p><p>Наши специалисты всегда готовы проконсультировать вас по вопросам эксплуатации и ухода за дверьми.</p>' }
    };

    window.showSub = function(section, sub) {
      var data = aboutData[sub];
      if (!data) return false;
      document.getElementById('aboutTitle').textContent = data.title;
      document.getElementById('aboutBreadcrumb').textContent = data.title;
      document.getElementById('aboutContent').querySelector('.rich-text').innerHTML = data.html;
      document.querySelectorAll('.side-menu a[data-sub]').forEach(function(a) {
        a.classList.toggle('active', a.dataset.sub === sub);
      });
      window.scrollTo({ top: 0 });
      return false;
    };
  }

  /* ===== PAGE: Painting ===== */

  if (page === '/painting') {
    var paintSubs = {
      'painting': { title: 'Виды покраски' },
      'outer-finish': { title: 'Наружная отделка' },
      'inner-finish': { title: 'Внутренняя отделка' },
      'custom-doors': { title: 'Двери на заказ' }
    };

    var paintContent = {
      'outer-finish': '<div class="rich-text"><p>Варианты наружной отделки:</p><ul><li>Порошково-полимерная покраска (шагрень, молоток, муар, антик)</li><li>Ламинирование ПВХ пленками</li><li>Отделка МДФ панелями</li><li>Кованые элементы</li></ul></div>',
      'inner-finish': '<div class="rich-text"><p>Варианты внутренней отделки:</p><ul><li>МДФ панели различных цветов и фактур</li><li>Ламинированные покрытия</li><li>Порошковая покраска</li><li>Зеркальные панели</li></ul></div>',
      'custom-doors': '<div class="rich-text"><p>Мы изготавливаем металлические двери по индивидуальным размерам и проектам. Вы можете заказать дверь с любыми параметрами:</p><ul><li>Нестандартные размеры</li><li>Индивидуальный дизайн</li><li>Выбор материалов отделки</li><li>Выбор замков и фурнитуры</li><li>Усиленная конструкция</li></ul><button class="btn btn-accent" onclick="openModal(\'contact\')" style="margin-top:16px">Оформить заказ</button></div>'
    };

    window.showSub = function(section, sub) {
      document.getElementById('paintTitle').textContent = paintSubs[sub].title;
      document.getElementById('paintBreadcrumb').textContent = paintSubs[sub].title;
      document.querySelectorAll('.side-menu a[data-sub]').forEach(function(a) {
        a.classList.toggle('active', a.dataset.sub === sub);
      });
      var inner = document.getElementById('paintInner');
      if (sub === 'painting') {
        inner.innerHTML = '<div class="paint-grid" id="paintGrid"><div class="loader-mini"></div></div>';
        loadPaints();
      } else {
        inner.innerHTML = paintContent[sub];
      }
      window.scrollTo({ top: 0 });
      return false;
    };

    function loadPaints() {
      var grid = document.getElementById('paintGrid');
      if (!grid) return;
      fetch('/api/paints')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          grid.innerHTML = data.map(function(p) {
            return '<div class="paint-card"><div class="paint-image"><img src="images/' + p.file + '" alt="' + p.name + '" loading="lazy"></div><div class="paint-name">' + p.name + '</div></div>';
          }).join('');
        })
        .catch(function() {
          grid.innerHTML = '<p style="text-align:center;color:#e74c3c;padding:60px 0">Ошибка загрузки</p>';
        });
    }

    /* Check URL hash for sub-section */
    var hash = window.location.hash.replace('#', '');
    if (hash && paintSubs[hash]) {
      setTimeout(function() { showSub('paint', hash); }, 100);
    } else {
      loadPaints();
    }
  }

  /* ===== PAGE: Product detail ===== */

  if (page === '/product') {
    var params = new URLSearchParams(window.location.search);
    var productId = params.get('id');
    if (productId) {
      fetch('/api/products/' + productId)
        .then(function(r) { return r.json(); })
        .then(function(p) {
          if (p.error) { document.getElementById('productDetailContent').innerHTML = '<p>Товар не найден</p>'; return; }
          var html = '<div class="product-detail">' +
            '<div class="product-detail-image"><img src="' + p.img + '" alt="' + p.name + '" onerror="this.src=\'images/unnamed.jpg\'"></div>' +
            '<div class="product-detail-info">' +
            '<h1>' + p.name + '</h1>' +
            '<p class="product-detail-desc">' + p.desc + '</p>' +
            '<h2 class="spec-title">Характеристики модели</h2>' +
            '<ul class="specs-list">';
          var specs = p.specs || {};
          for (var key in specs) {
            html += '<li><span>' + key + '</span><span>' + specs[key] + '</span></li>';
          }
          html += '</ul>' +
            '<button class="btn btn-accent" onclick="openModal(\'contact\')" style="margin-top:30px"><i class="fas fa-phone"></i> Узнать стоимость</button>' +
            '</div></div>';
          document.getElementById('productDetailContent').innerHTML = html;
          document.title = p.name + ' — Стальной Стиль';
        })
        .catch(function() {
          document.getElementById('productDetailContent').innerHTML = '<p>Ошибка загрузки товара</p>';
        });
    } else {
      document.getElementById('productDetailContent').innerHTML = '<p>Товар не указан. <a href="/catalog">Вернуться в каталог</a></p>';
    }
  }

  /* ===== Reveal animations (homepage) ===== */
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(function(el) { revealObserver.observe(el); });
});
