/* global localStorage */
export const loadPreferences = () => {
  try {
    return JSON.parse(localStorage.getItem('preferences')) || undefined;
  } catch (e) {
    return undefined;
  }
};

export const persistPreferences = (preferences) => {
  try {
    localStorage.setItem('preferences', JSON.stringify(preferences));
  } catch (e) {
    // if setItem fails due to browser settings/compatibility, swallow error
  }
};
