export interface CountryPickerOptions {
    countries: string[];
    getSelectedCountry: () => string;
    anchor: HTMLElement;
    onSelect: (country: string) => void;
}

/**
 * Modular replacement for the native iOS popover pushed by the
 * "CountrySelector" segue (CVCountryPickerViewController). `onSelect`
 * plays the role of the `selectCountry:localizedCountry:` delegate
 * callback: it only fires once, when "Select" is pressed.
 */
export class CountryPicker {
    private readonly options: CountryPickerOptions;
    private wrapperEl: HTMLDivElement | null = null;
    private highlightedCountry: string;
    private readonly onDocumentKeydown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') this.close();
    };

    constructor(options: CountryPickerOptions) {
        this.options = options;
        this.highlightedCountry = options.getSelectedCountry();
    }

    isOpen(): boolean {
        return this.wrapperEl !== null;
    }

    open(): void {
        if (this.wrapperEl) return;

        this.highlightedCountry = this.options.getSelectedCountry();

        const overlay = document.createElement('div');
        overlay.className = 'country-picker-overlay';
        overlay.addEventListener('mousedown', (event) => {
            if (event.target === overlay) this.close();
        });

        const wrapper = document.createElement('div');
        wrapper.className = 'country-picker-wrapper';

        const arrow = document.createElement('div');
        arrow.className = 'country-picker-arrow';
        wrapper.appendChild(arrow);

        const popover = document.createElement('div');
        popover.className = 'country-picker';
        popover.setAttribute('role', 'dialog');
        popover.setAttribute('aria-label', 'Country');

        popover.appendChild(this.buildHeader());
        popover.appendChild(this.buildList());

        wrapper.appendChild(popover);
        overlay.appendChild(wrapper);
        document.body.appendChild(overlay);

        this.wrapperEl = wrapper;
        this.positionWrapper(wrapper, arrow);
        document.addEventListener('keydown', this.onDocumentKeydown);
    }

    close(): void {
        this.wrapperEl?.closest('.country-picker-overlay')?.remove();
        this.wrapperEl = null;
        document.removeEventListener('keydown', this.onDocumentKeydown);
    }

    toggle(): void {
        if (this.isOpen()) {
            this.close();
        } else {
            this.open();
        }
    }

    private buildHeader(): HTMLDivElement {
        const header = document.createElement('div');
        header.className = 'country-picker-header';

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'country-picker-close';
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => this.close());

        const title = document.createElement('div');
        title.className = 'country-picker-title';
        title.textContent = 'Country';

        const selectButton = document.createElement('button');
        selectButton.type = 'button';
        selectButton.className = 'country-picker-select';
        selectButton.textContent = 'Select';
        selectButton.addEventListener('click', () => {
            this.options.onSelect(this.highlightedCountry);
            this.close();
        });

        header.append(closeButton, title, selectButton);
        return header;
    }

    private buildList(): HTMLUListElement {
        const list = document.createElement('ul');
        list.className = 'country-picker-list';
        list.setAttribute('role', 'listbox');

        this.options.countries.forEach((country) => {
            const row = document.createElement('li');
            row.className = 'country-picker-row';
            row.textContent = country;
            row.setAttribute('role', 'option');
            row.dataset.country = country;
            row.setAttribute('aria-selected', String(country === this.highlightedCountry));
            if (country === this.highlightedCountry) {
                row.classList.add('country-picker-row--highlighted');
            }

            row.addEventListener('click', () => {
                this.highlightedCountry = country;
                list.querySelectorAll('.country-picker-row').forEach((el) => {
                    el.classList.remove('country-picker-row--highlighted');
                    el.setAttribute('aria-selected', 'false');
                });
                row.classList.add('country-picker-row--highlighted');
                row.setAttribute('aria-selected', 'true');
            });

            list.appendChild(row);
        });

        return list;
    }

    private positionWrapper(wrapper: HTMLDivElement, arrow: HTMLDivElement): void {
        const anchorRect = this.options.anchor.getBoundingClientRect();
        const popoverWidth = 280;
        const margin = 12;

        let left = anchorRect.right + margin;
        if (left + popoverWidth + margin > window.innerWidth) {
            left = Math.max(margin, window.innerWidth - popoverWidth - margin);
        }

        const arrowTop = anchorRect.top + anchorRect.height / 2;
        let top = arrowTop - 44;
        top = Math.max(margin, Math.min(top, window.innerHeight - 320));

        wrapper.style.left = `${left}px`;
        wrapper.style.top = `${top}px`;
        arrow.style.top = `${arrowTop - top}px`;
    }
}
