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
    // Trigger cart update event for any listeners
    document.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
    
    // Check if cart is empty and we're on checkout page
    if(cart.length === 0 && window.location.pathname.includes('checkout.html')){
      setTimeout(() => {
        window.location.href = 'shop.html';
      }, 300);
    }
  }

  function addToCart(item){
    const cart = getCart();
    const existing = cart.find(c => c.id === item.id && c.variant === item.variant);
    if(existing){
      existing.qty += item.qty || 1;
    } else {
      cart.push({ ...item, qty: item.qty || 1 });
    }
    saveCart(cart);
    return cart;
  }

  function updateQty(id, variant, qty){
    let cart = getCart();
    if(qty <= 0){
      cart = cart.filter(c => !(c.id === id && c.variant === variant));
    } else {
      const item = cart.find(c => c.id === id && c.variant === variant);
      if(item) item.qty = qty;
    }
    saveCart(cart);
    return cart;
  }

  function removeFromCart(id, variant){
    const cart = getCart().filter(c => !(c.id === id && c.variant === variant));
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

  function isFreeShipping(subtotal){
    return subtotal >= FREE_SHIPPING_THRESHOLD && subtotal > 0;
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

  /* ---------- WhatsApp Floating Button ---------- */
  function initWhatsAppButton(){
    const btn = document.createElement('div');
    btn.className = 'whatsapp-float';
    btn.innerHTML = `<a href="https://wa.me/917982531912?text=Hi%20RL%20Shine%2C%20I%20want%20to%20place%20an%20order" target="_blank" aria-label="Chat on WhatsApp">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>`;
    document.body.appendChild(btn);
  }

  /* ---------- Init ---------- */
  function init(){
    initNavbar();
    initScrollReveal();
    initImageFallbacks();
    initWhatsAppButton();
    updateCartBadges();
    const yearEls = document.querySelectorAll('[data-year]');
    yearEls.forEach(el => el.textContent = new Date().getFullYear());
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    getCart, saveCart, addToCart, updateQty, removeFromCart, clearCart,
    cartCount, cartSubtotal, computeTotals, isFreeShipping, formatINR, showToast,
    SHIPPING_FLAT, FREE_SHIPPING_THRESHOLD, GST_RATE
  };
})();
