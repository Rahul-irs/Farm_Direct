const API_URL = process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;
async function request(path, options) {
    const token = localStorage.getItem('farmdirect_token');
    const isFormData = options?.body instanceof FormData;
    const response = await fetch(`${API_URL}${path}`, {
        headers: { ...(isFormData ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options?.headers || {}) },
        ...options,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok)
        throw new Error(payload.message || 'Something went wrong');
    return payload;
}
export function login(email, password) {
    return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}
export function register(data) {
    return request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
export function verifyEmail(email, code) {
    return request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ email, code }) });
}
export function resendVerification(email) {
    return request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) });
}
export function refreshAccessToken(refresh_token) {
    return request('/auth/refresh', { method: 'POST', headers: { Authorization: `Bearer ${refresh_token}` } });
}
export function getProducts() {
    return request('/products/');
}
export function getMyProducts(search = '') {
    const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    return request(`/products/mine${query}`);
}
export function getFarmerInventoryOverview() {
    return request('/products/overview');
}
export function getAdminOverview() {
    return request('/admin/overview');
}
export function getPrediction(crop = '', location = '') {
    const params = new URLSearchParams();
    if (crop.trim()) params.set('crop', crop.trim());
    if (location.trim()) params.set('location', location.trim());
    const query = params.toString();
    return request(`/ai/price-prediction${query ? `?${query}` : ''}`);
}
export function getPredictions() {
    return request('/ai/price-predictions');
}
export function getFarmerInsights() {
    return request('/ai/farmer-insights');
}
export function addToCart(product_id, quantity = 1) {
    return request('/orders/cart/items', { method: 'POST', body: JSON.stringify({ product_id, quantity }) });
}
export function getCart() {
    return request('/orders/cart');
}
export function removeCartItem(itemId) {
    return request(`/orders/cart/items/${itemId}`, { method: 'DELETE' });
}
export function checkout() {
    return request('/orders/', { method: 'POST' });
}
export function getOrders() {
    return request('/orders/');
}
export function getTracking(orderId) {
    return request(`/logistics/tracking/${orderId}`);
}
export function markNotificationRead(id) {
    return request(`/notifications/${id}/read`, { method: 'POST' });
}
export function getWishlist() { return request('/wishlist/'); }
export function addToWishlist(productId) { return request(`/wishlist/${productId}`, { method: 'POST' }); }
export function removeFromWishlist(productId) { return request(`/wishlist/${productId}`, { method: 'DELETE' }); }
export function getReviews(productId) {
    return request(`/reviews/products/${productId}`);
}
export function updateProfile(data) {
    return request('/auth/me', { method: 'PATCH', body: JSON.stringify(data) });
}
export function changePassword(current_password, new_password) {
    return request('/auth/change-password', { method: 'POST', body: JSON.stringify({ current_password, new_password }) });
}
export function requestPasswordReset(identifier) {
    return request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ identifier }) });
}
export function verifyResetCode(identifier, code) {
    return request('/auth/verify-reset-code', { method: 'POST', body: JSON.stringify({ identifier, code }) });
}
export function resetPassword(identifier, code, password) {
    return request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ identifier, code, password }) });
}
export function createProduct(data) {
    return request('/products/', { method: 'POST', body: JSON.stringify(data) });
}
export function updateProduct(id, data) {
    return request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export function uploadProductImage(id, image) {
    const body = new FormData();
    body.append('image', image);
    return request(`/products/${id}/image`, { method: 'POST', body, headers: {} });
}
export function deleteProduct(id) {
    return request(`/products/${id}`, { method: 'DELETE' });
}
export function payForOrder(orderId) {
    return request(`/payments/orders/${orderId}/pay`, { method: 'POST' });
}
export function getPayments() {
    return request('/payments/');
}
export function getFarmerPaymentSummary() {
    return request('/payments/farmer/summary');
}
export function getNotifications() {
    return request('/notifications/');
}
export function getDeliveries() {
    return request('/logistics/deliveries');
}
export function createVehicle(data) {
    return request('/logistics/vehicles', { method: 'POST', body: JSON.stringify(data) });
}
export function createDriver(data) {
    return request('/logistics/drivers', { method: 'POST', body: JSON.stringify(data) });
}
export function acceptDelivery(id) {
    return request(`/logistics/deliveries/${id}/accept`, { method: 'POST' });
}
export function updateDelivery(id, status, vehicle_id, driver_id) {
    return request(`/logistics/deliveries/${id}`, { method: 'PATCH', body: JSON.stringify({ status, vehicle_id, driver_id }) });
}
export function getVehicles() {
    return request('/logistics/vehicles');
}
export function getDrivers() {
    return request('/logistics/drivers');
}
export function getDemandForecast(crop = '') {
    return request(`/ai/demand-forecast${crop.trim() ? `?crop=${encodeURIComponent(crop.trim())}` : ''}`);
}
export function getSupplierMatches(crop, quantity = 0) {
    return request(`/ai/supplier-matches?crop=${encodeURIComponent(crop || '')}&quantity=${quantity}`);
}
export function createReview(data) {
    return request('/reviews/', { method: 'POST', body: JSON.stringify(data) });
}
export function getAdminUsers() {
    return request('/admin/users');
}
export function getAdminProducts() {
    return request('/admin/products');
}
export function getAdminOrders() {
    return request('/admin/orders');
}
export function updateOrderStatus(orderId, status) {
    return request(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}
export function deleteOrder(orderId) {
    return request(`/orders/${orderId}`, { method: 'DELETE' });
}
export function updateVehicle(id, data) {
    return request(`/logistics/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export function deleteVehicle(id) {
    return request(`/logistics/vehicles/${id}`, { method: 'DELETE' });
}
export function updateDriver(id, data) {
    return request(`/logistics/drivers/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export function deleteDriver(id) {
    return request(`/logistics/drivers/${id}`, { method: 'DELETE' });
}
export function getAdminAnalytics() {
    return request('/admin/analytics');
}
export function getAdminAuditLogs() {
    return request('/admin/audit-logs');
}
export function updateAdminUserStatus(userId, is_active) {
    return request(`/admin/users/${userId}/status`, { method: 'PATCH', body: JSON.stringify({ is_active }) });
}
export function estimateRoute(pickup, destination) {
    return request(`/routes/estimate?pickup=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}`);
}
export function getPartnerRecords(path) { return request(`/partners/${path}`); }
export function createPartnerRecord(path, data) { return request(`/partners/${path}`, { method: 'POST', body: JSON.stringify(data) }); }
export function deletePartnerRecord(path, id) { return request(`/partners/${path}/${id}`, { method: 'DELETE' }); }
export function getPartnerRequirementMatches(id) { return request(`/partners/bulk/requirements/${id}/matches`); }
