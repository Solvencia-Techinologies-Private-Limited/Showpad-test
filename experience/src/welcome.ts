import { getMockRepInfo, MOCK_COUNTRIES, type RepInfo } from './mockRepData.ts';
import { CountryPicker } from './countryPicker.ts';
import type { NavigateFn } from './types.ts';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (value: string): boolean => EMAIL_REGEX.test(value.trim());

const WELCOME_PAGE_MARKUP = `
    <div class="welcome-panel">
        <h1 class="welcome-title">Welcome!</h1>

        <div class="welcome-section-label">Your Info</div>

        <div class="welcome-field">
            <label class="welcome-label" for="salesRepNameField">Name:</label>
            <input class="welcome-input" type="text" id="salesRepNameField" name="salesRepNameField" />
        </div>

        <div class="welcome-field">
            <label class="welcome-label" for="salesRepEmailField">E-mail:</label>
            <input class="welcome-input" type="email" id="salesRepEmailField" name="salesRepEmailField" />
        </div>

        <div class="welcome-field welcome-field--centered">
            <label class="welcome-label" for="salesRepCountryButton">Country:</label>
            <button
                class="welcome-country-select"
                id="salesRepCountryButton"
                name="salesRepCountryButton"
                type="button"
                aria-haspopup="dialog"
            ></button>
        </div>

        <div class="welcome-field">
            <label class="welcome-label" for="salesRepSupportRepEmailField">Order processing e-mail:</label>
            <input
                class="welcome-input"
                type="email"
                id="salesRepSupportRepEmailField"
                name="salesRepSupportRepEmailField"
            />
        </div>

        <div id="welcomeErrorMessage" class="welcome-error-message"></div>

        <button class="welcome-get-started-button" id="getStartedButton" type="button" disabled>
            Get Started
        </button>
    </div>
`;

interface WelcomeElements {
    nameField: HTMLInputElement;
    emailField: HTMLInputElement;
    countryButton: HTMLButtonElement;
    supportEmailField: HTMLInputElement;
    getStartedButton: HTMLButtonElement;
    errorMessage: HTMLDivElement;
}

const getElements = (root: HTMLElement): WelcomeElements => ({
    nameField: root.querySelector<HTMLInputElement>('#salesRepNameField')!,
    emailField: root.querySelector<HTMLInputElement>('#salesRepEmailField')!,
    countryButton: root.querySelector<HTMLButtonElement>('#salesRepCountryButton')!,
    supportEmailField: root.querySelector<HTMLInputElement>('#salesRepSupportRepEmailField')!,
    getStartedButton: root.querySelector<HTMLButtonElement>('#getStartedButton')!,
    errorMessage: root.querySelector<HTMLDivElement>('#welcomeErrorMessage')!,
});

const populateFields = (elements: WelcomeElements, repInfo: RepInfo): void => {
    elements.nameField.value = repInfo.salesRepName;
    elements.emailField.value = repInfo.salesRepEmail;
    elements.supportEmailField.value = repInfo.orderProcessingEmail;
    elements.countryButton.textContent = repInfo.country;
};

const updateGetStartedEnabled = (elements: WelcomeElements): void => {
    const enabled =
        elements.nameField.value.trim().length > 0 &&
        elements.emailField.value.trim().length > 0 &&
        elements.supportEmailField.value.trim().length > 0;
    elements.getStartedButton.disabled = !enabled;
};

const showError = (elements: WelcomeElements, message: string): void => {
    elements.errorMessage.textContent = message;
};

const validateAndSubmit = (elements: WelcomeElements, navigate: NavigateFn): void => {
    const name = elements.nameField.value.trim();
    const email = elements.emailField.value.trim();
    const supportEmail = elements.supportEmailField.value.trim();

    if (!name || !email || !supportEmail) {
        showError(elements, 'Missing Info: Please enter valid text for all fields.');
        return;
    }

    if (email === supportEmail) {
        showError(elements, 'Check E-mails: The e-mails cannot be the same.');
        return;
    }

    if (!isValidEmail(email) || !isValidEmail(supportEmail)) {
        showError(elements, 'Please enter valid e-mail addresses.');
        return;
    }

    showError(elements, '');
    navigate('products');
};

export const renderWelcomePage = (root: HTMLElement, navigate: NavigateFn): void => {
    root.insertAdjacentHTML('beforeend', WELCOME_PAGE_MARKUP);

    const elements = getElements(root);
    const repInfo = getMockRepInfo();

    populateFields(elements, repInfo);
    updateGetStartedEnabled(elements);

    [elements.nameField, elements.emailField, elements.supportEmailField].forEach((field) => {
        field.addEventListener('input', () => updateGetStartedEnabled(elements));
    });

    elements.getStartedButton.addEventListener('click', () => validateAndSubmit(elements, navigate));

    // Mirrors the "CountrySelector" segue: the popover owns its own
    // selection state and only reports back via this callback, which
    // stands in for the `selectCountry:localizedCountry:` delegate method.
    const countryPicker = new CountryPicker({
        countries: MOCK_COUNTRIES,
        getSelectedCountry: () => repInfo.country,
        anchor: elements.countryButton,
        onSelect: (country) => {
            repInfo.country = country;
            elements.countryButton.textContent = country;
        },
    });

    elements.countryButton.addEventListener('click', () => countryPicker.toggle());
};
