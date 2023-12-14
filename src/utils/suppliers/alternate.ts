export const extractAffiliateUrlAlternate = (url: string) => {
  const extracted = url.match(/product%2F([^?]+)/); // Dit is volgens mij niet goed, nog testen!
  return extracted ? decodeURIComponent(extracted[1]) : '';
};

export const constructAffiliateUrlAlternate = (url: string) => {
    return 'https://www.alternate.nl/html/product/' + url;
};
