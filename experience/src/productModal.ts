import type { NavigateFn, Product } from './types.ts';

/**
 * A one-shot popup, not a reusable component instance: it builds its own
 * overlay, appends it to <body>, and tears itself down on close. Mirrors
 * the interaction pattern used by CountryPicker's overlay/click-outside
 * handling.
 */
export const openProductModal = (product: Product, navigate: NavigateFn): void => {
    const overlay = document.createElement('div');
    overlay.className = 'product-modal-overlay';

    const close = (): void => {
        overlay.remove();
        document.removeEventListener('keydown', onKeydown);
    };

    const onKeydown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') close();
    };

    overlay.addEventListener('mousedown', (event) => {
        if (event.target === overlay) close();
    });

    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', product.name);

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'product-modal-close';
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.textContent = '×';
    closeButton.addEventListener('click', close);

    const image = document.createElement('img');
    image.className = 'product-modal-image';
    image.src = product.imageUrl;
    image.alt = product.name;

    const title = document.createElement('div');
    title.className = 'product-modal-title';
    title.textContent = product.name;

    const actions = document.createElement('div');
    actions.className = 'product-modal-actions';

    const contactPickerButton = document.createElement('button');
    contactPickerButton.type = 'button';
    contactPickerButton.className = 'product-modal-action product-modal-action--primary';
    contactPickerButton.textContent = 'Contact Picker';
    contactPickerButton.addEventListener('click', () => {
        close();
        navigate('contact-picker', product);
    });

    const firstFitButton = document.createElement('button');
    firstFitButton.type = 'button';
    firstFitButton.className = 'product-modal-action';
    firstFitButton.textContent = 'Fit set';
    firstFitButton.addEventListener('click', () => {
        close();
        navigate('first-fit', product);
    });

    actions.append(contactPickerButton, firstFitButton);
    modal.append(closeButton, image, title, actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKeydown);
};
