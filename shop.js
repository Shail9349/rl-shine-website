/* ==========================================================================
   RL Shine — Shop Page Script (Updated with variant support)
   ========================================================================== */

(function(){

  const PRODUCTS = [
    {
      id: 'rls-500', name: 'RL Shine 500ml', variant: '500ml',
      price: 109, mrp: 199, off: 45, rating: 4.7, reviews: 1423,
      badge: 'Bestseller', badgeClass: 'badge-bestseller',
      desc: 'Powerful cleaning with fresh fragrance. Up to 30 washes.',
      image: 'images/single.png'
    },
    {
      id: 'rls-twin', name: 'RL Shine Twin Pack', variant: '2×500ml',
      price: 199, mrp: 398, off: 50, rating: 4.8, reviews: 892,
      badge: 'Value Deal', badgeClass: 'badge-value',
      desc: 'Double the value for families.',
      image: 'images/twin.png'
    },
    {
      id: 'rls-triple', name: 'RL Shine Triple Pack', variant: '3×500ml',
      price: 249, mrp: 597, off: 58, rating: 4.9, reviews: 567,
      badge: 'Save 20%', badgeClass: 'badge-save',
      desc: 'The whole family, fully stocked.',
      image: 'images/triple.png'
    }
  ];

  const SUBSCRIPTIONS = [
    { id: 'sub-monthly', name: 'Monthly', price: 149, period: '/month', save: null },
    { id: 'sub-quarterly', name: 'Quarterly', price: 349, period: '/3 months', save: 'Save ₹98 (20%)', popular: true },
    { id: 'sub-halfyearly', name: 'Half-Yearly', price: 649, period: '/6 months', save: 'Save ₹199 (20%)' }
  ];

  function stars(rating){
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half?1:0));
  }

  /* ---------- Render Products ---------- */
  function renderProducts(){
    const grid = document.getElementById('productGrid');
    if(!grid) return;
    
    const qty = {};
    PRODUCTS.forEach(p => qty[p.id] = 1);

    grid.innerHTML = PRODUCTS.map((p, i) => `
      <div class="glass product-card reveal reveal-delay-${i % 3}">
        <span class="badge ${p.badgeClass}">${p.badge}</span>
        <img src="${p.image}" data-fallback="images/product-hero.png" alt="${p.name}" loading="lazy">
        <span class="variant-tag">${p.variant}</span>
        <h3>${p.name}</h3>
        <div class="rating-row"><span class="stars">${stars(p.rating)}</span> ${p.rating} (${p.reviews.toLocaleString('en-IN')})</div>
        <p class="product-desc">${p.desc}</p>
        <div class="price-block"><span class="price">₹${p.price}</span><s>₹${p.mrp}</s></div>
        <div class="off-pct">${p.off}% OFF</div>
        <div class="qty-select" data-qty-wrap="${p.id}">
          <button type="button" data-qty-minus="${p.id}" aria-label="Decrease quantity">−</button>
          <span data-qty-val="${p.id}">1</span>
          <button type="button" data-qty-plus="${p.id}" aria-label="Increase quantity">+</button>
        </div>
        <div class="card-actions">
          <button class="btn btn-outline btn-sm" data-add="${p.id}" style="flex:1;">Add to Cart</button>
          <button class="btn btn-primary btn-sm" data-buy="${p.id}" style="flex:1;">Buy Now</button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('[data-qty-plus]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.qtyPlus;
        qty[id] = Math.min(qty[id] + 1, 20);
        grid.querySelector(`[data-qty-val="${id}"]`).textContent = qty[id];
      });
    });
    grid.querySelectorAll('[data-qty-minus]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.qtyMinus;
        qty[id] = Math.max(qty[id] - 1, 1);
        grid.querySelector(`[data-qty-val="${id}"]`).textContent = qty[id];
      });
    });

    grid.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = PRODUCTS.find(x => x.id === btn.dataset.add);
        RLShine.addToCart({ 
          id: p.id, 
          name: p.name, 
          price: p.price, 
          mrp: p.mrp, 
          variant: p.variant, 
          image: p.image, 
          qty: qty[p.id] 
        });
        RLShine.showToast(`${p.name} added to cart 🛒`);
      });
    });

    grid.querySelectorAll('[data-buy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = PRODUCTS.find(x => x.id === btn.dataset.buy);
        RLShine.addToCart({ 
          id: p.id, 
          name: p.name, 
          price: p.price, 
          mrp: p.mrp, 
          variant: p.variant, 
          image: p.image, 
          qty: qty[p.id] 
        });
        window.location.href = 'checkout.html';
      });
    });
  }

  /* ---------- Render Subscriptions ---------- */
  function renderSubscriptions(){
    const grid = document.getElementById('subGrid');
    if(!grid) return;
    grid.innerHTML = SUBSCRIPTIONS.map((s, i) => `
      <div class="glass sub-card reveal reveal-delay-${i % 3}" data-sub="${s.id}">
        ${s.popular ? '<span class="plan-badge badge-popular">Most Popular</span>' : ''}
        <h3>${s.name}</h3>
        <div class="sub-price">₹${s.price}<span style="font-size:.9rem;color:var(--ink-soft);font-weight:500;">${s.period}</span></div>
        ${s.save ? `<div class="sub-save">${s.save}</div>` : '<div class="sub-save" style="visibility:hidden;">—</div>'}
        <button class="btn btn-outline btn-block" style="margin-top:18px;" data-select-sub="${s.id}">Select Plan</button>
      </div>
    `).join('');

    grid.querySelectorAll('[data-select-sub]').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = SUBSCRIPTIONS.find(x => x.id === btn.dataset.selectSub);
        grid.querySelectorAll('.sub-card').forEach(c => c.classList.remove('selected'));
        btn.closest('.sub-card').classList.add('selected');
        RLShine.addToCart({ 
          id: s.id, 
          name: `RL Shine Subscription — ${s.name}`, 
          price: s.price, 
          mrp: s.price, 
          variant: s.period, 
          image: 'images/single.png', 
          qty: 1 
        });
        RLShine.showToast(`${s.name} subscription added 🎉`);
      });
    });
  }

  /* ---------- Tabs ---------- */
  function initTabs(){
    const buttons = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('[data-panel]');

    function activate(tab){
      buttons.forEach(b => {
        const on = b.dataset.tab === tab;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on);
      });
      panels.forEach(p => { p.hidden = p.id !== tab; });
    }

    buttons.forEach(b => b.addEventListener('click', () => {
      activate(b.dataset.tab);
      history.replaceState(null, '', '#' + b.dataset.tab);
    }));

    const hash = window.location.hash.replace('#','');
    if(['consumer','retailer','wholesaler'].includes(hash)){
      activate(hash);
    }
  }

  /* ---------- Registration Forms ---------- */
  function initRegForms(){
    document.querySelectorAll('[data-reg-form]').forEach(form => {
      form.addEventListener('submit', function(e){
        e.preventDefault();
        const type = form.dataset.regForm;
        const note = form.querySelector('.form-note');
        if(!form.checkValidity()){
          form.reportValidity();
          return;
        }
        note.textContent = `Thanks! Your ${type} registration was received. Our team will contact you within 24 hours.`;
        note.style.color = 'var(--teal-dark)';
        RLShine.showToast(`${type} registration submitted ✔`);
        form.reset();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    renderSubscriptions();
    initTabs();
    initRegForms();
    setTimeout(() => {
      const items = document.querySelectorAll('.reveal:not(.in)');
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if(entry.isIntersecting){ entry.target.classList.add('in'); io.unobserve(entry.target); }
        });
      }, { threshold: 0.1 });
      items.forEach(el => io.observe(el));
    }, 50);
  });

})();
