import type { Product } from './types.ts';

export const createProductCard = (product: Product, onClick: () => void): HTMLButtonElement => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'product-card';
    card.addEventListener('click', onClick);

    const image = document.createElement('img');
    image.className = 'product-card-image';
    image.src = product.imageUrl;
    image.alt = product.name;

    const name = document.createElement('div');
    name.className = 'product-card-name';
    name.textContent = product.name;

    card.append(image, name);
    return card;
};
