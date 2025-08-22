/* Catalog rendering and filtering */

/** Render a single product card */
function renderCard(p) {
	return `
	<a href="/product.html?id=${encodeURIComponent(p.id)}" class="card group">
		<img src="${p.image}" alt="${p.name}" class="card__img group-hover:scale-[1.02] transition-transform"/>
		<div class="card__body">
			<h3 class="card__title">${p.name}</h3>
			<div class="flex items-center justify-between">
				<span class="card__price">${CC.formatPrice(p.price)}</span>
				<button data-id="${p.id}" class="btn btn--black add-to-cart">Add to Cart</button>
			</div>
		</div>
	</a>`;
}

/** Render skeletons */
function renderSkeletons(container, count) {
	container.innerHTML = Array.from({ length: count }).map(() => `
		<div class="card">
			<div class="skeleton h-56 w-full"></div>
			<div class="p-4 space-y-2">
				<div class="skeleton h-5 w-2/3"></div>
				<div class="skeleton h-4 w-1/3"></div>
			</div>
		</div>
	`).join("");
}

async function initCatalogPage() {
	const grid = document.getElementById("catalogGrid");
	const error = document.getElementById("catalogError");
	const searchInput = document.getElementById("searchInput");
	const categoryFilter = document.getElementById("categoryFilter");
	const priceFilter = document.getElementById("priceFilter");
	const priceFilterValue = document.getElementById("priceFilterValue");
	const clearBtn = document.getElementById("clearFilters");
	if (!grid) return;

	renderSkeletons(grid, 6);

	let products = [];
	try {
		products = await CC.fetchProducts();
		error?.classList.add("hidden");
	} catch (e) {
		grid.innerHTML = "";
		error?.classList.remove("hidden");
		return;
	}

	// Populate category filter
	const categories = Array.from(new Set(products.map(p => p.category))).sort();
	categoryFilter.innerHTML = `<option value="">All</option>` + categories.map(c => `<option value="${c}">${c}</option>`).join("");

	function applyFilters() {
		const term = (searchInput.value || "").toLowerCase();
		const cat = categoryFilter.value || "";
		const maxPrice = Number(priceFilter.value || 3000);
		const filtered = products.filter(p => {
			const matchTerm = p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term);
			const matchCat = !cat || p.category === cat;
			const matchPrice = p.price <= maxPrice;
			return matchTerm && matchCat && matchPrice;
		});
		grid.innerHTML = filtered.map(renderCard).join("");
		attachCardHandlers();
	}

	function attachCardHandlers() {
		grid.querySelectorAll(".add-to-cart").forEach(btn => {
			btn.addEventListener("click", (e) => {
				e.preventDefault();
				const id = btn.getAttribute("data-id");
				const product = products.find(p => String(p.id) === String(id));
				if (product) CC.addToCart(product, 1);
			});
		});
	}

	[searchInput, categoryFilter, priceFilter].forEach(el => el.addEventListener("input", () => {
		priceFilterValue.textContent = String(priceFilter.value);
		applyFilters();
	}));
	clearBtn.addEventListener("click", () => {
		searchInput.value = "";
		categoryFilter.value = "";
		priceFilter.value = "3000";
		priceFilterValue.textContent = "3000";
		applyFilters();
	});

	applyFilters();
}

window.addEventListener("DOMContentLoaded", initCatalogPage);