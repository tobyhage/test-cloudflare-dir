export const extractAffiliateUrlMediamarkt = (url: string) => {
  const extracted = url.match(/product%2F(.+?)\)/);
  return extracted ? decodeURIComponent(extracted[1]) : '';
};

export const constructAffiliateUrlMediamarkt = (url: string) => {
    return 'https://www.mediamarkt.nl/nl/product/' + url;
};
