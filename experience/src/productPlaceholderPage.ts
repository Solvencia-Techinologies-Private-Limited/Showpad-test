import type { NavigateFn, Product } from './types.ts';

export interface ProductPlaceholderPageOptions {
    className: string;
    heading: string;
    description: string;
}

/**
 * Shared layout for the Contact Picker and First Fit placeholder pages.
 * Both destination pages only need the selected product plus their own
 * heading/copy, so the actual DOM-building lives here and each page
 * module just supplies its identity.
 */
export const renderProductPlaceholderPage = (
    root: HTMLElement,
    navigate: NavigateFn,
    product: Product,
    options: ProductPlaceholderPageOptions,
): void => {
    const page = document.createElement('div');
    page.className = `product-placeholder-page ${options.className}`;

    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'product-placeholder-back';
    backButton.textContent = '← Back';
    backButton.addEventListener('click', () => navigate('products'));

    const heading = document.createElement('h1');
    heading.className = 'product-placeholder-heading';
    heading.textContent = options.heading;

    const image = document.createElement('img');
    image.className = 'product-placeholder-image';
    image.src = product.imageUrl;
    image.alt = product.name;

    const name = document.createElement('div');
    name.className = 'product-placeholder-name';
    name.textContent = product.name;

    const description = document.createElement('p');
    description.className = 'product-placeholder-description';
    description.textContent = options.description;

    page.append(backButton, heading, image, name, description);
    root.appendChild(page);
};
