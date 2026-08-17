import type { NavigateFn, Product } from './types.ts';
import { findFitSetCollection } from './fitSetData.ts';
import { renderFitSetGrid } from './fitSetRenderer.ts';
import { FitSetSelectionStore } from './fitSetSelection.ts';
import { openFitSetCamera } from './fitSetCamera.ts';

/** Single point of change to point this page at a different FitSets-US.json collection. */
const FITSET_COLLECTION_NAME = 'Avaira Vitality Toric 460 FitSet';

const CAMERA_ICON_SVG =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>' +
    '<circle cx="12" cy="13" r="3.5"/>' +
    '</svg>';

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

    const cameraButton = document.createElement('button');
    cameraButton.type = 'button';
    cameraButton.className = 'fitset-camera-button';
    cameraButton.setAttribute('aria-label', 'Open camera');
    cameraButton.innerHTML = CAMERA_ICON_SVG;
    cameraButton.addEventListener('click', () => openFitSetCamera());

    topBar.append(backButton, title, selectionSummary, cameraButton);
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
