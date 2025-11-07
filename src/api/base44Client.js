import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const sanitize = (value) => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return undefined;
  }

  return trimmed;
};

const isHttpUrl = (value) => {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

const createNoopClient = () => {
  const noopFunction = new Proxy(() => Promise.reject(new Error('Base44 client não configurado')), {
    get: () => noopFunction,
    apply: (target, thisArg, argArray) => Reflect.apply(target, thisArg, argArray),
  });

  return new Proxy({ isConfigured: false }, {
    get: (target, prop) => {
      if (prop in target) {
        return target[prop];
      }
      return noopFunction;
    },
  });
};

const sanitizedAppId = sanitize(appParams.appId);
const sanitizedServerUrl = sanitize(appParams.serverUrl);
const sanitizedToken = sanitize(appParams.token);
const sanitizedFunctionsVersion = sanitize(appParams.functionsVersion);

const hasValidConfig = Boolean(sanitizedAppId && sanitizedServerUrl && isHttpUrl(sanitizedServerUrl));

export const base44 = hasValidConfig
  ? createClient({
      appId: sanitizedAppId,
      serverUrl: sanitizedServerUrl,
      token: sanitizedToken,
      functionsVersion: sanitizedFunctionsVersion,
      requiresAuth: false,
    })
  : createNoopClient();

if (!hasValidConfig) {
  console.warn('[Base44] Client desabilitado - parâmetros ausentes ou inválidos');
}
