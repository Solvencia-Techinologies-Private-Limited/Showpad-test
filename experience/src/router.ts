import type { NavigateFn, Product, View } from './types.ts';
import { renderWelcomePage } from './welcome.ts';
import { renderProductsPage } from './productsPage.ts';
import { renderContactPickerPage } from './contactPickerPage.ts';
import { renderFirstFitPage } from './firstFitPage.ts';

const getAppRoot = (): HTMLElement => document.querySelector<HTMLElement>('#app')!;

const renderView = (root: HTMLElement, view: View, product: Product | undefined, navigate: NavigateFn): void => {
    switch (view) {
        case 'welcome':
            renderWelcomePage(root, navigate);
            return;
        case 'products':
            renderProductsPage(root, navigate);
            return;
        case 'contact-picker':
            renderContactPickerPage(root, navigate, product!);
            return;
        case 'first-fit':
            renderFirstFitPage(root, navigate, product!);
            return;
    }
};

export const navigate: NavigateFn = (view, product) => {
    const root = getAppRoot();
    root.innerHTML = '';
    renderView(root, view, product, navigate);
};
