const CATEGORIES = [
  { id: "all", name: "All", icon: "🛒" },
  { id: "chicken", name: "Chicken", icon: "🍗" },
  { id: "mutton", name: "Mutton", icon: "🥩" },
  { id: "fish", name: "Fish", icon: "🐟" },
  { id: "eggs", name: "Eggs", icon: "🥚" },
  { id: "marinated", name: "Marinated", icon: "🌶️" },
];

const TINT = {
  chicken: "#fff4e5",
  mutton: "#fdecee",
  fish: "#e8f4fd",
  eggs: "#fdf8e6",
  marinated: "#fff0e8",
};

// price = price for the first weight option; other weights scale proportionally
const PRODUCTS = [
  { id: 1, cat: "chicken", name: "Chicken Curry Cut", desc: "Bone-in, skinless pieces ideal for curries.", icon: "🍗", price: 129, mrp: 159, pieces: "10–14 pcs", serves: "2–3", weights: [500, 1000], popular: 10, tag: "Bestseller" },
  { id: 2, cat: "chicken", name: "Boneless Breast", desc: "Lean, tender breast fillets. High protein.", icon: "🍗", price: 179, mrp: 219, pieces: "3–5 pcs", serves: "2", weights: [450, 900], popular: 8 },
  { id: 3, cat: "chicken", name: "Chicken Drumsticks", desc: "Juicy leg pieces, perfect for frying or grilling.", icon: "🍗", price: 159, mrp: 189, pieces: "4–6 pcs", serves: "2–3", weights: [450, 900], popular: 7 },
  { id: 4, cat: "chicken", name: "Chicken Mince (Keema)", desc: "Freshly minced, great for kebabs and keema.", icon: "🍗", price: 149, pieces: "—", serves: "2–3", weights: [450, 900], popular: 4 },
  { id: 5, cat: "mutton", name: "Mutton Curry Cut", desc: "Tender goat meat with bone, from young lambs.", icon: "🥩", price: 449, mrp: 499, pieces: "12–16 pcs", serves: "3–4", weights: [500, 1000], popular: 9, tag: "Bestseller" },
  { id: 6, cat: "mutton", name: "Boneless Mutton", desc: "Premium boneless chunks for biryani & fry.", icon: "🥩", price: 549, mrp: 599, pieces: "16–20 pcs", serves: "3–4", weights: [500, 1000], popular: 6 },
  { id: 7, cat: "mutton", name: "Mutton Keema", desc: "Finely minced goat meat, freshly ground.", icon: "🥩", price: 499, pieces: "—", serves: "3–4", weights: [500, 1000], popular: 5 },
  { id: 8, cat: "mutton", name: "Mutton Chops", desc: "Rib chops with fat for rich, flavourful dishes.", icon: "🥩", price: 529, pieces: "6–8 pcs", serves: "2–3", weights: [500, 1000], popular: 3, tag: "New" },
  { id: 9, cat: "fish", name: "Seer Fish (Vanjaram)", desc: "Steak cuts, cleaned and ready to cook.", icon: "🐟", price: 699, mrp: 799, pieces: "5–7 pcs", serves: "3", weights: [500, 1000], popular: 6 },
  { id: 10, cat: "fish", name: "Prawns Medium", desc: "Deveined and cleaned, tail-on.", icon: "🦐", price: 389, pieces: "20–25 pcs", serves: "2–3", weights: [250, 500], popular: 5 },
  { id: 11, cat: "eggs", name: "Farm Eggs", desc: "Fresh white eggs, pack of 12.", icon: "🥚", price: 89, pieces: "12 pcs", serves: "—", weights: ["12 pcs", "30 pcs"], scale: [1, 2.4], popular: 7 },
  { id: 12, cat: "eggs", name: "Country Eggs (Nattu Kozhi)", desc: "Free-range country eggs, pack of 6.", icon: "🥚", price: 79, pieces: "6 pcs", serves: "—", weights: ["6 pcs", "12 pcs"], scale: [1, 1.9], popular: 4 },
  { id: 13, cat: "marinated", name: "Tandoori Chicken", desc: "Marinated in yogurt & house spices. Just grill.", icon: "🌶️", price: 249, mrp: 289, pieces: "4 pcs", serves: "2", weights: [450], popular: 6, tag: "Hot" },
  { id: 14, cat: "marinated", name: "Pepper Mutton Fry Mix", desc: "Boneless mutton in Chettinad pepper masala.", icon: "🌶️", price: 579, pieces: "—", serves: "2–3", weights: [500], popular: 3 },
];

const FREE_DELIVERY_AT = 499;
const DELIVERY_FEE = 39;

const state = { cat: "all", query: "", sort: "popular", selected: {}, cart: loadCart() };

const $ = (sel) => document.querySelector(sel);
const rupee = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

function loadCart() {
  try { return JSON.parse(localStorage.getItem("freshcut-cart")) || {}; } catch { return {}; }
}
function saveCart() {
  try { localStorage.setItem("freshcut-cart", JSON.stringify(state.cart)); } catch {}
}

function weightLabel(w) {
  if (typeof w === "string") return w;
  return w >= 1000 ? `${w / 1000} kg` : `${w} g`;
}
function priceFor(p, idx, base = p.price) {
  const factor = p.scale ? p.scale[idx] : p.weights[idx] / p.weights[0];
  return base * factor;
}
const cartKey = (id, idx) => `${id}:${idx}`;

/* ---------- Render ---------- */
function renderCategories() {
  $("#categories").innerHTML = CATEGORIES.map((c) => `
    <button class="cat" role="tab" data-cat="${c.id}" aria-selected="${state.cat === c.id}">
      <span class="cat-icon">${c.icon}</span>${c.name}
    </button>`).join("");
}

function renderProducts() {
  const q = state.query.trim().toLowerCase();
  let list = PRODUCTS.filter((p) =>
    (state.cat === "all" || p.cat === state.cat) &&
    (!q || p.name.toLowerCase().includes(q) || p.cat.includes(q)));

  if (state.sort === "low") list.sort((a, b) => a.price - b.price);
  else if (state.sort === "high") list.sort((a, b) => b.price - a.price);
  else list.sort((a, b) => b.popular - a.popular);

  const cat = CATEGORIES.find((c) => c.id === state.cat);
  $("#listTitle").textContent = state.cat === "all" ? "All products" : cat.name;
  $("#empty").hidden = list.length > 0;

  $("#grid").innerHTML = list.map((p) => {
    const idx = state.selected[p.id] ?? 0;
    const qty = state.cart[cartKey(p.id, idx)] || 0;
    const tagCls = p.tag === "Hot" ? "tag hot" : "tag";
    return `
      <article class="card" data-id="${p.id}">
        <div class="card-media" style="background:${TINT[p.cat]}">
          ${p.tag ? `<span class="${tagCls}">${p.tag}</span>` : ""}
          <span aria-hidden="true">${p.icon}</span>
        </div>
        <div class="card-body">
          <div class="card-title">${p.name}</div>
          <p class="card-desc">${p.desc}</p>
          <div class="meta">${p.pieces !== "—" ? `<span>${p.pieces}</span>` : ""}${p.serves !== "—" ? `<span>Serves ${p.serves}</span>` : ""}</div>
          ${p.weights.length > 1 ? `<div class="weights">${p.weights.map((w, i) => `
            <button class="weight" data-weight="${i}" aria-pressed="${i === idx}">${weightLabel(w)}</button>`).join("")}
          </div>` : `<div class="weights"><span class="weight" aria-pressed="true">${weightLabel(p.weights[0])}</span></div>`}
          <div class="card-foot">
            <div class="price">
              <strong>${rupee(priceFor(p, idx))}</strong>
              ${p.mrp ? `<s>${rupee(priceFor(p, idx, p.mrp))}</s>` : ""}
            </div>
            ${qty ? `
              <div class="stepper">
                <button data-action="dec" aria-label="Decrease">−</button>
                <span>${qty}</span>
                <button data-action="inc" aria-label="Increase">+</button>
              </div>` : `<button class="add-btn" data-action="inc">ADD</button>`}
          </div>
        </div>
      </article>`;
  }).join("");
}

function cartLines() {
  return Object.entries(state.cart).map(([key, qty]) => {
    const [id, idx] = key.split(":").map(Number);
    const p = PRODUCTS.find((x) => x.id === id);
    return p && { key, p, idx, qty, total: priceFor(p, idx) * qty };
  }).filter(Boolean);
}

function renderCart() {
  const lines = cartLines();
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_AT ? 0 : DELIVERY_FEE;

  const badge = $("#cartCount");
  if (badge.textContent !== String(count)) {
    badge.textContent = count;
    badge.classList.remove("bump");
    void badge.offsetWidth;
    badge.classList.add("bump");
  }

  $("#cartBar").hidden = count === 0;
  $("#cartBarText").textContent = `${count} item${count === 1 ? "" : "s"} · ${rupee(subtotal + delivery)}`;

  $("#cartItems").innerHTML = lines.length ? lines.map((l) => `
    <div class="cart-item" data-key="${l.key}">
      <div class="cart-thumb" style="background:${TINT[l.p.cat]}">${l.p.icon}</div>
      <div class="cart-info">
        <strong>${l.p.name}</strong>
        <small>${weightLabel(l.p.weights[l.idx])}</small>
        <span class="line-price">${rupee(l.total)}</span>
      </div>
      <div class="stepper">
        <button data-action="dec" aria-label="Decrease">−</button>
        <span>${l.qty}</span>
        <button data-action="inc" aria-label="Increase">+</button>
      </div>
    </div>`).join("") : `
    <div class="cart-empty"><div>🛒</div>Your cart is empty.<br />Add some fresh cuts!</div>`;

  $("#cartFoot").hidden = lines.length === 0;
  $("#subtotal").textContent = rupee(subtotal);
  $("#delivery").textContent = delivery ? rupee(delivery) : "FREE";
  $("#total").textContent = rupee(subtotal + delivery);
  $("#freeHint").textContent = subtotal && subtotal < FREE_DELIVERY_AT
    ? `Add ${rupee(FREE_DELIVERY_AT - subtotal)} more for free delivery`
    : subtotal ? "🎉 You've unlocked free delivery" : "";
}

/* ---------- Cart actions ---------- */
function changeQty(key, delta) {
  const next = (state.cart[key] || 0) + delta;
  if (next <= 0) delete state.cart[key];
  else state.cart[key] = next;
  saveCart();
  renderProducts();
  renderCart();
}

let toastTimer;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}

function openCart(open) {
  $("#drawer").classList.toggle("open", open);
  $("#drawer").setAttribute("aria-hidden", String(!open));
  $("#overlay").hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
}

/* ---------- Events ---------- */
$("#categories").addEventListener("click", (e) => {
  const btn = e.target.closest(".cat");
  if (!btn) return;
  state.cat = btn.dataset.cat;
  renderCategories();
  renderProducts();
});

$("#grid").addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  const id = Number(card.dataset.id);
  const weightBtn = e.target.closest("button.weight");
  if (weightBtn) {
    state.selected[id] = Number(weightBtn.dataset.weight);
    renderProducts();
    return;
  }
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  const key = cartKey(id, state.selected[id] ?? 0);
  if (action === "inc" && !state.cart[key]) toast(`${PRODUCTS.find((p) => p.id === id).name} added to cart`);
  changeQty(key, action === "inc" ? 1 : -1);
});

$("#cartItems").addEventListener("click", (e) => {
  const action = e.target.closest("[data-action]")?.dataset.action;
  const item = e.target.closest(".cart-item");
  if (action && item) changeQty(item.dataset.key, action === "inc" ? 1 : -1);
});

$("#search").addEventListener("input", (e) => { state.query = e.target.value; renderProducts(); });
$("#sort").addEventListener("change", (e) => { state.sort = e.target.value; renderProducts(); });
$("#openCart").addEventListener("click", () => openCart(true));
$("#cartBar").addEventListener("click", () => openCart(true));
$("#closeCart").addEventListener("click", () => openCart(false));
$("#overlay").addEventListener("click", () => openCart(false));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") openCart(false); });

$("#checkout").addEventListener("click", () => {
  state.cart = {};
  saveCart();
  renderProducts();
  renderCart();
  openCart(false);
  toast("✅ Order placed! Arriving in ~45 mins");
});

renderCategories();
renderProducts();
renderCart();
