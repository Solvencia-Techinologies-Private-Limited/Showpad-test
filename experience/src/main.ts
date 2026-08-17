import { Showpad } from '@showpad/experience-app-sdk';
import { navigate } from './router.ts';
import { MOCK_PRODUCTS } from './mockProductData.ts';

// Outside the real Showpad host (e.g. `vite` dev server opened directly in a
// browser) the postMessage handshake behind onShowpadLibLoaded() never
// arrives, so the awaited promise never resolves and initWelcomeScreen() -
// along with every listener it attaches, including the Country picker's -
// never runs. Race it against a timeout so the screen still initializes
// for local/standalone testing while still waiting on the real handshake
// when one is available.
const SHOWPAD_LIB_LOAD_TIMEOUT_MS = 2000;

const waitForShowpadLib = (): Promise<unknown> =>
    Promise.race([
        Showpad.onShowpadLibLoaded(),
        new Promise<void>((resolve) => setTimeout(resolve, SHOWPAD_LIB_LOAD_TIMEOUT_MS)),
    ]);

// Startup flow temporarily bypasses Login -> Products -> FitSet-selection
// popup and jumps straight to the FitSet page. The 'welcome' / 'products' /
// 'contact-picker' views and the product modal are left in place, unused,
// for when the full flow is restored.
const STARTUP_PRODUCT = MOCK_PRODUCTS.find((product) => product.id === 'avaira-vitality-toric')!;

const main = async (): Promise<void> => {
    // The FitSet page doesn't read anything from the Showpad SDK, so it can
    // render on the very first tick instead of waiting on the handshake
    // below (which never resolves outside the real Showpad host and would
    // otherwise stall the first paint for SHOWPAD_LIB_LOAD_TIMEOUT_MS).
    navigate('first-fit', STARTUP_PRODUCT);

    try {
        await waitForShowpadLib();
    } catch (error) {
        Showpad.handleErrorWithToast(error);
        console.error(error);
    }
};

main();
