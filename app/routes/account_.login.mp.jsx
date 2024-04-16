import {json, redirect} from '@shopify/remix-oxygen';
import {Multipassify} from '~/utils/multipass/multipassify.server';

/*
  Redirect document GET requests to the login page (housekeeping)
*/
/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({params, request, context}) {
  const {session, storefront, cart} = context;
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const mptoken = searchParams.get('mptoken');
    const {customerAccessTokenCreateWithMultipass} = await storefront.mutate(
      CUSTOMER_LOGIN_MULTIPASS_MUTATION,
      {
        variables: {
          multipassToken: mptoken
        },
      },
    );

    if (!customerAccessTokenCreateWithMultipass?.customerAccessToken?.accessToken) {
      throw new Error(customerAccessTokenCreateWithMultipass?.customerUserErrors[0].message);
    }

    const {customerAccessToken} = customerAccessTokenCreateWithMultipass;
    session.set('customerAccessToken', customerAccessToken);

    cart.updateBuyerIdentity({
      customerAccessToken: customerAccessToken.accessToken,
    })

    return redirect('/account', {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return json({error: error.message}, {status: 400});
    }
    return json({error}, {status: 400});
  }
}

/*
  Generates a multipass token for a given customer and return_to url.
  Handles POST requests to `/account/login/multipass`
  expects body: { return_to?: string, customer }
*/
/**
 * @param {ActionFunctionArgs}
 */
export async function action({request, context}) {
  const {session, storefront, cart} = context;
  try {
    const body = await request.json();
    const {customerAccessTokenCreateWithMultipass} = await storefront.mutate(
      CUSTOMER_LOGIN_MULTIPASS_MUTATION,
      {
        variables: {
          multipassToken: body?.mptoken,
        },
      },
    );

    if (!customerAccessTokenCreateWithMultipass?.customerAccessToken?.accessToken) {
      throw new Error(customerAccessTokenCreateWithMultipass?.customerUserErrors[0].message);
    }

    const {customerAccessToken} = customerAccessTokenCreateWithMultipass;
    session.set('customerAccessToken', customerAccessToken);

    cart.updateBuyerIdentity({
      customerAccessToken: customerAccessToken.accessToken,
    })

    return json({return_to:'/account'}, {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return json({error: error.message}, {status: 400});
    }
    return json({error}, {status: 400});
  }
}

function handleMethodNotAllowed() {
  return json(
    {
      data: null,
      error: 'Method not allowed.',
    },
    {
      status: 405,
      headers: {Allow: 'POST, OPTIONS'},
    },
  );
}

/**
 * @param {string} origin
 */
function handleOptionsPreflight(origin) {
  return json(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

// Force log out a user in the checkout, if they logged out in the site.
// This fixes the edge-case where a user logs in (app),
// goes to checkout (logged in), then goes back to the app,
// logs out via the app and finally goes back to the checkout
// and the user is still logged in the checkout.
/**
 * @param {{
 *   return_to: string | null;
 *   checkoutDomain: string | undefined;
 * }} options
 */
async function handleLoggedOutResponse(options) {
  const {return_to, checkoutDomain} = options;
  // Match checkout urls such as:
  // https://checkout.example.com/cart/c/c1-dd274dd3e6dca2f6a6ea899e8fe9b90f?key=6900d0a8b227761f88cf2e523ae2e662
  const isCheckoutReq = /[\w-]{32}\?key/g.test(return_to || '');
  // console.log(!return_to);
  console.log(!isCheckoutReq);

  if (!return_to || !isCheckoutReq) {
    console.log('dapat dito diba?');
    return notLoggedInResponse({
      url: null,
      error: 'NOT_AUTHORIZED',
    });
  }

  // Force logging off the user in the checkout
  const encodedCheckoutUrl = encodeURIComponent(return_to);

  // For example, checkoutDomain `checkout.hydrogen.shop` or `shop.example.com` or `{shop}.myshopify.com`.
  const logOutUrl = `https://${checkoutDomain}/account/logout?return_url=${encodedCheckoutUrl}&step=contact_information`;
  return json({data: {url: logOutUrl}, error: null});
}

/*
  Helper response when errors occur.
*/
/**
 * @param {NotLoggedInResponseType} options
 */
function notLoggedInResponse(options) {
  const ERRORS = {
    MISSING_SESSION: 'No session found.',
    MISSING_EMAIL: 'Required customer `email` was not provided.',
    MISSING_RETURN_TO_URL:
      'Required customer `return_to` URL was not provided.',
    FAILED_GENERATING_MULTIPASS: 'Could not generate a multipass url.',
    'Invalid Secret': 'Invalid Secret',
    NOT_AUTHORIZED: 'Not authorized.',
  };

  const {url, error: errorKey} = options;

  let error;
  if (!errorKey) {
    error = 'UNKNOWN_ERROR';
  } else {
    error = ERRORS[errorKey] ?? 'UNKNOWN_ERROR';
  }

  // Always return the original URL.
  return json({data: {url}, error});
}

/**
 * @param {string} origin
 */
function getCorsHeaders(origin) {
  // Only requests from these origins will pass pre-flight checks
  const allowedOrigin = [
    origin,
    // Add other domains that you'd like to allow to multipass from
    // 'https://example.com',
  ].find((allowedHost) => origin.includes(allowedHost));

  return {
    'Access-Control-Allow-Origin': `${allowedOrigin}`,
    'Access-Control-Allow-Headers':
      'Origin, X-Requested-With, Content-Type, Accept',
  };
}

const CUSTOMER_LOGIN_MULTIPASS_MUTATION = `#graphql
  mutation customerAccessTokenCreateWithMultipass($multipassToken: String!) {
    customerAccessTokenCreateWithMultipass(multipassToken: $multipassToken) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('~/utils/multipass/types').CustomerInfoType} CustomerInfoType */
/** @typedef {import('~/utils/multipass/types').MultipassRequestBody} MultipassRequestBody */
/** @typedef {import('~/utils/multipass/types').NotLoggedInResponseType} NotLoggedInResponseType */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
