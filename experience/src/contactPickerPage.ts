import type { NavigateFn, Product } from './types.ts';
import { renderProductPlaceholderPage } from './productPlaceholderPage.ts';

export const renderContactPickerPage = (root: HTMLElement, navigate: NavigateFn, product: Product): void => {
    renderProductPlaceholderPage(root, navigate, product, {
        className: 'contact-picker-page',
        heading: 'Contact Picker',
        description:
            'This is a placeholder for the Contact Picker flow. Real contact search, filtering, and selection will be wired up here.',
    });
};
