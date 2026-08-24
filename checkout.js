/* ==========================================================================
   RL Shine — Checkout Page Script (Fully Fixed)
   - Fixed quantity controls: minus goes to 0, remove removes completely
   - Auto-redirect to shop.html when cart becomes empty
   - Free shipping note only shows when eligible
   - UPI payment with UPI app integration
   - Complete order lifecycle with payment tracking
   ========================================================================== */

(function(){

  /* ---------- DOM refs (cached) ---------- */
  const cartItemsEl = document.getElementById('cartItems');
  const checkoutContent = document.getElementById('checkoutContent');
  const emptyState = document.getElementById('emptyState');
  const confirmState = document.getElementById('confirmState');
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  const whatsappOrderBtn = document.getElementById('whatsappOrderBtn');
  const upiPanel = document.getElementById('upiPanel');
  const whatsappPanel = document.getElementById('whatsappPanel');

  // UPI payment state
  let upiPaymentPending = false;
  let pendingOrderData = null;
  
  // Flag to prevent multiple redirects
  let isRedirecting = false;

  /* ---------- Check if cart is empty and redirect ---------- */
  function checkAndRedirectIfEmpty() {
    const cart = RLShine.getCart();
    if (cart.length === 0 && !isRedirecting) {
      isRedirecting = true;
      RLShine.showToast('Cart is empty. Redirecting to shop...', 1500);
      setTimeout(() => {
        window.location.href = 'shop.html';
      }, 500);
      return true;
    }
    return false;
  }

  /* ---------- Cart Rendering ---------- */
  function renderCart(){
    const cart = RLShine.getCart();

    // Check if cart is empty and redirect
    if(cart.length === 0){
      // Don't redirect if we're already on the empty state or confirming
      if(!confirmState || confirmState.hidden !== false) {
        // Only redirect if not already on confirmation page
        const isConfirming = confirmState && !confirmState.hidden;
        if(!isConfirming) {
          checkAndRedirectIfEmpty();
          return;
        }
      }
      
      if(checkoutContent) checkoutContent.hidden = true;
      if(emptyState) emptyState.hidden = false;
      if(confirmState) confirmState.hidden = true;
      updateTotals();
      return;
    }

    // Reset redirect flag if cart has items
    isRedirecting = false;

    if(checkoutContent) checkoutContent.hidden = false;
    if(emptyState) emptyState.hidden = true;
    if(confirmState) confirmState.hidden = true;

    if(!cartItemsEl) return;

    cartItemsEl.innerHTML = cart.map((item, index) => `
      <div class="cart-item" data-item-index="${index}" data-item-id="${item.id}" data-item-variant="${item.variant || ''}">
        <img src="${item.image || 'images/product-hero.png'}" data-fallback="images/product-hero.png" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span>${item.variant || ''} · ₹${item.price} each</span>
          <div class="cart-item-qty">
            <button type="button" class="qty-btn" data-action="dec" data-id="${item.id}" data-variant="${item.variant || ''}" aria-label="Decrease quantity">−</button>
            <span class="qty-value" data-qty-id="${item.id}" data-qty-variant="${item.variant || ''}">${item.qty}</span>
            <button type="button" class="qty-btn" data-action="inc" data-id="${item.id}" data-variant="${item.variant || ''}" aria-label="Increase quantity">+</button>
            <button type="button" class="cart-remove" data-action="remove" data-id="${item.id}" data-variant="${item.variant || ''}">Remove</button>
          </div>
        </div>
        <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
      </div>
    `).join('');

    // Re-apply image fallback listeners for newly injected images
    cartItemsEl.querySelectorAll('img[data-fallback]').forEach(img => {
      img.addEventListener('error', function handler(){
        this.removeEventListener('error', handler);
        this.src = this.dataset.fallback;
      }, { once: true });
    });

    updateTotals();
  }

  /* ---------- Cart click handling (event delegation, attached ONCE) ---------- */
  function handleCartClick(e){
    const btn = e.target.closest('[data-action]');
    if(!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const variant = btn.dataset.variant || '';
    
    if(action === 'inc'){
      const cart = RLShine.getCart();
      const item = cart.find(c => c.id === id && c.variant === variant);
      if(item){
        RLShine.updateQty(id, variant, item.qty + 1);
        renderCart();
      }
    } else if(action === 'dec'){
      const cart = RLShine.getCart();
      const item = cart.find(c => c.id === id && c.variant === variant);
      if(item){
        // If quantity is 1, reduce to 0 (remove item) and redirect
        if(item.qty <= 1){
          RLShine.removeFromCart(id, variant);
          // The saveCart function will handle redirect via the event listener
          renderCart();
        } else {
          RLShine.updateQty(id, variant, item.qty - 1);
          renderCart();
        }
      }
    } else if(action === 'remove'){
      RLShine.removeFromCart(id, variant);
      // The saveCart function will handle redirect via the event listener
      renderCart();
    }
  }

  function initCartEvents(){
    if(cartItemsEl){
      cartItemsEl.removeEventListener('click', handleCartClick);
      cartItemsEl.addEventListener('click', handleCartClick);
    }
  }

  /* ---------- Totals ---------- */
  function updateTotals(){
    const subtotal = RLShine.cartSubtotal();
    const { shipping, gst, grandTotal } = RLShine.computeTotals(subtotal);
    const freeShipping = RLShine.isFreeShipping(subtotal);
    
    const sumSubtotal = document.getElementById('sumSubtotal');
    const sumShipping = document.getElementById('sumShipping');
    const sumGst = document.getElementById('sumGst');
    const sumTotal = document.getElementById('sumTotal');
    const freeShipNote = document.getElementById('freeShipNote');

    if(sumSubtotal) sumSubtotal.textContent = RLShine.formatINR(subtotal);
    if(sumShipping) sumShipping.textContent = shipping === 0 ? 'FREE' : RLShine.formatINR(shipping);
    if(sumGst) sumGst.textContent = RLShine.formatINR(gst);
    if(sumTotal) sumTotal.textContent = RLShine.formatINR(grandTotal);
    
    // Only show free shipping note when applicable
    if(freeShipNote){
      if(freeShipping && subtotal > 0){
        freeShipNote.hidden = false;
        freeShipNote.textContent = '✔ Free shipping applied';
      } else {
        freeShipNote.hidden = true;
      }
    }
    
    if(placeOrderBtn) placeOrderBtn.disabled = subtotal <= 0;
  }

  /* ---------- Payment method toggle ---------- */
  function initPaymentToggle(){
    document.querySelectorAll('input[name="payMethod"]').forEach(radio => {
      radio.addEventListener('change', function() {
        if(upiPanel) upiPanel.classList.toggle('show', this.value === 'UPI' && this.checked);
        if(whatsappPanel) whatsappPanel.classList.toggle('show', this.value === 'WhatsApp' && this.checked);

        if(placeOrderBtn){
          if(this.value === 'COD'){
            placeOrderBtn.textContent = 'Place Order (COD)';
          } else if(this.value === 'UPI'){
            placeOrderBtn.textContent = 'Pay with UPI & Order';
          } else if(this.value === 'WhatsApp'){
            placeOrderBtn.textContent = 'Order via WhatsApp';
          }
        }
      });
    });

    // Ensure correct default state on load
    if(upiPanel) upiPanel.classList.remove('show');
    if(whatsappPanel) whatsappPanel.classList.remove('show');
    const defaultRadio = document.querySelector('input[name="payMethod"][value="COD"]');
    if(defaultRadio) defaultRadio.checked = true;
    if(placeOrderBtn) placeOrderBtn.textContent = 'Place Order (COD)';
  }

  /* ---------- Form Validation ---------- */
  function validateDetailsForm() {
    const name = document.getElementById('fName');
    const phone = document.getElementById('fPhone');
    const address = document.getElementById('fAddress');
    const city = document.getElementById('fCity');
    const state = document.getElementById('fState');
    const pincode = document.getElementById('fPincode');

    if(!name || !name.value.trim()) {
      RLShine.showToast('Please enter your full name');
      if(name) name.focus();
      return false;
    }
    if(!phone || !/^[0-9]{10}$/.test(phone.value.trim())) {
      RLShine.showToast('Please enter a valid 10-digit phone number');
      if(phone) phone.focus();
      return false;
    }
    if(!address || !address.value.trim()) {
      RLShine.showToast('Please enter your delivery address');
      if(address) address.focus();
      return false;
    }
    if(!city || !city.value.trim()) {
      RLShine.showToast('Please enter your city');
      if(city) city.focus();
      return false;
    }
    if(!state || !state.value.trim()) {
      RLShine.showToast('Please enter your state');
      if(state) state.focus();
      return false;
    }
    if(!pincode || !/^[0-9]{6}$/.test(pincode.value.trim())) {
      RLShine.showToast('Please enter a valid 6-digit PIN code');
      if(pincode) pincode.focus();
      return false;
    }

    const cart = RLShine.getCart();
    if(cart.length === 0){
      RLShine.showToast('Your cart is empty');
      setTimeout(() => {
        window.location.href = 'shop.html';
      }, 500);
      return false;
    }

    return true;
  }

  /* ---------- Get Order Data ---------- */
  function getOrderData() {
    const name = document.getElementById('fName').value.trim();
    const phone = document.getElementById('fPhone').value.trim();
    const email = document.getElementById('fEmail').value.trim();
    const address = document.getElementById('fAddress').value.trim();
    const city = document.getElementById('fCity').value.trim();
    const state = document.getElementById('fState').value.trim();
    const pincode = document.getElementById('fPincode').value.trim();
    const fullAddress = `${address}, ${city}, ${state} - ${pincode}`;
    const cart = RLShine.getCart();
    const subtotal = RLShine.cartSubtotal();
    const totals = RLShine.computeTotals(subtotal);
    const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || 'COD';
    const orderId = 'RLS' + Date.now().toString().slice(-8);

    return { name, phone, email, address, city, state, pincode, fullAddress, cart, subtotal, totals, payMethod, orderId };
  }

  /* ---------- Build WhatsApp Message ---------- */
  function buildOrderMessage(orderData, paymentStatus = 'Pending'){
    const { name, phone, email, fullAddress, cart, totals, payMethod, orderId } = orderData;

    let message = '🛍️ *NEW ORDER — RL Shine*%0A%0A';
    message += `📋 *Order ID:* ${orderId}%0A`;
    message += `👤 *Customer:* ${name}%0A`;
    message += `📞 *Phone:* ${phone}%0A`;
    if(email) message += `📧 *Email:* ${email}%0A`;
    message += `📍 *Delivery Address:* ${fullAddress}%0A%0A`;

    message += '*📦 Order Details:*%0A';
    cart.forEach(item => {
      const line = `${item.name}${item.variant ? ' (' + item.variant + ')' : ''} × ${item.qty} = ₹${(item.price * item.qty).toLocaleString('en-IN')}`;
      message += `- ${line}%0A`;
    });

    message += `%0A*💰 Totals:*%0A`;
    message += `Subtotal: ₹${totals.subtotal.toLocaleString('en-IN')}%0A`;
    message += `Shipping: ${totals.shipping === 0 ? 'FREE' : '₹' + totals.shipping.toLocaleString('en-IN')}%0A`;
    message += `GST (18%): ₹${totals.gst.toLocaleString('en-IN')}%0A`;
    message += `*Grand Total: ₹${totals.grandTotal.toLocaleString('en-IN')}*%0A%0A`;
    message += `💳 *Payment Method:* ${payMethod}%0A`;
    message += `💵 *Payment Status:* ${paymentStatus}%0A`;
    message += `📅 *Order Time:* ${new Date().toLocaleString('en-IN')}`;

    return message;
  }

  /* ---------- Notify Business Owner via WhatsApp ---------- */
  function notifyBusinessOwner(orderData, paymentStatus = 'Pending'){
    const message = buildOrderMessage(orderData, paymentStatus);
    window.open(`https://wa.me/917982531912?text=${message}`, '_blank');
  }

  /* ---------- Show Order Confirmation ---------- */
  function showOrderConfirmation(orderData) {
    const { name, email, fullAddress, totals, payMethod, orderId } = orderData;

    if(checkoutContent) checkoutContent.hidden = true;
    if(emptyState) emptyState.hidden = true;
    if(confirmState) confirmState.hidden = false;

    const confName = document.getElementById('confName');
    const confOrderId = document.getElementById('confOrderId');
    const confTotal = document.getElementById('confTotal');
    const confMethod = document.getElementById('confMethod');
    const confAddress = document.getElementById('confAddress');
    const confEmailRow = document.getElementById('confEmailRow');
    const confEmail = document.getElementById('confEmail');

    if(confName) confName.textContent = name;
    if(confOrderId) confOrderId.textContent = orderId;
    if(confTotal) confTotal.textContent = RLShine.formatINR(totals.grandTotal);
    if(confMethod) confMethod.textContent = payMethod;
    if(confAddress) confAddress.textContent = fullAddress;

    if(confEmailRow && confEmail){
      if(email && email.trim()){
        confEmailRow.hidden = false;
        confEmail.textContent = email;
      } else {
        confEmailRow.hidden = true;
      }
    }

    RLShine.clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    RLShine.showToast('Order placed successfully! ✅');
  }

  /* ---------- UPI Payment Integration ---------- */
  function initiateUPIPayment(orderData) {
    // Get UPI details
    const upiId = '7982531912-k323@ybl';
    const businessName = 'RL Shine';
    const amount = orderData.totals.grandTotal;
    const orderId = orderData.orderId;
    const customerName = orderData.name;

    // Build UPI deep link (works with GPay, PhonePe, Paytm, etc.)
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Order ' + orderId + ' - ' + customerName)}&mc=`;

    // Store pending order data for callback
    pendingOrderData = orderData;
    upiPaymentPending = true;

    // Try to open UPI app
    try {
      // Method 1: Try to open UPI with intent
      const upiIntent = `intent://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Order ' + orderId)}#Intent;scheme=upi;action=android.intent.action.VIEW;end`;
      
      // Create a hidden link and click it
      const link = document.createElement('a');
      link.href = upiUri;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Also try the intent as fallback
      setTimeout(() => {
        const intentLink = document.createElement('a');
        intentLink.href = upiIntent;
        intentLink.style.display = 'none';
        document.body.appendChild(intentLink);
        intentLink.click();
        document.body.removeChild(intentLink);
      }, 500);

      // Show payment pending message
      RLShine.showToast('Opening UPI app... Complete payment and come back', 5000);

      // Set up a check for payment completion (manual confirmation)
      showUPIPaymentConfirmation(orderData);

    } catch (e) {
      // If UPI app fails, show QR code and manual instructions
      RLShine.showToast('Please use the QR code or UPI ID to pay', 4000);
      showUPIPaymentInstructions(orderData);
    }
  }

  /* ---------- Show UPI Payment Confirmation Dialog ---------- */
  function showUPIPaymentConfirmation(orderData) {
    // Create a modal for payment confirmation
    const modal = document.createElement('div');
    modal.className = 'upi-modal glass';
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      max-width: 440px;
      width: 90%;
      padding: 32px 28px;
      background: rgba(255, 248, 234, 0.98);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.7);
      border-radius: 24px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.3);
      text-align: center;
    `;

    // Add overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 999;
      backdrop-filter: blur(4px);
    `;

    modal.innerHTML = `
      <div style="font-size: 2.8rem; margin-bottom: 12px;">💳</div>
      <h3 style="font-family: var(--font-display); color: var(--teal-dark); margin-bottom: 8px;">Complete UPI Payment</h3>
      <p style="color: var(--ink-soft); font-size: 0.95rem; margin-bottom: 16px;">
        Amount: <strong style="color: var(--teal-dark); font-size: 1.2rem;">${RLShine.formatINR(orderData.totals.grandTotal)}</strong>
      </p>
      <div style="background: rgba(11,79,74,0.06); padding: 16px; border-radius: 12px; margin-bottom: 18px; text-align: left;">
        <p style="font-size: 0.85rem; margin: 0 0 6px;"><strong>UPI ID:</strong> 7982531912-k323@ybl</p>
        <p style="font-size: 0.85rem; margin: 0;"><strong>Order ID:</strong> ${orderData.orderId}</p>
      </div>
      <div style="display: flex; gap: 12px; flex-direction: column;">
        <button class="btn btn-primary btn-block" id="upiPaymentDone" style="font-size: 1rem; padding: 16px;">
          ✅ I've Completed the Payment
        </button>
        <button class="btn btn-outline btn-block" id="upiPaymentCancel" style="font-size: 0.9rem;">
          Cancel
        </button>
        <button class="btn btn-outline btn-block" id="upiPaymentRetry" style="font-size: 0.85rem; border-color: #FFB627;">
          🔄 Open UPI App Again
        </button>
      </div>
      <p style="font-size: 0.75rem; color: var(--ink-soft); margin-top: 14px;">
        After payment, click "I've Completed the Payment" to confirm your order.
      </p>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Handle payment done
    document.getElementById('upiPaymentDone').addEventListener('click', function() {
      if (pendingOrderData) {
        // Payment confirmed - send WhatsApp with PAID status
        notifyBusinessOwner(pendingOrderData, '✅ PAID (UPI)');
        showOrderConfirmation(pendingOrderData);
        closeUPIModal();
        RLShine.showToast('Payment confirmed! Order placed successfully ✅', 4000);
      }
    });

    // Handle cancel
    document.getElementById('upiPaymentCancel').addEventListener('click', closeUPIModal);

    // Handle retry
    document.getElementById('upiPaymentRetry').addEventListener('click', function() {
      closeUPIModal();
      if (pendingOrderData) {
        initiateUPIPayment(pendingOrderData);
      }
    });

    function closeUPIModal() {
      if (modal.parentNode) modal.remove();
      if (overlay.parentNode) overlay.remove();
      upiPaymentPending = false;
    }

    // Close on overlay click
    overlay.addEventListener('click', closeUPIModal);
  }

  /* ---------- Show UPI Payment Instructions (Fallback) ---------- */
  function showUPIPaymentInstructions(orderData) {
    const instructions = document.createElement('div');
    instructions.className = 'upi-instructions glass';
    instructions.style.cssText = `
      margin: 16px 0;
      padding: 20px 24px;
      background: rgba(255, 248, 234, 0.9);
      border-radius: 16px;
      border: 1px solid var(--marigold-light);
    `;

    instructions.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
        <span style="font-size: 1.8rem;">📱</span>
        <div>
          <strong style="font-size: 1.05rem;">Pay via UPI</strong>
          <p style="margin: 0; font-size: 0.9rem;">Scan QR or pay to UPI ID below</p>
        </div>
      </div>
      <div style="background: rgba(11,79,74,0.04); padding: 14px; border-radius: 10px; margin-bottom: 12px;">
        <p style="margin: 0 0 4px; font-size: 0.9rem;"><strong>UPI ID:</strong> 7982531912-k323@ybl</p>
        <p style="margin: 0; font-size: 0.9rem;"><strong>Amount:</strong> ${RLShine.formatINR(orderData.totals.grandTotal)}</p>
        <p style="margin: 8px 0 0; font-size: 0.8rem; color: var(--ink-soft);">Reference: Order ${orderData.orderId}</p>
      </div>
      <button class="btn btn-primary btn-block" id="upiManualConfirm" style="margin-top: 8px;">
        ✅ I've Paid. Confirm Order
      </button>
    `;

    // Insert instructions in the checkout page
    const upiPanel = document.getElementById('upiPanel');
    if (upiPanel) {
      // Remove old instructions if any
      const old = upiPanel.querySelector('.upi-instructions');
      if (old) old.remove();
      upiPanel.appendChild(instructions);
    }

    document.getElementById('upiManualConfirm').addEventListener('click', function() {
      if (pendingOrderData) {
        notifyBusinessOwner(pendingOrderData, '✅ PAID (UPI)');
        showOrderConfirmation(pendingOrderData);
        RLShine.showToast('Payment confirmed! Order placed successfully ✅', 4000);
      }
    });
  }

  /* ---------- Place Order (Main Handler) ---------- */
  function placeOrder() {
    if(!validateDetailsForm()) {
      return;
    }

    const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || 'COD';
    const orderData = getOrderData();

    if (payMethod === 'UPI') {
      // Handle UPI payment flow
      pendingOrderData = orderData;
      initiateUPIPayment(orderData);
      return;
    } else if (payMethod === 'WhatsApp') {
      // Handle WhatsApp order
      notifyBusinessOwner(orderData, '⏳ Pending (WhatsApp)');
      showOrderConfirmation(orderData);
      return;
    } else {
      // COD - notify and confirm
      notifyBusinessOwner(orderData, '⏳ Pending (COD)');
      showOrderConfirmation(orderData);
    }
  }

  /* ---------- WhatsApp Order Button ---------- */
  function initWhatsAppOrder() {
    if(!whatsappOrderBtn) return;

    whatsappOrderBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if(!validateDetailsForm()) {
        return;
      }
      const orderData = getOrderData();
      notifyBusinessOwner(orderData, '⏳ Pending (WhatsApp)');
      showOrderConfirmation(orderData);
    });
  }

  /* ---------- Place Order Button ---------- */
  function initPlaceOrder(){
    if(!placeOrderBtn) return;

    // Remove any existing listeners to prevent duplicates
    const newBtn = placeOrderBtn.cloneNode(true);
    placeOrderBtn.parentNode.replaceChild(newBtn, placeOrderBtn);
    
    newBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || 'COD';
      
      if(payMethod === 'WhatsApp') {
        // Trigger WhatsApp button click
        const wBtn = document.getElementById('whatsappOrderBtn');
        if(wBtn) wBtn.click();
        return;
      }

      placeOrder();
    });

    // Update reference
    document.getElementById('placeOrderBtn');
  }

  /* ---------- Init ---------- */
  function init() {
    // Check if cart is empty on load
    const cart = RLShine.getCart();
    if (cart.length === 0) {
      // Only redirect if not on confirmation page
      if (!confirmState || confirmState.hidden !== false) {
        // Don't redirect immediately, let the page render first
        setTimeout(() => {
          if (RLShine.getCart().length === 0) {
            window.location.href = 'shop.html';
          }
        }, 100);
        return;
      }
    }

    initCartEvents();
    renderCart();
    initPaymentToggle();
    initWhatsAppOrder();
    initPlaceOrder();

    // Listen for cart updates from other tabs
    document.addEventListener('cartUpdated', function(e) {
      renderCart();
    });
  }

  // Run on DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
/* ==========================================================================
   RL Shine — Checkout Page Script (Fully Fixed & Responsive)
   - Fixed quantity controls: minus goes to 0, remove removes completely
   - Auto-redirect to shop.html when cart becomes empty
   - Free shipping note only shows when eligible
   - UPI payment with UPI app integration
   - Complete order lifecycle with payment tracking
   ========================================================================== */

(function(){

  /* ---------- DOM refs (cached) ---------- */
  const cartItemsEl = document.getElementById('cartItems');
  const checkoutContent = document.getElementById('checkoutContent');
  const emptyState = document.getElementById('emptyState');
  const confirmState = document.getElementById('confirmState');
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  const whatsappOrderBtn = document.getElementById('whatsappOrderBtn');
  const upiPanel = document.getElementById('upiPanel');
  const whatsappPanel = document.getElementById('whatsappPanel');

  // UPI payment state
  let upiPaymentPending = false;
  let pendingOrderData = null;
  let isRedirecting = false;

  /* ---------- Check if cart is empty and redirect ---------- */
  function checkAndRedirectIfEmpty() {
    const cart = RLShine.getCart();
    if (cart.length === 0 && !isRedirecting) {
      isRedirecting = true;
      RLShine.showToast('Cart is empty. Redirecting to shop...', 1500);
      setTimeout(() => {
        window.location.href = 'shop.html';
      }, 500);
      return true;
    }
    return false;
  }

  /* ---------- Cart Rendering ---------- */
  function renderCart(){
    const cart = RLShine.getCart();

    if(cart.length === 0){
      if(!confirmState || confirmState.hidden !== false) {
        const isConfirming = confirmState && !confirmState.hidden;
        if(!isConfirming) {
          checkAndRedirectIfEmpty();
          return;
        }
      }
      
      if(checkoutContent) checkoutContent.hidden = true;
      if(emptyState) emptyState.hidden = false;
      if(confirmState) confirmState.hidden = true;
      updateTotals();
      return;
    }

    isRedirecting = false;

    if(checkoutContent) checkoutContent.hidden = false;
    if(emptyState) emptyState.hidden = true;
    if(confirmState) confirmState.hidden = true;

    if(!cartItemsEl) return;

    cartItemsEl.innerHTML = cart.map((item, index) => `
      <div class="cart-item" data-item-index="${index}" data-item-id="${item.id}" data-item-variant="${item.variant || ''}">
        <img src="${item.image || 'images/product-hero.png'}" data-fallback="images/product-hero.png" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span>${item.variant || ''} · ₹${item.price} each</span>
          <div class="cart-item-qty">
            <button type="button" class="qty-btn" data-action="dec" data-id="${item.id}" data-variant="${item.variant || ''}" aria-label="Decrease quantity">−</button>
            <span class="qty-value" data-qty-id="${item.id}" data-qty-variant="${item.variant || ''}">${item.qty}</span>
            <button type="button" class="qty-btn" data-action="inc" data-id="${item.id}" data-variant="${item.variant || ''}" aria-label="Increase quantity">+</button>
            <button type="button" class="cart-remove" data-action="remove" data-id="${item.id}" data-variant="${item.variant || ''}">Remove</button>
          </div>
        </div>
        <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
      </div>
    `).join('');

    cartItemsEl.querySelectorAll('img[data-fallback]').forEach(img => {
      img.addEventListener('error', function handler(){
        this.removeEventListener('error', handler);
        this.src = this.dataset.fallback;
      }, { once: true });
    });

    updateTotals();
  }

  /* ---------- Cart click handling ---------- */
  function handleCartClick(e){
    const btn = e.target.closest('[data-action]');
    if(!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const variant = btn.dataset.variant || '';
    
    if(action === 'inc'){
      const cart = RLShine.getCart();
      const item = cart.find(c => c.id === id && c.variant === variant);
      if(item){
        RLShine.updateQty(id, variant, item.qty + 1);
        renderCart();
      }
    } else if(action === 'dec'){
      const cart = RLShine.getCart();
      const item = cart.find(c => c.id === id && c.variant === variant);
      if(item){
        if(item.qty <= 1){
          RLShine.removeFromCart(id, variant);
          renderCart();
        } else {
          RLShine.updateQty(id, variant, item.qty - 1);
          renderCart();
        }
      }
    } else if(action === 'remove'){
      RLShine.removeFromCart(id, variant);
      renderCart();
    }
  }

  function initCartEvents(){
    if(cartItemsEl){
      cartItemsEl.removeEventListener('click', handleCartClick);
      cartItemsEl.addEventListener('click', handleCartClick);
    }
  }

  /* ---------- Totals ---------- */
  function updateTotals(){
    const subtotal = RLShine.cartSubtotal();
    const { shipping, gst, grandTotal } = RLShine.computeTotals(subtotal);
    const freeShipping = RLShine.isFreeShipping(subtotal);
    
    const sumSubtotal = document.getElementById('sumSubtotal');
    const sumShipping = document.getElementById('sumShipping');
    const sumGst = document.getElementById('sumGst');
    const sumTotal = document.getElementById('sumTotal');
    const freeShipNote = document.getElementById('freeShipNote');

    if(sumSubtotal) sumSubtotal.textContent = RLShine.formatINR(subtotal);
    if(sumShipping) sumShipping.textContent = shipping === 0 ? 'FREE' : RLShine.formatINR(shipping);
    if(sumGst) sumGst.textContent = RLShine.formatINR(gst);
    if(sumTotal) sumTotal.textContent = RLShine.formatINR(grandTotal);
    
    if(freeShipNote){
      if(freeShipping && subtotal > 0){
        freeShipNote.hidden = false;
        freeShipNote.textContent = '✔ Free shipping applied';
      } else {
        freeShipNote.hidden = true;
      }
    }
    
    if(placeOrderBtn) placeOrderBtn.disabled = subtotal <= 0;
  }

  /* ---------- Payment method toggle ---------- */
  function initPaymentToggle(){
    document.querySelectorAll('input[name="payMethod"]').forEach(radio => {
      radio.addEventListener('change', function() {
        if(upiPanel) upiPanel.classList.toggle('show', this.value === 'UPI' && this.checked);
        if(whatsappPanel) whatsappPanel.classList.toggle('show', this.value === 'WhatsApp' && this.checked);

        if(placeOrderBtn){
          if(this.value === 'COD'){
            placeOrderBtn.textContent = 'Place Order (COD)';
          } else if(this.value === 'UPI'){
            placeOrderBtn.textContent = 'Pay with UPI & Order';
          } else if(this.value === 'WhatsApp'){
            placeOrderBtn.textContent = 'Order via WhatsApp';
          }
        }
      });
    });

    if(upiPanel) upiPanel.classList.remove('show');
    if(whatsappPanel) whatsappPanel.classList.remove('show');
    const defaultRadio = document.querySelector('input[name="payMethod"][value="COD"]');
    if(defaultRadio) defaultRadio.checked = true;
    if(placeOrderBtn) placeOrderBtn.textContent = 'Place Order (COD)';
  }

  /* ---------- Form Validation ---------- */
  function validateDetailsForm() {
    const name = document.getElementById('fName');
    const phone = document.getElementById('fPhone');
    const address = document.getElementById('fAddress');
    const city = document.getElementById('fCity');
    const state = document.getElementById('fState');
    const pincode = document.getElementById('fPincode');

    if(!name || !name.value.trim()) {
      RLShine.showToast('Please enter your full name');
      if(name) name.focus();
      return false;
    }
    if(!phone || !/^[0-9]{10}$/.test(phone.value.trim())) {
      RLShine.showToast('Please enter a valid 10-digit phone number');
      if(phone) phone.focus();
      return false;
    }
    if(!address || !address.value.trim()) {
      RLShine.showToast('Please enter your delivery address');
      if(address) address.focus();
      return false;
    }
    if(!city || !city.value.trim()) {
      RLShine.showToast('Please enter your city');
      if(city) city.focus();
      return false;
    }
    if(!state || !state.value.trim()) {
      RLShine.showToast('Please enter your state');
      if(state) state.focus();
      return false;
    }
    if(!pincode || !/^[0-9]{6}$/.test(pincode.value.trim())) {
      RLShine.showToast('Please enter a valid 6-digit PIN code');
      if(pincode) pincode.focus();
      return false;
    }

    const cart = RLShine.getCart();
    if(cart.length === 0){
      RLShine.showToast('Your cart is empty');
      setTimeout(() => {
        window.location.href = 'shop.html';
      }, 500);
      return false;
    }

    return true;
  }

  /* ---------- Get Order Data ---------- */
  function getOrderData() {
    const name = document.getElementById('fName').value.trim();
    const phone = document.getElementById('fPhone').value.trim();
    const email = document.getElementById('fEmail').value.trim();
    const address = document.getElementById('fAddress').value.trim();
    const city = document.getElementById('fCity').value.trim();
    const state = document.getElementById('fState').value.trim();
    const pincode = document.getElementById('fPincode').value.trim();
    const fullAddress = `${address}, ${city}, ${state} - ${pincode}`;
    const cart = RLShine.getCart();
    const subtotal = RLShine.cartSubtotal();
    const totals = RLShine.computeTotals(subtotal);
    const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || 'COD';
    const orderId = 'RLS' + Date.now().toString().slice(-8);

    return { name, phone, email, address, city, state, pincode, fullAddress, cart, subtotal, totals, payMethod, orderId };
  }

  /* ---------- Build WhatsApp Message ---------- */
  function buildOrderMessage(orderData, paymentStatus = 'Pending'){
    const { name, phone, email, fullAddress, cart, totals, payMethod, orderId } = orderData;

    let message = '🛍️ *NEW ORDER — RL Shine*%0A%0A';
    message += `📋 *Order ID:* ${orderId}%0A`;
    message += `👤 *Customer:* ${name}%0A`;
    message += `📞 *Phone:* ${phone}%0A`;
    if(email) message += `📧 *Email:* ${email}%0A`;
    message += `📍 *Delivery Address:* ${fullAddress}%0A%0A`;

    message += '*📦 Order Details:*%0A';
    cart.forEach(item => {
      const line = `${item.name}${item.variant ? ' (' + item.variant + ')' : ''} × ${item.qty} = ₹${(item.price * item.qty).toLocaleString('en-IN')}`;
      message += `- ${line}%0A`;
    });

    message += `%0A*💰 Totals:*%0A`;
    message += `Subtotal: ₹${totals.subtotal.toLocaleString('en-IN')}%0A`;
    message += `Shipping: ${totals.shipping === 0 ? 'FREE' : '₹' + totals.shipping.toLocaleString('en-IN')}%0A`;
    message += `GST (18%): ₹${totals.gst.toLocaleString('en-IN')}%0A`;
    message += `*Grand Total: ₹${totals.grandTotal.toLocaleString('en-IN')}*%0A%0A`;
    message += `💳 *Payment Method:* ${payMethod}%0A`;
    message += `💵 *Payment Status:* ${paymentStatus}%0A`;
    message += `📅 *Order Time:* ${new Date().toLocaleString('en-IN')}`;

    return message;
  }

  /* ---------- Notify Business Owner via WhatsApp ---------- */
  function notifyBusinessOwner(orderData, paymentStatus = 'Pending'){
    const message = buildOrderMessage(orderData, paymentStatus);
    window.open(`https://wa.me/917982531912?text=${message}`, '_blank');
  }

  /* ---------- Show Order Confirmation ---------- */
  function showOrderConfirmation(orderData) {
    const { name, email, fullAddress, totals, payMethod, orderId } = orderData;

    if(checkoutContent) checkoutContent.hidden = true;
    if(emptyState) emptyState.hidden = true;
    if(confirmState) confirmState.hidden = false;

    const confName = document.getElementById('confName');
    const confOrderId = document.getElementById('confOrderId');
    const confTotal = document.getElementById('confTotal');
    const confMethod = document.getElementById('confMethod');
    const confAddress = document.getElementById('confAddress');
    const confEmailRow = document.getElementById('confEmailRow');
    const confEmail = document.getElementById('confEmail');

    if(confName) confName.textContent = name;
    if(confOrderId) confOrderId.textContent = orderId;
    if(confTotal) confTotal.textContent = RLShine.formatINR(totals.grandTotal);
    if(confMethod) confMethod.textContent = payMethod;
    if(confAddress) confAddress.textContent = fullAddress;

    if(confEmailRow && confEmail){
      if(email && email.trim()){
        confEmailRow.hidden = false;
        confEmail.textContent = email;
      } else {
        confEmailRow.hidden = true;
      }
    }

    RLShine.clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    RLShine.showToast('Order placed successfully! ✅');
  }

  /* ---------- UPI Payment Integration ---------- */
  function initiateUPIPayment(orderData) {
    const upiId = '7982531912-k323@ybl';
    const businessName = 'RL Shine';
    const amount = orderData.totals.grandTotal;
    const orderId = orderData.orderId;
    const customerName = orderData.name;

    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Order ' + orderId + ' - ' + customerName)}&mc=`;

    pendingOrderData = orderData;
    upiPaymentPending = true;

    try {
      const upiIntent = `intent://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Order ' + orderId)}#Intent;scheme=upi;action=android.intent.action.VIEW;end`;
      
      const link = document.createElement('a');
      link.href = upiUri;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        const intentLink = document.createElement('a');
        intentLink.href = upiIntent;
        intentLink.style.display = 'none';
        document.body.appendChild(intentLink);
        intentLink.click();
        document.body.removeChild(intentLink);
      }, 500);

      RLShine.showToast('Opening UPI app... Complete payment and come back', 5000);
      showUPIPaymentConfirmation(orderData);

    } catch (e) {
      RLShine.showToast('Please use the QR code or UPI ID to pay', 4000);
      showUPIPaymentInstructions(orderData);
    }
  }

  /* ---------- Show UPI Payment Confirmation Dialog ---------- */
  function showUPIPaymentConfirmation(orderData) {
    const modal = document.createElement('div');
    modal.className = 'upi-modal glass';
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      max-width: 440px;
      width: 90%;
      padding: 32px 28px;
      background: rgba(255, 248, 234, 0.98);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.7);
      border-radius: 24px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.3);
      text-align: center;
      max-height: 90vh;
      overflow-y: auto;
    `;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 999;
      backdrop-filter: blur(4px);
    `;

    modal.innerHTML = `
      <div style="font-size: 2.8rem; margin-bottom: 12px;">💳</div>
      <h3 style="font-family: var(--font-display); color: var(--teal-dark); margin-bottom: 8px;">Complete UPI Payment</h3>
      <p style="color: var(--ink-soft); font-size: clamp(0.85rem, 1.2vw, 0.95rem); margin-bottom: 16px;">
        Amount: <strong style="color: var(--teal-dark); font-size: clamp(1.1rem, 1.5vw, 1.2rem);">${RLShine.formatINR(orderData.totals.grandTotal)}</strong>
      </p>
      <div style="background: rgba(11,79,74,0.06); padding: 16px; border-radius: 12px; margin-bottom: 18px; text-align: left;">
        <p style="font-size: clamp(0.8rem, 1vw, 0.85rem); margin: 0 0 6px;"><strong>UPI ID:</strong> 7982531912-k323@ybl</p>
        <p style="font-size: clamp(0.8rem, 1vw, 0.85rem); margin: 0;"><strong>Order ID:</strong> ${orderData.orderId}</p>
      </div>
      <div style="display: flex; gap: 12px; flex-direction: column;">
        <button class="btn btn-primary btn-block" id="upiPaymentDone" style="font-size: clamp(0.9rem, 1.1vw, 1rem); padding: 14px 20px;">
          ✅ I've Completed the Payment
        </button>
        <button class="btn btn-outline btn-block" id="upiPaymentCancel" style="font-size: clamp(0.8rem, 1vw, 0.9rem);">
          Cancel
        </button>
        <button class="btn btn-outline btn-block" id="upiPaymentRetry" style="font-size: clamp(0.8rem, 1vw, 0.85rem); border-color: #FFB627;">
          🔄 Open UPI App Again
        </button>
      </div>
      <p style="font-size: clamp(0.65rem, 0.8vw, 0.75rem); color: var(--ink-soft); margin-top: 14px;">
        After payment, click "I've Completed the Payment" to confirm your order.
      </p>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    document.getElementById('upiPaymentDone').addEventListener('click', function() {
      if (pendingOrderData) {
        notifyBusinessOwner(pendingOrderData, '✅ PAID (UPI)');
        showOrderConfirmation(pendingOrderData);
        closeUPIModal();
        RLShine.showToast('Payment confirmed! Order placed successfully ✅', 4000);
      }
    });

    document.getElementById('upiPaymentCancel').addEventListener('click', closeUPIModal);

    document.getElementById('upiPaymentRetry').addEventListener('click', function() {
      closeUPIModal();
      if (pendingOrderData) {
        initiateUPIPayment(pendingOrderData);
      }
    });

    function closeUPIModal() {
      if (modal.parentNode) modal.remove();
      if (overlay.parentNode) overlay.remove();
      upiPaymentPending = false;
    }

    overlay.addEventListener('click', closeUPIModal);
  }

  /* ---------- Show UPI Payment Instructions (Fallback) ---------- */
  function showUPIPaymentInstructions(orderData) {
    const instructions = document.createElement('div');
    instructions.className = 'upi-instructions glass';
    instructions.style.cssText = `
      margin: 16px 0;
      padding: clamp(16px, 2vw, 20px) clamp(16px, 2vw, 24px);
      background: rgba(255, 248, 234, 0.9);
      border-radius: 16px;
      border: 1px solid var(--marigold-light);
    `;

    instructions.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
        <span style="font-size: 1.8rem;">📱</span>
        <div>
          <strong style="font-size: clamp(0.95rem, 1.2vw, 1.05rem);">Pay via UPI</strong>
          <p style="margin: 0; font-size: clamp(0.8rem, 1vw, 0.9rem);">Scan QR or pay to UPI ID below</p>
        </div>
      </div>
      <div style="background: rgba(11,79,74,0.04); padding: 14px; border-radius: 10px; margin-bottom: 12px;">
        <p style="margin: 0 0 4px; font-size: clamp(0.8rem, 1vw, 0.9rem);"><strong>UPI ID:</strong> 7982531912-k323@ybl</p>
        <p style="margin: 0; font-size: clamp(0.8rem, 1vw, 0.9rem);"><strong>Amount:</strong> ${RLShine.formatINR(orderData.totals.grandTotal)}</p>
        <p style="margin: 8px 0 0; font-size: clamp(0.7rem, 0.8vw, 0.8rem); color: var(--ink-soft);">Reference: Order ${orderData.orderId}</p>
      </div>
      <button class="btn btn-primary btn-block" id="upiManualConfirm" style="margin-top: 8px;">
        ✅ I've Paid. Confirm Order
      </button>
    `;

    const upiPanel = document.getElementById('upiPanel');
    if (upiPanel) {
      const old = upiPanel.querySelector('.upi-instructions');
      if (old) old.remove();
      upiPanel.appendChild(instructions);
    }

    document.getElementById('upiManualConfirm').addEventListener('click', function() {
      if (pendingOrderData) {
        notifyBusinessOwner(pendingOrderData, '✅ PAID (UPI)');
        showOrderConfirmation(pendingOrderData);
        RLShine.showToast('Payment confirmed! Order placed successfully ✅', 4000);
      }
    });
  }

  /* ---------- Place Order (Main Handler) ---------- */
  function placeOrder() {
    if(!validateDetailsForm()) {
      return;
    }

    const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || 'COD';
    const orderData = getOrderData();

    if (payMethod === 'UPI') {
      pendingOrderData = orderData;
      initiateUPIPayment(orderData);
      return;
    } else if (payMethod === 'WhatsApp') {
      notifyBusinessOwner(orderData, '⏳ Pending (WhatsApp)');
      showOrderConfirmation(orderData);
      return;
    } else {
      notifyBusinessOwner(orderData, '⏳ Pending (COD)');
      showOrderConfirmation(orderData);
    }
  }

  /* ---------- WhatsApp Order Button ---------- */
  function initWhatsAppOrder() {
    if(!whatsappOrderBtn) return;

    whatsappOrderBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if(!validateDetailsForm()) {
        return;
      }
      const orderData = getOrderData();
      notifyBusinessOwner(orderData, '⏳ Pending (WhatsApp)');
      showOrderConfirmation(orderData);
    });
  }

  /* ---------- Place Order Button ---------- */
  function initPlaceOrder(){
    if(!placeOrderBtn) return;

    const newBtn = placeOrderBtn.cloneNode(true);
    placeOrderBtn.parentNode.replaceChild(newBtn, placeOrderBtn);
    
    newBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || 'COD';
      
      if(payMethod === 'WhatsApp') {
        const wBtn = document.getElementById('whatsappOrderBtn');
        if(wBtn) wBtn.click();
        return;
      }

      placeOrder();
    });

    document.getElementById('placeOrderBtn');
  }

  /* ---------- Init ---------- */
  function init() {
    const cart = RLShine.getCart();
    if (cart.length === 0) {
      if (!confirmState || confirmState.hidden !== false) {
        setTimeout(() => {
          if (RLShine.getCart().length === 0) {
            window.location.href = 'shop.html';
          }
        }, 100);
        return;
      }
    }

    initCartEvents();
    renderCart();
    initPaymentToggle();
    initWhatsAppOrder();
    initPlaceOrder();

    document.addEventListener('cartUpdated', function(e) {
      renderCart();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
})();
