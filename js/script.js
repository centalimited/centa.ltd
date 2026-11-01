(function(){
  var $ = function(s, c){ return (c || document).querySelector(s); };
  var $$ = function(s, c){ return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var header = $('#siteHeader');
  var burger = $('#burger');
  var drawer = $('#mobileDrawer');
  var toTop = $('#toTop');
  var yearEl = $('#year');
  var faqList = $('#faqList');
  var contactForm = $('#contactForm');

  var WHATSAPP = '6287867738173';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var carousel = $('#homeCarousel');
  if (carousel){
    var slides = $$('.hero-slide', carousel);
    var dots = $$('[data-carousel-slide]', carousel);
    var currentSlide = 0;
    var carouselTimer = null;
    var touchStart = null;

    function showSlide(index){
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i){
        var isActive = i === currentSlide;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
      });
      dots.forEach(function(dot, i){
        var isActive = i === currentSlide;
        dot.classList.toggle('is-active', isActive);
        if (isActive) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    function stopCarousel(){
      if (!carouselTimer) return;
      window.clearInterval(carouselTimer);
      carouselTimer = null;
    }

    function startCarousel(){
      stopCarousel();
      if (!reduced && !document.hidden){
        carouselTimer = window.setInterval(function(){
          showSlide(currentSlide + 1);
        }, 6500);
      }
    }

    dots.forEach(function(dot){
      dot.addEventListener('click', function(){
        showSlide(Number(dot.getAttribute('data-carousel-slide')));
        startCarousel();
      });
    });

    carousel.addEventListener('mouseenter', stopCarousel);
    carousel.addEventListener('mouseleave', startCarousel);
    carousel.addEventListener('focusin', stopCarousel);
    carousel.addEventListener('focusout', function(e){
      if (!carousel.contains(e.relatedTarget)) startCarousel();
    });
    document.addEventListener('visibilitychange', function(){
      if (document.hidden) stopCarousel();
      else startCarousel();
    });

    carousel.addEventListener('pointerdown', function(e){
      if (e.pointerType !== 'touch' || e.target.closest('button,a')) return;
      touchStart = { x:e.clientX, y:e.clientY };
    });
    carousel.addEventListener('pointerup', function(e){
      if (!touchStart) return;
      var deltaX = e.clientX - touchStart.x;
      var deltaY = e.clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY)){
        showSlide(currentSlide + (deltaX < 0 ? 1 : -1));
        startCarousel();
      }
    });
    carousel.addEventListener('pointercancel', function(){ touchStart = null; });

    startCarousel();
  }

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function headerOffset(){
    var announce = document.querySelector('.announce');
    var aH = announce ? announce.offsetHeight : 0;
    var hH = header ? header.offsetHeight : 0;
    return aH + hH + 12;
  }

  function onScroll(){
    if (header){
      if (window.scrollY > 8) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    if (toTop){
      if (window.scrollY > 480) toTop.classList.add('visible');
      else toTop.classList.remove('visible');
    }
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  function closeDrawer(){
    if (!drawer || !burger) return;
    drawer.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }

  function openDrawer(){
    if (!drawer || !burger) return;
    drawer.classList.add('open');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
  }

  if (burger){
    burger.addEventListener('click', function(){
      if (drawer && drawer.classList.contains('open')) closeDrawer();
      else openDrawer();
    });
  }

  document.addEventListener('click', function(e){
    if (!drawer || !burger) return;
    if (!drawer.classList.contains('open')) return;
    if (drawer.contains(e.target) || burger.contains(e.target)) return;
    closeDrawer();
  });

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeDrawer();
  });

  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced){
    var ro = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('visible');
          ro.unobserve(entry.target);
        }
      });
    }, { rootMargin:'0px 0px -8% 0px', threshold:0.08 });
    revealEls.forEach(function(el){ ro.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('visible'); });
  }

  if (faqList){
    $$('.faq-item', faqList).forEach(function(item){
      var btn = $('.faq-q', item);
      var panel = $('.faq-a', item);
      if (!btn || !panel) return;
      btn.setAttribute('aria-expanded', 'false');

      btn.addEventListener('click', function(){
        var isOpen = item.classList.contains('open');

        $$('.faq-item', faqList).forEach(function(other){
          if (other === item) return;
          other.classList.remove('open');
          var op = $('.faq-a', other);
          var ob = $('.faq-q', other);
          if (op) op.style.maxHeight = '0px';
          if (ob) ob.setAttribute('aria-expanded', 'false');
        });

        if (isOpen){
          item.classList.remove('open');
          panel.style.maxHeight = '0px';
          btn.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('open');
          panel.style.maxHeight = panel.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    window.addEventListener('resize', function(){
      var openItem = $('.faq-item.open', faqList);
      if (!openItem) return;
      var p = $('.faq-a', openItem);
      if (p) p.style.maxHeight = p.scrollHeight + 'px';
    });
  }

  function validEmail(v){
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  function markField(field, on){
    if (!field) return;
    if (on){
      field.style.borderColor = '#f87171';
      field.style.boxShadow = '0 0 0 3px rgba(248,113,113,0.10)';
    } else {
      field.style.borderColor = '';
      field.style.boxShadow = '';
    }
  }

  if (contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();

      var nameEl = $('#contact-name');
      var emailEl = $('#contact-email');
      var companyEl = $('#contact-company');
      var messageEl = $('#contact-message');

      var name = nameEl ? nameEl.value.trim() : '';
      var email = emailEl ? emailEl.value.trim() : '';
      var company = companyEl ? companyEl.value.trim() : '';
      var message = messageEl ? messageEl.value.trim() : '';

      var valid = true;
      [nameEl, emailEl, messageEl].forEach(function(f){ markField(f, false); });

      if (!name){ markField(nameEl, true); valid = false; }
      if (!email || !validEmail(email)){ markField(emailEl, true); valid = false; }
      if (!message || message.length < 10){ markField(messageEl, true); valid = false; }

      if (!valid){
        var firstInvalid = [nameEl, emailEl, messageEl].filter(function(f){
          return f && f.style.borderColor;
        })[0];
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var lines = [
        'Halo Centa Limited!',
        '',
        '*Nama:* ' + name,
        '*Email:* ' + email,
        company ? '*Perusahaan:* ' + company : null,
        '',
        '*Pesan:*',
        message
      ].filter(function(l){ return l !== null; });

      var link = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(link, '_blank', 'noopener,noreferrer');

      var submitBtn = $('button[type="submit"]', contactForm);
      if (submitBtn){
        var original = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Membuka WhatsApp...';
        setTimeout(function(){
          submitBtn.disabled = false;
          submitBtn.innerHTML = original;
        }, 2200);
      }
    });
  }

  if (toTop){
    toTop.addEventListener('click', function(){
      window.scrollTo({ top:0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  $$('a[href^="#"]').forEach(function(link){
    link.addEventListener('click', function(e){
      var href = link.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      var target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
      window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
      history.replaceState(null, '', href);
      closeDrawer();
    });
  });

})();
