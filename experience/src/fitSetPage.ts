import type { NavigateFn, Product } from './types.ts';
import { findFitSetCollection } from './fitSetData.ts';
import { renderFitSetGrid } from './fitSetRenderer.ts';
import { FitSetSelectionStore } from './fitSetSelection.ts';

/** Single point of change to point this page at a different FitSets-US.json collection. */
const FITSET_COLLECTION_NAME = 'Avaira Vitality Toric 460 FitSet';

export const renderFitSetPage = (root: HTMLElement, navigate: NavigateFn, product: Product): void => {
    const resolved = findFitSetCollection(FITSET_COLLECTION_NAME);

    const page = document.createElement('div');
    page.className = 'fitset-page';

    const topBar = document.createElement('div');
    topBar.className = 'fitset-top-bar';

    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'fitset-back-button';
    backButton.textContent = 'Back to Cart';
    backButton.addEventListener('click', () => navigate('products'));

    const title = document.createElement('div');
    title.className = 'fitset-title';
    title.textContent = FITSET_COLLECTION_NAME;

    const selectionSummary = document.createElement('div');
    selectionSummary.className = 'fitset-selection-summary';
    selectionSummary.textContent = 'No items selected';

    topBar.append(backButton, title, selectionSummary);
    page.appendChild(topBar);

    if (!resolved) {
        const notFound = document.createElement('p');
        notFound.className = 'fitset-not-found';
        notFound.textContent = `FitSet collection "${FITSET_COLLECTION_NAME}" was not found for ${product.name}.`;
        page.appendChild(notFound);
        root.appendChild(page);
        return;
    }

    const selection = new FitSetSelectionStore();
    selection.onChange(() => {
        selectionSummary.textContent = selection.totalCount === 0 ? 'No items selected' : `${selection.totalCount} items selected`;
    });

    renderFitSetGrid(page, resolved.collection, resolved.techName, selection);

    root.appendChild(page);
};
