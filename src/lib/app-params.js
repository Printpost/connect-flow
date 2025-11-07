// @ts-nocheck

const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const normalizeValue = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = typeof value === 'string' ? value.trim() : value;

  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
    return null;
  }

  return trimmed;
};

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `base44_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	const replaceUrlParams = () => {
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	};
	if (removeFromUrl) {
		urlParams.delete(paramName);
		replaceUrlParams();
	}
	const normalizedSearch = normalizeValue(searchParam);
	if (normalizedSearch !== null) {
		storage.setItem(storageKey, normalizedSearch);
		return normalizedSearch;
	}
	if (searchParam !== null && normalizedSearch === null) {
		// Explicitly clear any previously stored value when the URL provided an empty/null token.
		storage.removeItem(storageKey);
		urlParams.delete(paramName);
		replaceUrlParams();
	}
	const normalizedDefault = normalizeValue(defaultValue);
	if (normalizedDefault !== null) {
		storage.setItem(storageKey, normalizedDefault);
		return normalizedDefault;
	}
	const storedValue = normalizeValue(storage.getItem(storageKey));
	if (storedValue !== null) {
		return storedValue;
	}
	return null;
}

const getAppParams = () => {
	return {
		appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_BASE44_APP_ID }),
		serverUrl: getAppParamValue("server_url", { defaultValue: import.meta.env.VITE_BASE44_BACKEND_URL }),
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
		functionsVersion: getAppParamValue("functions_version"),
	}
}


export const appParams = {
	...getAppParams()
}
