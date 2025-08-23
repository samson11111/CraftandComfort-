/* Cart page logic */

function renderCartItem(item) {
	return `
	<div class="py-4 flex gap-4 items-center">
		<img src="${item.image}" alt="${item.name}" class="w-24 h-24 object-cover rounded border border-gray-200"/>
		<div class="flex-1">
			<div class="font-medium">${item.name}</div>
			<div class="text-sm text-gray-600">${CC.formatPrice(item.price)}</div>
		</div>
		<div class="flex items-center gap-2">
			<label class="sr-only">Qty</label>
			<input type="number" min="1" value="${item.quantity}" data-id="${item.id}" class="qty input w-20">
			<button class="remove btn btn--ghost" data-id="${item.id}">Remove</button>
		</div>
	</div>`;
}

function renderCart() {
	const items = CC.getCart();
	const list = document.getElementById("cartItems");
	const empty = document.getElementById("emptyCart");
	const subtotal = document.getElementById("cartSubtotal");
	if (!list) return;

	if (items.length === 0) {
		list.innerHTML = "";
		empty?.classList.remove("hidden");
		if (subtotal) subtotal.textContent = CC.formatPrice(0);
		return;
	}

	list.innerHTML = items.map(renderCartItem).join("");
	empty?.classList.add("hidden");
	if (subtotal) subtotal.textContent = CC.formatPrice(CC.getCartSubtotal());

	list.querySelectorAll(".qty").forEach(input => {
		input.addEventListener("change", () => {
			const id = input.getAttribute("data-id");
			const qty = Number(input.value || 1);
			CC.updateCartQuantity(id, qty);
			renderCart();
		});
	});
	list.querySelectorAll(".remove").forEach(btn => {
		btn.addEventListener("click", () => {
			const id = btn.getAttribute("data-id");
			CC.removeFromCart(id);
			renderCart();
		});
	});
}

function initCartPage() {
	renderCart();
}

window.Pages = window.Pages || {};
window.Pages.cart = initCartPage;