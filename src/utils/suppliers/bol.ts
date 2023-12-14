export const extractAffiliateUrlBol = (url: string) => {
  const productId = url.match(/(\d+)$/);
  return productId ? productId[0] : '';
};

export const constructAffiliateUrlBol = (productId: string, brand: string) => {
    return 'https://www.bol.com/nl/nl/p/' + brand + '/' + productId;
};
