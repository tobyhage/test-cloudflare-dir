import slugify from 'limax';
import { trim } from '@utils/utils';
import { extractAffiliateUrlBol } from './suppliers/bol';
import { extractAffiliateUrlAlternate } from './suppliers/alternate';
import { extractAffiliateUrlCoolblue } from './suppliers/coolblue';
import { extractAffiliateUrlMediamarkt } from './suppliers/mediamarkt';

export const trimSlash = (s: string) => trim(trim(s, '/'));

const createPath = (...params: string[]) => {
  const paths = params
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/');
  return '/' + paths;
};

export const cleanSlug = (text: string = '') => {
  const trimmedText = trimSlash(text);
  if (trimmedText === undefined) {
    //console.log('trimSlash returned undefined for text:', text);
    return '';
  }
  const slugArray = trimmedText.split('/');
  //console.log('slugArray:', slugArray);
  const cleanedSlug = slugArray.map((slug) => slugify(slug)).join('-');
  //console.log('cleanedSlug:', cleanedSlug);
  return cleanedSlug;
};

export const POST_CATEGORY_BASE = '/blog/categorie';

export function deslugify(text: string | undefined): string {
  const withoutHyphens = text?.replace(/-+/g, ' ') || '';
  return withoutHyphens.charAt(0).toUpperCase() + withoutHyphens.slice(1);
}

export const getPermalink = (slug = '', type = 'page'): string => {
  let permalink: string;

  switch (type) {
    case 'category':
      permalink = createPath(POST_CATEGORY_BASE, trimSlash(slug));
      break;

    case 'post':
      permalink = createPath(trimSlash(slug));
      break;

    case 'page':
    default:
      permalink = createPath(slug);
      break;
  }

  return definitivePermalink(permalink);
};

const definitivePermalink = (permalink: string): string => createPath('/', permalink);

export const createAffiliateLink = (supplier: string, url: string, brand: string) => {
  let affiliateUrl;

  const supplierSlug = cleanSlug(supplier);
  const brandSlug = cleanSlug(brand);

  switch (supplierSlug) {
    case 'bol-com':
      affiliateUrl = extractAffiliateUrlBol(url);
      break;
    case 'alternate':
      affiliateUrl = extractAffiliateUrlAlternate(url);
      break;
    case 'coolblue':
      affiliateUrl = extractAffiliateUrlCoolblue(url);
      break;
    case 'mediamarkt':
      affiliateUrl = extractAffiliateUrlMediamarkt(url);
      break;

    default:
      affiliateUrl = '#';
  }
  return '/links/' + supplierSlug + '/' + brandSlug + '/' + affiliateUrl;
};
