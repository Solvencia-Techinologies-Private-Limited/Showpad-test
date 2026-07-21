import type { NavigateFn, Product } from './types.ts';
import { renderFitSetPage } from './fitSetPage.ts';

export const renderFirstFitPage = (root: HTMLElement, navigate: NavigateFn, product: Product): void => {
    renderFitSetPage(root, navigate, product);
};
