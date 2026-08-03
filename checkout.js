/* ==========================================================================
   RL Shine — Checkout Page Script
   ========================================================================== */

(function(){

  function renderCart(){
    const cart = RLShine.getCart();
    const cartItemsEl = document.getElementById('cartItems');
    const checkoutContent = document.getElementById('checkoutContent');
    const emptyState = document.getElementById('emptyState');

    if(cart.length === 0){
      checkoutContent.hidden = true;
      emptyState.hidden = false;
      return;
    }
    checkoutContent.hidden = false;
    emptyState.hidden = true;

    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" data-fallback="images/product-hero.png" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span>${item.variant || ''} · ₹${item.price} each</span>
          <div class="cart-item-qty">
            <button type="button" data-dec="${item.id}" aria-label="Decrease">−</button>
            <span>${item.qty}</span>
            <button type="button" data-inc="${item.id}" aria-label="Increase">+</button>
            <button class="cart-remove" data-remove="${item.id}">Remove</button>
          </div>
        </div>
        <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
      </div>
    `).join('');

    // re-apply fallback listeners for newly injected images
    cartItemsEl.querySelectorAll('img[data-fallback]').forEach(img => {
      img.addEventListener('error', function handler(){
        this.removeEventListener('error', handler);
        this.src = this.dataset.fallback;
      }, { once:true });
    });

    cartItemsEl.querySelectorAll('[data-inc]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = cart.find(c => c.id === btn.dataset.inc);
        RLShine.updateQty(item.id, item.qty + 1);
        renderCart(); updateTotals();
      });
    });
    cartItemsEl.querySelectorAll('[data-dec]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = cart.find(c => c.id === btn.dataset.dec);
        RLShine.updateQty(item.id, item.qty - 1);
        renderCart(); updateTotals();
      });
    });
    cartItemsEl.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        RLShine.removeFromCart(btn.dataset.remove);
        renderCart(); updateTotals();
      });
    });
  }

  function updateTotals(){
    const subtotal = RLShine.cartSubtotal();
    const { shipping, gst, grandTotal } = RLShine.computeTotals(subtotal);
    document.getElementById('sumSubtotal').textContent = RLShine.formatINR(subtotal);
    document.getElementById('sumShipping').textContent = shipping === 0 ? 'FREE' : RLShine.formatINR(shipping);
    document.getElementById('sumGst').textContent = RLShine.formatINR(gst);
    document.getElementById('sumTotal').textContent = RLShine.formatINR(grandTotal);
    document.getElementById('freeShipNote').hidden = shipping !== 0;
    const btn = document.getElementById('placeOrderBtn');
    if(btn) btn.disabled = subtotal <= 0;
  }

  function initPaymentToggle(){
    const upiPanel = document.getElementById('upiPanel');
    document.querySelectorAll('input[name="payMethod"]').forEach(radio => {
      radio.addEventListener('change', () => {
        upiPanel.classList.toggle('show', radio.value === 'UPI' && radio.checked);
      });
    });
    upiPanel.classList.add('show'); // UPI is default checked
  }

  function initPlaceOrder(){
    const btn = document.getElementById('placeOrderBtn');
    if(!btn) return;
    btn.addEventListener('click', () => {
      const form = document.getElementById('detailsForm');
      if(!form.checkValidity()){
        form.reportValidity();
        return;
      }
      const cart = RLShine.getCart();
      if(cart.length === 0) return;

      const subtotal = RLShine.cartSubtotal();
      const totals = RLShine.computeTotals(subtotal);
      const payMethod = document.querySelector('input[name="payMethod"]:checked').value;
      const name = document.getElementById('fName').value;
      const email = document.getElementById('fEmail').value;
      const address = document.getElementById('fAddress').value;
      const orderId = 'RLS' + Date.now().toString().slice(-8);

      document.getElementById('checkoutContent').hidden = true;
      document.getElementById('confirmState').hidden = false;
      document.getElementById('confName').textContent = name;
      document.getElementById('confOrderId').textContent = orderId;
      document.getElementById('confTotal').textContent = RLShine.formatINR(totals.grandTotal);
      document.getElementById('confMethod').textContent = payMethod;
      document.getElementById('confAddress').textContent = address;
      document.getElementById('confEmail').textContent = email;

      RLShine.clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    updateTotals();
    initPaymentToggle();
    initPlaceOrder();
  });

})();