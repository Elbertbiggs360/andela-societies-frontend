/**
 * @name pointsToDollarConverter
 * @summary converts points to dollar
 * @param {number} points - points to convert
 * @returns {number} - dollars
 */
const pointsToDollarConverter = (points) => {
  const dollars = (points / 50).toFixed(2);
  return dollars;
};

export default pointsToDollarConverter;
