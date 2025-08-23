/* Checkout form handling with Netlify and WhatsApp relay */

function buildOrderMessage({ name, email, phone, address, items, total }) {
	const lines = [];
	lines.push(`Order — Craft & Comfort`);
	lines.push(`Customer: ${name}`);
	lines.push(`Email: ${email}`);
	lines.push(`Phone: ${phone}`);
	lines.push(`Address: ${address}`);
	lines.push("");
	lines.push(`Items:`);
	for (const it of items) {
		lines.push(`- ${it.name} x${it.quantity} — ${CC.formatPrice(it.price * it.quantity)}`);
	}
	lines.push("");
	lines.push(`Total: ${CC.formatPrice(total)}`);
	lines.push("");
	lines.push(`Please find my proof of payment attached.`);
	return lines.join("\n");
}

async function handleCheckoutSubmit(e) {
	e.preventDefault();
	const form = e.currentTarget;
	const submitBtn = form.querySelector("[type=submit]");
	const success = document.getElementById("checkoutSuccess");
	const error = document.getElementById("checkoutError");
	if (submitBtn) submitBtn.disabled = true;
	success?.classList.add("hidden");
	error?.classList.add("hidden");

	const items = CC.getCart();
	const total = CC.getCartSubtotal();
	const name = form.name.value;
	const email = form.email.value;
	const phone = form.phone.value;
	const address = form.address.value;

	// Fill hidden fields for Netlify
	document.getElementById("orderItemsField").value = JSON.stringify(items);
	document.getElementById("orderTotalField").value = String(total);

	try {
		// Submit to Netlify
		const formData = new FormData(form);
		await fetch("/", { method: "POST", body: formData });

		// Build WhatsApp link (internationalize number as needed). Provided number: 0678046211
		const phoneIntl = "27678046211"; // South Africa (+27) assumed
		const text = buildOrderMessage({ name, email, phone, address, items, total });
		const url = `https://wa.me/${phoneIntl}?text=${encodeURIComponent(text)}`;
		const fallback = document.getElementById("waLinkFallback");
		if (fallback) fallback.href = url;
		window.open(url, "_blank");

		success?.classList.remove("hidden");
		// Optionally clear cart
		CC.setCart([]);
	} catch (err) {
		error?.classList.remove("hidden");
	} finally {
		if (submitBtn) submitBtn.disabled = false;
	}
}

function initCheckout() {
	const form = document.getElementById("checkoutForm");
	if (form) form.addEventListener("submit", handleCheckoutSubmit);
}

window.Pages = window.Pages || {};
window.Pages.checkout = initCheckout;