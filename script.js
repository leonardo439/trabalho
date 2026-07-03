
const products = [
  { id: 1, name: "Violão Jacarandá 74'", price: 890.00, category: "Cordas",     image: "🎸", stock: 4  },
  { id: 2, name: "Guitarra Sunburst",     price: 1450.00, category: "Cordas",     image: "🎸", stock: 2  },
  { id: 3, name: "Baixo Vintage 4c",      price: 1120.00, category: "Cordas",     image: "🎸", stock: 0  },
  { id: 4, name: "Bateria Completa",      price: 2300.00, category: "Percussão",  image: "🥁", stock: 1  },
  { id: 5, name: "Par de Baquetas",       price: 35.00,   category: "Percussão",  image: "🥢", stock: 20 },
  { id: 6, name: "Piano Elétrico 61t",    price: 1780.00, category: "Teclas",     image: "🎹", stock: 3  },
  { id: 7, name: "Vinil Bossa Nova",      price: 79.90,   category: "Discos",     image: "💿", stock: 12 },
  { id: 8, name: "Vinil Jazz Clássico",   price: 89.90,   category: "Discos",     image: "💿", stock: 0  },
  { id: 9, name: "Toca-discos Retrô",     price: 640.00,  category: "Áudio",      image: "📻", stock: 5  },
  { id: 10, name: "Fone Vintage Couro",   price: 220.00,  category: "Áudio",      image: "🎧", stock: 8  },
  { id: 11, name: "Amplificador Valvulado", price: 990.00, category: "Áudio",    image: "🔊", stock: 2  },
  { id: 12, name: "Saxofone Bronze",      price: 2150.00, category: "Sopro",      image: "🎷", stock: 1  },
];
 
let cart = [];
let activeFilter = "Todos";
 
const DISCOUNT_TIERS = [
  { min: 600, rate: 0.15, label: "Desconto (15% acima de R$ 600)" },
  { min: 300, rate: 0.10, label: "Desconto (10% acima de R$ 300)" },
];
 
function getDiscount(subtotal) {
  const tier = DISCOUNT_TIERS.find(t => subtotal >= t.min);
  if (!tier) return { rate: 0, label: "", value: 0 };
  return { rate: tier.rate, label: tier.label, value: subtotal * tier.rate };
}
 
function getNextTierHint(subtotal) {
  const upcoming = [...DISCOUNT_TIERS].reverse().find(t => subtotal < t.min);
  if (!upcoming) return "";
  const missing = upcoming.min - subtotal;
  return `Faltam ${formatBRL(missing)} para ${Math.round(upcoming.rate * 100)}% de desconto`;
}
 
function formatBRL(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
 
function findProduct(id) {
  return products.find(p => p.id === id);
}
 
function findCartItem(id) {
  return cart.find(item => item.id === id);
}
 
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
 
function addToCart(id) {
  const product = findProduct(id);
  if (!product) return;
 
  if (product.stock <= 0) {
    showToast(`"${product.name}" está esgotado.`);
    return;
  }
 
  const existing = findCartItem(id);
  const currentQty = existing ? existing.quantity : 0;
 
  if (currentQty + 1 > product.stock) {
    showToast(`Estoque insuficiente para "${product.name}". Disponível: ${product.stock}.`);
    return;
  }
 
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }
  showToast(`"${product.name}" adicionado ao carrinho.`);
  render();
}
 
function changeQuantity(id, delta) {
  const product = findProduct(id);
  const item = findCartItem(id);
  if (!item) return;
 
  const newQty = item.quantity + delta;
 
  if (newQty <= 0) {
    removeFromCart(id);
    return;
  }
 
  if (newQty > product.stock) {
    showToast(`Quantidade máxima em estoque atingida (${product.stock}).`);
    return;
  }
 
  item.quantity = newQty;
  render();
}
 
function removeFromCart(id) {
  const product = findProduct(id);
  cart = cart.filter(item => item.id !== id);
  if (product) showToast(`"${product.name}" removido do carrinho.`);
  render();
}
 
function clearCart() {
  if (cart.length === 0) return;
  cart = [];
  showToast("Carrinho esvaziado.");
  render();
}
 
function renderFilters() {
  const container = document.getElementById("filters");
  const categories = ["Todos", ...new Set(products.map(p => p.category))];
 
  container.innerHTML = categories.map(cat => `
    <button class="filter-btn ${cat === activeFilter ? "active" : ""}" data-cat="${cat}">
      ${cat}
    </button>
  `).join("");
 
  container.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.cat;
      render();
    });
  });
}
 
function renderProducts() {
  const grid = document.getElementById("product-grid");
  const list = activeFilter === "Todos"
    ? products
    : products.filter(p => p.category === activeFilter);
 
  grid.innerHTML = list.map(p => {
    const inCart = findCartItem(p.id);
    const qtyInCart = inCart ? inCart.quantity : 0;
    const isOut = p.stock <= 0;
    const atLimit = qtyInCart >= p.stock && p.stock > 0;
 
    let stockClass = "";
    let stockLabel = `${p.stock} em estoque`;
    if (isOut) { stockClass = "zero"; stockLabel = "Esgotado"; }
    else if (p.stock <= 2) { stockClass = "low"; stockLabel = `Só ${p.stock} em estoque`; }
 
    return `
      <article class="product-card ${isOut ? "out-of-stock" : ""}">
        ${isOut ? '<span class="sold-out-tag">Esgotado</span>' : ""}
        <span class="stub-emoji">${p.image}</span>
        <span class="stub-category">${p.category}</span>
        <h3 class="stub-name">${p.name}</h3>
        <span class="stub-stock ${stockClass}">${stockLabel}</span>
        <div class="stub-footer">
          <span class="stub-price">${formatBRL(p.price)}</span>
          <button class="add-btn" data-id="${p.id}" ${isOut || atLimit ? "disabled" : ""}>
            ${isOut ? "Esgotado" : atLimit ? "Limite" : "Adicionar"}
          </button>
        </div>
      </article>
    `;
  }).join("");
 
  grid.querySelectorAll(".add-btn:not(:disabled)").forEach(btn => {
    btn.addEventListener("click", () => addToCart(Number(btn.dataset.id)));
  });
}
 
function renderCart() {
  const container = document.getElementById("cart-items");
  const emptyMsg = document.getElementById("empty-msg");
  const clearBtn = document.getElementById("clear-cart");
  const checkoutBtn = document.getElementById("checkout-btn");
 
  if (cart.length === 0) {
    container.innerHTML = "";
    container.appendChild(emptyMsg);
    emptyMsg.hidden = false;
    clearBtn.disabled = true;
    checkoutBtn.disabled = true;
  } else {
    emptyMsg.hidden = true;
    clearBtn.disabled = false;
    checkoutBtn.disabled = false;
 
    container.innerHTML = cart.map(item => {
      const product = findProduct(item.id);
      const lineTotal = product.price * item.quantity;
      const atMax = item.quantity >= product.stock;
 
      return `
        <div class="cart-item">
          <span class="cart-item-emoji">${product.image}</span>
          <div>
            <p class="cart-item-name">${product.name}</p>
            <span class="cart-item-unit">${formatBRL(product.price)} / un.</span>
            <div class="cart-item-line">
              <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Diminuir quantidade">−</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn" data-action="inc" data-id="${item.id}" ${atMax ? "disabled" : ""} aria-label="Aumentar quantidade">+</button>
            </div>
            <span class="item-subtotal">Subtotal: ${formatBRL(lineTotal)}</span>
          </div>
          <button class="item-remove" data-action="remove" data-id="${item.id}" aria-label="Remover item">✕</button>
        </div>
      `;
    }).join("");
 
    container.querySelectorAll("[data-action]").forEach(btn => {
      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;
      btn.addEventListener("click", () => {
        if (action === "inc") changeQuantity(id, 1);
        if (action === "dec") changeQuantity(id, -1);
        if (action === "remove") removeFromCart(id);
      });
    });
  }
 
  renderTotals();
}
 
function renderTotals() {
  const subtotal = cart.reduce((sum, item) => {
    const product = findProduct(item.id);
    return sum + product.price * item.quantity;
  }, 0);
 
  const discount = getDiscount(subtotal);
  const total = subtotal - discount.value;
 
  document.getElementById("subtotal-value").textContent = formatBRL(subtotal);
 
  const discountRow = document.getElementById("discount-row");
  if (discount.value > 0) {
    discountRow.hidden = false;
    document.getElementById("discount-label").textContent = discount.label;
    document.getElementById("discount-value").textContent = `− ${formatBRL(discount.value)}`;
  } else {
    discountRow.hidden = true;
  }
 
  document.getElementById("total-value").textContent = formatBRL(total);
 
  const hint = document.getElementById("discount-hint");
  hint.textContent = subtotal > 0 ? getNextTierHint(subtotal) : "";
 
  const badge = document.getElementById("cart-badge");
  badge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}
 
function render() {
  renderFilters();
  renderProducts();
  renderCart();
}
 
document.getElementById("clear-cart").addEventListener("click", clearCart);
 
document.getElementById("checkout-btn").addEventListener("click", () => {
  showToast("Compra finalizada com sucesso! Obrigado pela visita. 🎶");
  cart = [];
  render();
});
 
document.getElementById("cart-toggle").addEventListener("click", () => {
  document.getElementById("cart-panel").scrollIntoView({ behavior: "smooth", block: "start" });
});
 
render();
 