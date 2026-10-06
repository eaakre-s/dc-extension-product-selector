// Stand-in for the dc-extensions-sdk when running `npm start` outside of Amplience.
// Installation params come from REACT_APP_LOCAL_PARAMS in .env.development.local (git-ignored).
const STORAGE_KEY = 'dc-extension-product-selector:value';

export const isLocalDev = () => process.env.NODE_ENV === 'development' && window.self === window.top;

export const localSdk = () => {
  const installation = JSON.parse(process.env.REACT_APP_LOCAL_PARAMS || '{}');

  return {
    params: { installation, instance: {} },
    form: {
      readOnly: false,
      onReadOnlyChange: () => {},
    },
    frame: {
      // In Amplience the iframe grows to fit the content; locally, let the page scroll instead.
      startAutoResizer: () => {
        document.body.style.overflow = 'auto';
      },
    },
    field: {
      schema: { type: 'array', items: { type: 'string' } },
      getValue: async () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),
      setValue: async (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)),
    },
  };
};
