/**
 * Google reCAPTCHA Enterprise Integration
 * Site Key for CampVerse project
 */

const RECAPTCHA_SITE_KEY = '6Lds6kUsAAAAANTnwr8PNatSSk5vzWCPGTIF6N5-';

// Extend window interface for grecaptcha
declare global {
    interface Window {
        grecaptcha: {
            enterprise: {
                ready: (callback: () => void) => void;
                execute: (siteKey: string, options: { action: string }) => Promise<string>;
            };
        };
    }
}

/**
 * Execute reCAPTCHA and get a token for the specified action
 * @param action - The action name (e.g., 'LOGIN', 'SIGNUP', 'SUBMIT')
 * @returns Promise<string> - The reCAPTCHA token
 */
export const executeRecaptcha = async (action: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            if (!window.grecaptcha?.enterprise) {
                console.warn('reCAPTCHA not loaded, skipping verification');
                resolve(''); // Return empty string if reCAPTCHA not available
                return;
            }

            window.grecaptcha.enterprise.ready(async () => {
                try {
                    const token = await window.grecaptcha.enterprise.execute(
                        RECAPTCHA_SITE_KEY,
                        { action }
                    );
                    resolve(token);
                } catch (error) {
                    console.error('reCAPTCHA execution failed:', error);
                    reject(error);
                }
            });
        } catch (error) {
            console.error('reCAPTCHA error:', error);
            reject(error);
        }
    });
};

/**
 * Check if reCAPTCHA is available
 */
export const isRecaptchaAvailable = (): boolean => {
    return typeof window !== 'undefined' && !!window.grecaptcha?.enterprise;
};

export { RECAPTCHA_SITE_KEY };
