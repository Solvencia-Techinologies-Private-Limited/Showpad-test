import type { NavigateFn } from './types.ts';
import { MOCK_PRODUCTS } from './mockProductData.ts';
import { createProductCard } from './productCard.ts';
import { openProductModal } from './productModal.ts';

export const renderProductsPage = (root: HTMLElement, navigate: NavigateFn): void => {
    const page = document.createElement('div');
    page.className = 'products-page';

    const title = document.createElement('h1');
    title.className = 'products-title';
    title.textContent = 'Products';
    page.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'products-grid';

    MOCK_PRODUCTS.forEach((product) => {
        const card = createProductCard(product, () => openProductModal(product, navigate));
        grid.appendChild(card);
    });

    page.appendChild(grid);
    root.appendChild(page);
};
