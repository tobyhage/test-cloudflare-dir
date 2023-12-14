export const extractAffiliateUrlCoolblue = (url: string) => {
  const productId = url.match(/(\d+)$/);
  return productId ? productId[0] : '';
};

export const constructAffiliateUrlCoolblue = (productId: string) => {
    return 'https://www.coolblue.nl/product/' + productId;
};
