/**
 * Live camera preview overlay for the FitSet page. Mirrors the overlay
 * lifecycle used by productModal.ts (create -> append to <body> -> tear
 * down on close), but drives a getUserMedia video stream instead of
 * static content.
 *
 * Flow: live preview -> Capture freezes the frame onto a canvas snapshot
 * and stops the stream -> Retake restarts the stream, Use Photo or the
 * close/cancel button both tear the overlay down and return to FitSet.
 */

type FacingMode = 'environment' | 'user';

export const openFitSetCamera = (): void => {
    const overlay = document.createElement('div');
    overlay.className = 'fitset-camera-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Camera preview');

    let stream: MediaStream | null = null;
    let currentFacingMode: FacingMode = 'environment';

    const close = (): void => {
        stream?.getTracks().forEach((track) => track.stop());
        stream = null;
        overlay.remove();
        document.removeEventListener('keydown', onKeydown);
    };

    const onKeydown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') close();
    };

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'fitset-camera-close';
    closeButton.setAttribute('aria-label', 'Close camera');
    closeButton.textContent = '×';
    closeButton.addEventListener('click', close);

    const switchButton = document.createElement('button');
    switchButton.type = 'button';
    switchButton.className = 'fitset-camera-switch';
    switchButton.setAttribute('aria-label', 'Switch camera');
    switchButton.textContent = '⟲';
    switchButton.hidden = true;

    const video = document.createElement('video');
    video.className = 'fitset-camera-video';
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;

    const capturedImage = document.createElement('img');
    capturedImage.className = 'fitset-camera-captured-image';
    capturedImage.alt = 'Captured photo';
    capturedImage.hidden = true;

    const message = document.createElement('p');
    message.className = 'fitset-camera-message';
    message.hidden = true;

    const captureButton = document.createElement('button');
    captureButton.type = 'button';
    captureButton.className = 'fitset-camera-capture';
    captureButton.setAttribute('aria-label', 'Capture photo');

    const retakeButton = document.createElement('button');
    retakeButton.type = 'button';
    retakeButton.className = 'fitset-camera-retake';
    retakeButton.textContent = 'Retake';

    const usePhotoButton = document.createElement('button');
    usePhotoButton.type = 'button';
    usePhotoButton.className = 'fitset-camera-use-photo';
    usePhotoButton.textContent = 'Use Photo';

    const capturedControls = document.createElement('div');
    capturedControls.className = 'fitset-camera-captured-controls';
    capturedControls.hidden = true;
    capturedControls.append(retakeButton, usePhotoButton);

    const bottomControls = document.createElement('div');
    bottomControls.className = 'fitset-camera-bottom-controls';
    bottomControls.append(captureButton, capturedControls);

    overlay.append(closeButton, switchButton, video, capturedImage, message, bottomControls);
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKeydown);

    const showMessage = (text: string): void => {
        video.hidden = true;
        captureButton.hidden = true;
        switchButton.hidden = true;
        message.hidden = false;
        message.textContent = text;
    };

    const showLiveState = (): void => {
        capturedImage.hidden = true;
        capturedControls.hidden = true;
        video.hidden = false;
        captureButton.hidden = false;
        closeButton.setAttribute('aria-label', 'Close camera');
    };

    const showCapturedState = (): void => {
        video.hidden = true;
        captureButton.hidden = true;
        switchButton.hidden = true;
        capturedImage.hidden = false;
        capturedControls.hidden = false;
        closeButton.setAttribute('aria-label', 'Cancel and return to FitSet');
    };

    const startStream = (facingMode: FacingMode): Promise<void> => {
        if (!navigator.mediaDevices?.getUserMedia) {
            showMessage('Camera access is not supported on this device or browser.');
            return Promise.resolve();
        }
        return navigator.mediaDevices
            .getUserMedia({ video: { facingMode: { ideal: facingMode } }, audio: false })
            .then((mediaStream) => {
                // The dialog can be closed (or a switch requested) while the
                // permission prompt is still pending; drop a stream that
                // arrives after that instead of leaking an open camera track.
                if (!overlay.isConnected) {
                    mediaStream.getTracks().forEach((track) => track.stop());
                    return;
                }
                stream?.getTracks().forEach((track) => track.stop());
                stream = mediaStream;
                currentFacingMode = facingMode;
                video.srcObject = mediaStream;
            })
            .catch((error: unknown) => {
                console.error(error);
                const name = error instanceof DOMException ? error.name : undefined;
                const deniedMessage =
                    name === 'NotAllowedError' || name === 'PermissionDeniedError'
                        ? 'Camera permission was denied. Enable camera access in your browser settings to use this feature.'
                        : name === 'NotFoundError'
                          ? 'No camera was found on this device.'
                          : 'Unable to access the camera.';
                showMessage(deniedMessage);
            });
    };

    captureButton.addEventListener('click', () => {
        if (!video.videoWidth || !video.videoHeight) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) return;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        capturedImage.src = canvas.toDataURL('image/png');
        stream?.getTracks().forEach((track) => track.stop());
        stream = null;
        showCapturedState();
    });

    retakeButton.addEventListener('click', () => {
        showLiveState();
        void startStream(currentFacingMode);
    });

    usePhotoButton.addEventListener('click', close);

    switchButton.addEventListener('click', () => {
        void startStream(currentFacingMode === 'environment' ? 'user' : 'environment');
    });

    if (navigator.mediaDevices?.enumerateDevices) {
        navigator.mediaDevices
            .enumerateDevices()
            .then((devices) => {
                const videoInputCount = devices.filter((device) => device.kind === 'videoinput').length;
                if (videoInputCount > 1 && overlay.isConnected) {
                    switchButton.hidden = false;
                }
            })
            .catch(() => {
                // Device list is a progressive enhancement for the switch button; ignore failures.
            });
    }

    void startStream(currentFacingMode);
};
