import { cleanSlug } from '@utils/permalinks';
import { constructAffiliateUrlAlternate } from '@utils/suppliers/alternate';
import { constructAffiliateUrlBol } from '@utils/suppliers/bol';
import { constructAffiliateUrlCoolblue } from '@utils/suppliers/coolblue';
import { constructAffiliateUrlMediamarkt } from '@utils/suppliers/mediamarkt';

export const prerender = false;

/*
 * format url /links/<supplier>/<brand>/<affUrl>
 *
 */

export async function GET({ params, redirect }) {
  const { supplier, brand, url = '' } = params;

  let redirectUrl;

  const supplierSlug = cleanSlug(supplier);

  switch (supplierSlug) {
    case 'coolblue':
      redirectUrl = constructAffiliateUrlCoolblue(url);
      break;
    case 'bol-com':
      redirectUrl = constructAffiliateUrlBol(url, brand);
      break;
    case 'mediamarkt':
      redirectUrl = constructAffiliateUrlMediamarkt(url);
      break;
    case 'alternate':
      redirectUrl = constructAffiliateUrlAlternate(url);
      break;

    default:
      return new Response(null, { status: 400 });
  }

  return redirect(redirectUrl, 307); // temporary redirect
}
