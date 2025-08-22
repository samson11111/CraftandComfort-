/* Global app logic: navigation, cart store, transitions, helpers */

/** Utility: safely parse JSON */
function safeJsonParse(value, fallback) {
	try { return JSON.parse(value); } catch { return fallback; }
}

/** localStorage cart API */
const STORAGE_KEYS = { CART: "cc_cart" };

/** Get cart from localStorage */
function getCart() {
	const data = safeJsonParse(localStorage.getItem(STORAGE_KEYS.CART), []);
	return Array.isArray(data) ? data : [];
}

/** Save cart to localStorage */
function setCart(items) {
	localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
	updateCartCount();
}

/** Add item to cart */
function addToCart(product, quantity) {
	const qty = Math.max(1, Number(quantity || 1));
	const cart = getCart();
	const index = cart.findIndex((i) => i.id === product.id);
	if (index >= 0) {
		cart[index].quantity += qty;
	} else {
		cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: qty });
	}
	setCart(cart);
}

/** Remove item from cart */
function removeFromCart(id) {
	const cart = getCart().filter((i) => i.id !== id);
	setCart(cart);
}

/** Update item quantity */
function updateCartQuantity(id, quantity) {
	const qty = Math.max(1, Number(quantity || 1));
	const cart = getCart();
	const index = cart.findIndex((i) => i.id === id);
	if (index >= 0) {
		cart[index].quantity = qty;
		setCart(cart);
	}
}

/** Calculate totals */
function getCartSubtotal() {
	return getCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
}

/** Update sticky cart count badge */
function updateCartCount() {
	const count = getCart().reduce((sum, i) => sum + i.quantity, 0);
	const el = document.getElementById("cartCount");
	if (el) el.textContent = String(count);
}

/** Fetch products.json */
async function fetchProducts() {
	const res = await fetch("/assets/data/products.json", { cache: "no-store" });
	if (!res.ok) throw new Error("Failed to load products");
	return res.json();
}

/** Format price */
function formatPrice(value) { return `$${value.toFixed(2)}`; }

/** Query helper */
function getQueryParam(name) {
	const params = new URLSearchParams(window.location.search);
	return params.get(name);
}

/** Mobile menu toggle and common init */
function initCommonUI() {
	const btn = document.getElementById("mobileMenuBtn");
	const menu = document.getElementById("mobileMenu");
	if (btn && menu) {
		btn.addEventListener("click", () => menu.classList.toggle("hidden"));
	}
	const year = document.getElementById("year");
	if (year) year.textContent = String(new Date().getFullYear());
	// Fade-in after load
	requestAnimationFrame(() => document.body.classList.add("is-ready"));
	updateCartCount();
}

/** Simple auto carousel dots hookup */
function initCarousel() {
	const track = document.querySelector(".carousel__track");
	const dots = document.querySelector(".carousel__dots");
	if (!track || !dots) return;
	const slides = Array.from(track.children);
	dots.innerHTML = slides.map((_, i) => `<button aria-current="${i===0}"></button>`).join("");
}

/** Homepage: featured products preview */
async function initFeaturedGrid() {
	const grid = document.getElementById("featuredGrid");
	if (!grid) return;
	// Simple skeletons
	grid.innerHTML = Array.from({ length: 4 }).map(() => `
		<div class="card">
			<div class="skeleton h-56 w-full"></div>
			<div class="p-4 space-y-2">
				<div class="skeleton h-5 w-2/3"></div>
				<div class="skeleton h-4 w-1/3"></div>
			</div>
		</div>
	`).join("");
	try {
		const products = await fetchProducts();
		const featured = products.slice(0, 4);
		grid.innerHTML = featured.map(p => `
			<a href="/product.html?id=${encodeURIComponent(p.id)}" class="card group">
				<img src="${p.image}" alt="${p.name}" class="card__img group-hover:scale-[1.02] transition-transform"/>
				<div class="card__body">
					<h3 class="card__title">${p.name}</h3>
					<div class="flex items-center justify-between">
						<span class="card__price">${formatPrice(p.price)}</span>
						<button data-id="${p.id}" class="btn btn--black add-to-cart">Add to Cart</button>
					</div>
				</div>
			</a>
		`).join("");
		grid.querySelectorAll(".add-to-cart").forEach(btn => {
			btn.addEventListener("click", (e) => {
				e.preventDefault();
				const id = btn.getAttribute("data-id");
				const product = featured.find(p => String(p.id) === String(id));
				if (product) addToCart(product, 1);
			});
		});
	} catch (e) {
		grid.innerHTML = `<div class="p-4 border border-red-200 text-red-700 bg-red-50 rounded">Failed to load featured products.</div>`;
	}
}

// Expose minimal API globally for page scripts
window.CC = {
	getCart, setCart, addToCart, removeFromCart, updateCartQuantity,
	getCartSubtotal, fetchProducts, formatPrice, getQueryParam, updateCartCount
};

window.addEventListener("DOMContentLoaded", () => {
	initCommonUI();
	initCarousel();
	initFeaturedGrid();
});