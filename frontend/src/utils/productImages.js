const productImages = {
    tomato: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=85',
    rice: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=900&q=85',
    onion: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=900&q=85',
    mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=85',
    default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85',
};

export function getProductImage(product) {
    if (product?.image_url) {
        return product.image_url.startsWith('http')
            ? product.image_url
            : `${window.location.protocol}//${window.location.hostname}:5000${product.image_url}`;
    }

    const key = `${product?.name || ''} ${product?.crop || ''}`.toLowerCase();
    return Object.entries(productImages).find(([name]) => name !== 'default' && key.includes(name))?.[1] || productImages.default;
}