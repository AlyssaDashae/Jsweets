// ── COOKIE CURSOR ──
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});
document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });

const interactives = 'button, a, [role="button"], input, select, label';
document.querySelectorAll(interactives).forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
});

// ── SPRINKLE SYSTEM ──
(function () {
  const canvas = document.getElementById('sprinkleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const sprinkleColors = ['#F472A8','#7DD4B0','#F5C842','#A8E6CE','#FFD6E8','#4EBB90'];
  let pieces = [];
  let W, H;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = rect.width;
    H = canvas.height = rect.height;
  }

  function makePiece(fromTop) {
    const type = Math.random() < 0.72 ? 'sprinkle' : 'dot';
    return {
      type,
      x: Math.random() * W,
      y: fromTop ? -10 - Math.random() * 40 : Math.random() * H,
      w: type === 'sprinkle' ? 7 + Math.random() * 5 : 3 + Math.random() * 3,
      h: type === 'sprinkle' ? 2.5 + Math.random() * 1.5 : 0,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.022,
      vy: 0.35 + Math.random() * 0.55,
      vx: (Math.random() - 0.5) * 0.3,
      alpha: 0.55 + Math.random() * 0.35,
      color: sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)],
    };
  }

  function init() {
    resize();
    pieces = [];
    for (let i = 0; i < 110; i++) pieces.push(makePiece(false));
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const p of pieces) {
      p.y += p.vy;
      p.x += p.vx;
      p.angle += p.spin;
      if (p.y > H + 12) {
        Object.assign(p, makePiece(true));
        p.x = Math.random() * W;
      }
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      if (p.type === 'sprinkle') {
        const r = p.h / 2;
        ctx.beginPath();
        ctx.roundRect(-p.w / 2, -r, p.w, p.h, r);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    requestAnimationFrame(tick);
  }

  init();
  window.addEventListener('resize', init);
  requestAnimationFrame(tick);
})();

// ── CONFETTI BG ──
const bg = document.getElementById('confettiBg');
const colors = ['#7DD4B0','#F472A8','#F5C842','#A8E6CE','#FFD6E8'];
for(let i = 0; i < 12; i++) {
const dot = document.createElement('div');
dot.classList.add('confetti-dot');
const size = Math.random() * 20 + 8;
dot.style.cssText = `
width:${size}px; height:${size}px;
background:${colors[Math.floor(Math.random()*colors.length)]};
left:${Math.random()*100}%;
animation-duration:${Math.random()*15+10}s;
animation-delay:-${Math.random()*15}s;
`;
bg.appendChild(dot);
}

// ── J's Sweets Cart ──
// EmailJS config — fill these in after creating your EmailJS account
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_CUSTOMER = 'YOUR_CUSTOMER_TEMPLATE_ID';
const EMAILJS_TEMPLATE_BUSINESS = 'YOUR_BUSINESS_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
const BUSINESS_EMAIL      = 'joannbeckford@gmail.com';

// ── Cart State ──
let cart = JSON.parse(localStorage.getItem('jsweetsCart') || '[]');

function saveCart() {
  localStorage.setItem('jsweetsCart', JSON.stringify(cart));
}

function getTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getItemCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

// ── Add to Cart ──
function addToCart(name, variant, price, emoji) {
  const key = name + '||' + variant;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ key, name, variant, price, emoji, qty: 1 });
  }
  saveCart();
  updateCartUI();
  openCart();
}

// ── Update Quantity ──
function updateQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.key !== key);
  saveCart();
  updateCartUI();
}

// ── Remove Item ──
function removeItem(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart();
  updateCartUI();
}

// ── Update UI ──
function updateCartUI() {
  const count = getItemCount();

  // Badge
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });

  renderCartItems();
  renderOrderPreview();
}

function renderCartItems() {
  const body = document.getElementById('cartItemsBody');
  const empty = document.getElementById('cartEmpty');
  const footer = document.getElementById('cartFooter');
  if (!body) return;

  if (cart.length === 0) {
    body.innerHTML = '';
    if (empty) empty.style.display = 'block';
    if (footer) footer.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (footer) footer.style.display = 'block';

  body.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-variant">${item.variant}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="updateQty('${item.key.replace(/'/g,"\\'")}', -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="updateQty('${item.key.replace(/'/g,"\\'")}', 1)">+</button>
      </div>
      <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
      <button class="cart-item-remove" onclick="removeItem('${item.key.replace(/'/g,"\\'")}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
      </button>
    </div>
  `).join('');

  // Totals
  const subtotal = getTotal();
  const el = document.getElementById('cartSubtotal');
  const grandEl = document.getElementById('cartGrand');
  if (el) el.textContent = '$' + subtotal.toFixed(2);
  if (grandEl) grandEl.textContent = '$' + subtotal.toFixed(2);
}

function renderOrderPreview() {
  const preview = document.getElementById('orderPreviewItems');
  const previewTotal = document.getElementById('orderPreviewTotal');
  if (!preview) return;

  preview.innerHTML = cart.map(item => `
    <div class="order-preview-item">
      <span>${item.qty}x ${item.name} (${item.variant})</span>
      <span>$${(item.price * item.qty).toFixed(2)}</span>
    </div>
  `).join('');

  if (previewTotal) previewTotal.textContent = '$' + getTotal().toFixed(2);
}

// ── Open / Close Cart ──
function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
  showCartStep();
}

// ── Step Navigation ──
function showCartStep() {
  document.getElementById('cartItemsSection').classList.remove('hidden');
  document.getElementById('checkoutSection').classList.remove('active');
  document.getElementById('orderSuccessSection').classList.remove('show');
  document.getElementById('tabCart').classList.add('active');
  document.getElementById('tabCheckout').classList.remove('active');
}

function showCheckoutStep() {
  if (cart.length === 0) return;
  document.getElementById('cartItemsSection').classList.add('hidden');
  document.getElementById('checkoutSection').classList.add('active');
  document.getElementById('tabCart').classList.remove('active');
  document.getElementById('tabCheckout').classList.add('active');
  renderOrderPreview();
}

// ── Place Order ──
async function placeOrder() {
  const name     = document.getElementById('coName').value.trim();
  const phone    = document.getElementById('coPhone').value.trim();
  const email    = document.getElementById('coEmail').value.trim();
  const delivery = document.getElementById('coDelivery').value;
  const address  = document.getElementById('coAddress').value.trim();
  const notes    = document.getElementById('coNotes').value.trim();

  if (!name || !phone || !email || !delivery) {
    alert('Please fill in all required fields.');
    return;
  }

  if (delivery === 'Delivery' && !address) {
    alert('Please enter your delivery address.');
    return;
  }

  const btn = document.getElementById('placeOrderBtn');
  btn.disabled = true;
  btn.textContent = 'Sending...';

  const orderLines = cart.map(i => `${i.qty}x ${i.name} (${i.variant}) — $${(i.price * i.qty).toFixed(2)}`).join('\n');
  const total = '$' + getTotal().toFixed(2);

  const templateParams = {
    customer_name:  name,
    customer_phone: phone,
    customer_email: email,
    delivery_type:  delivery,
    address:        address || 'N/A',
    notes:          notes || 'None',
    order_items:    orderLines,
    order_total:    total,
    business_email: BUSINESS_EMAIL,
    to_email:       email,
  };

  try {
    await emailjs.init(EMAILJS_PUBLIC_KEY);

    // Send to customer
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_CUSTOMER, templateParams);
    // Send to business
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_BUSINESS, { ...templateParams, to_email: BUSINESS_EMAIL });

    // Clear cart
    cart = [];
    saveCart();
    updateCartUI();

    // Show success
    document.getElementById('checkoutSection').classList.remove('active');
    document.getElementById('orderSuccessSection').classList.add('show');

  } catch (err) {
    console.error('EmailJS error:', err);
    alert('There was a problem sending your order. Please try again or contact us directly.');
    btn.disabled = false;
    btn.textContent = 'Place Order';
  }
}

// ── Wire up Add to Cart buttons on page load ──
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  // Wire all "Add to Cart" buttons
  document.querySelectorAll('.card').forEach(card => {
    const btn = card.querySelector('.btn');
    if (!btn || btn.textContent.trim() !== 'Add to Cart') return;

    btn.addEventListener('click', () => {
      const info = card.querySelector('.card-info');
      const name = info.querySelector('h3').textContent.trim();
      const select = info.querySelector('.variation-select');
      const variant = select ? select.options[select.selectedIndex].text : '';
      const priceText = info.querySelector('.price').textContent.replace('$', '');
      const price = parseFloat(priceText);
      const emoji = card.querySelector('.card-img') ? card.querySelector('.card-img').textContent.trim().charAt(0) : '🍰';

      addToCart(name, variant, price, emoji);
    });
  });
});


// cartAdd — called by each Add to Cart button directly
function cartAdd(btn) {
  const info = btn.closest('.card-info');
  const card = btn.closest('.card');
  const name = info.querySelector('h3').textContent.trim();
  const select = info.querySelector('.variation-select');
  const variant = select ? select.options[select.selectedIndex].text : 'Standard';
  const priceText = info.querySelector('.price').textContent.replace('$','');
  const price = parseFloat(priceText);
  
  // Try to get image from img tag, fallback to emoji
  const img = card.querySelector('.card-img img');
  const emoji = img ? img.src : '🍰';
  
  addToCart(name, variant, price, emoji);
}

function updatePrice(sel) {
  sel.closest('.card-info').querySelector('.price').textContent = sel.value;
}

function toggleAddress() {
  const val = document.getElementById('coDelivery').value;
  document.getElementById('addressField').style.display = val === 'Delivery' ? 'block' : 'none';
}