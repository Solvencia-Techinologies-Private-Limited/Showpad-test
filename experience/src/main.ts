import { Showpad } from '@showpad/experience-app-sdk';
import { navigate } from './router.ts';

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

const main = async (): Promise<void> => {
    try {
        await waitForShowpadLib();

        navigate('welcome');
    } catch (error) {
        Showpad.handleErrorWithToast(error);
        console.error(error);
    }
};

main();
