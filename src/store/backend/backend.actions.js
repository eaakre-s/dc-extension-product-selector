import { getBackend } from '../../backends/backends';

export const SET_BACKEND = 'SET_BACKEND';
export const INIT_BACKEND = 'INIT_BACKEND';

export const initBackend = () => (dispatch, getState) => {
  const { params } = getState();
  const backend = getBackend(params);

  // console.log('params', params)
  // console.log('backend', backend);
  // console.log('dispatch', dispatch);
  
  dispatch(setBackend(backend));
};

export const setBackend = value => ({
  type: SET_BACKEND,
  value
});
