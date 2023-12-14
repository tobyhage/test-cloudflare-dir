export const prerender = false;

export async function GET({ params, redirect }) {
    const { supplier, brand, url = '' } = params;

    let redirectUrl = 'https://www.cnn.com';

    return redirect(redirectUrl, 307); // temporary redirect
}  