/* Product detail rendering */

function renderProductDetail(p) {
	return `
	<div class="grid md:grid-cols-2 gap-10 items-start">
		<img src="${p.image}" alt="${p.name}" class="w-full h-[420px] object-cover rounded border border-gray-200"/>
		<div class="space-y-4">
			<h1 class="text-3xl font-semibold">${p.name}</h1>
			<div class="text-xl">${CC.formatPrice(p.price)}</div>
			<p class="text-gray-600">${p.description}</p>
			<div class="text-sm text-gray-500">Dimensions: ${p.dimensions || "—"}</div>
			<div class="flex gap-3">
				<button id="addToCartBtn" class="btn btn--black">Add to Cart</button>
				<a class="btn btn--ghost" href="/catalog.html">Back to catalog</a>
			</div>
		</div>
	</div>`;
}

async function initProductPage() {
	const content = document.getElementById("productContent");
	const skeleton = document.getElementById("productSkeleton");
	const error = document.getElementById("productError");
	if (!content) return;

	const id = CC.getQueryParam("id");
	if (!id) { skeleton?.classList.add("hidden"); error?.classList.remove("hidden"); return; }

	try {
		const products = await CC.fetchProducts();
		const product = products.find(p => String(p.id) === String(id));
		if (!product) throw new Error("Not found");
		content.innerHTML = renderProductDetail(product);
		content.classList.remove("hidden");
		skeleton?.classList.add("hidden");
		document.getElementById("addToCartBtn").addEventListener("click", () => CC.addToCart(product, 1));
		document.title = `${product.name} — Craft & Comfort`;
	} catch (e) {
		skeleton?.classList.add("hidden");
		error?.classList.remove("hidden");
	}
}

window.addEventListener("DOMContentLoaded", initProductPage);