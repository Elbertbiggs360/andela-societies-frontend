import jwtDecode from 'jwt-decode';
import Cookie from 'js-cookie';

/**
 * @name getToken
 * @summary Retrieves token
 * @return {object} representing token information
 */
export const getToken = () => {
  try {
    const token = Cookie.get('jwt-token');
    if (!token) return false;
    return jwtDecode(token);
  } catch (error) {
    return {};
  }
};

/**
 * @name tokenIsValid
 * @summary Checks that token has not expired and payload has Andelan role
 * @param {object} token
 * @return {boolean} representing token
 */
export const tokenIsValid = (token) => {
  if (token.exp > new Date().getTime() / 1000 && token.UserInfo.roles.Andelan.length > 0) {
    return true;
  }
  return false;
};

/**
 * @name getUserInfo
 * @summary Retrieves user information
 * @param {object} token
 * @return {object} representing user information
 */
export const getUserInfo = token => (token.UserInfo || {});

/**
 * @name removeCookies
 * @summary Clears the jwt-token cookies
 */
export const removeCookies = (name, params = undefined) => {
  const options = params || {
    expires: 3,
    domain: '.andela.com',
  };
  return Cookie.remove(name, options);
};
