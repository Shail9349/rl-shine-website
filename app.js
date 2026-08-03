/* ==========================================================================
   RL Shine — Shared App Script
   Cart utilities (localStorage), navbar, scroll reveal, toast
   ========================================================================== */

const RLShine = (() => {
  const CART_KEY = 'rlshine_cart';

  /* ---------- Cart ---------- */
  function getCart(){
    try{
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }

  function saveCart(cart){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadges();
  }

  function addToCart(item){
    // item: { id, name, price, mrp, qty, variant, image }
    const cart = getCart();
    const existing = cart.find(c => c.id === item.id);
    if(existing){
      existing.qty += item.qty || 1;
    } else {
      cart.push({ ...item, qty: item.qty || 1 });
    }
    saveCart(cart);
    return cart;
  }

  function updateQty(id, qty){
    let cart = getCart();
    if(qty <= 0){
      cart = cart.filter(c => c.id !== id);
    } else {
      const item = cart.find(c => c.id === id);
      if(item) item.qty = qty;
    }
    saveCart(cart);
    return cart;
  }

  function removeFromCart(id){
    const cart = getCart().filter(c => c.id !== id);
    saveCart(cart);
    return cart;
  }

  function clearCart(){
    saveCart([]);
  }

  function cartCount(){
    return getCart().reduce((sum, c) => sum + c.qty, 0);
  }

  function cartSubtotal(){
    return getCart().reduce((sum, c) => sum + (c.price * c.qty), 0);
  }

  function updateCartBadges(){
    const count = cartCount();
    document.querySelectorAll('[data-cart-badge]').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  /* ---------- Pricing helpers ---------- */
  const SHIPPING_FLAT = 50;
  const FREE_SHIPPING_THRESHOLD = 999;
  const GST_RATE = 0.18;

  function computeTotals(subtotal){
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT;
    const gst = Math.round((subtotal + shipping) * GST_RATE);
    const grandTotal = subtotal + shipping + gst;
    return { subtotal, shipping, gst, grandTotal };
  }

  function formatINR(n){
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  /* ---------- Navbar ---------- */
  function initNavbar(){
    const toggle = document.querySelector('.menu-toggle');
    const links = document.querySelector('.nav-links');
    if(toggle && links){
      toggle.addEventListener('click', () => {
        links.classList.toggle('open');
        toggle.classList.toggle('open');
      });
      links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => links.classList.remove('open'));
      });
    }
  }

  /* ---------- Scroll Reveal ---------- */
  function initScrollReveal(){
    const items = document.querySelectorAll('.reveal');
    if(!items.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(el => io.observe(el));
  }

  /* ---------- Toast ---------- */
  function showToast(message, duration = 2400){
    let toast = document.querySelector('.toast');
    if(!toast){
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  /* ---------- Image fallback ---------- */
  function initImageFallbacks(){
    document.querySelectorAll('img[data-fallback]').forEach(img => {
      img.addEventListener('error', function handler(){
        this.removeEventListener('error', handler);
        this.src = this.dataset.fallback;
      }, { once: true });
    });
  }

  /* ---------- Init ---------- */
  function init(){
    initNavbar();
    initScrollReveal();
    initImageFallbacks();
    updateCartBadges();
    const yearEls = document.querySelectorAll('[data-year]');
    yearEls.forEach(el => el.textContent = new Date().getFullYear());
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    getCart, saveCart, addToCart, updateQty, removeFromCart, clearCart,
    cartCount, cartSubtotal, computeTotals, formatINR, showToast,
    SHIPPING_FLAT, FREE_SHIPPING_THRESHOLD, GST_RATE
  };
})();