# Hydrogen example: Multipass

This folder contains an example implementation of [Multipass](https://shopify.dev/docs/api/multipass) for Hydrogen. It shows how to persist
the user session from a Hydrogen storefront through to checkout.

## Requirements

- Multipass is available on [Shopify Plus](https://www.shopify.com/plus) plans.
- A Shopify Multipass secret token. Go to [**Settings > Customer accounts**](https://www.shopify.com/admin/settings/customer_accounts) to create one.

## Key files

This folder contains the minimal set of files needed to showcase the implementation.
Files that aren’t included by default with Hydrogen and that you’ll need to
create are labeled with 🆕.

| File                                                                                                                    | Description                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 🆕 [`.env.example`](.env.example)                                                                                       | Example environment variable file. Copy the relevant variables to your existing `.env` file, if you have one. |
| 🆕 [`app/components/MultipassCheckoutButton.tsx`](app/components/MultipassCheckoutButton.tsx)                           | Checkout button component that passes the customer session to checkout.                                       |
| 🆕 [`app/utils/multipass/multipass.ts`](app/utils/multipass/multipass.ts)                                               | Utility function that handles getting a multipass URL and token.                                              |
| 🆕 [`app/utils/multipass/multipassify.server.ts`](app/lib/multipass/multipassify.server.ts)                             | Utility that handles creating and parse multipass tokens.                                                     |
| 🆕 [`app/utils/multipass/types.ts`](app/utils/multipass/types.ts)                                                       | Types for multipass utilities.                                                                                |
| 🆕 [`app/routes/($lang).account._public.login.multipass.tsx`](<app/routes/($lang).account._public.login.multipass.tsx>) | API route that returns generated multipass tokens.                                                            |
| [`app/components/Cart.tsx`](app/components/Cart.tsx)                                                                    | Hydrogen cart component, which gets updated to add the `<MultipassCheckoutButton>` component.                 |

## Dependencies

| Module                                                                  | Description                             |
| ----------------------------------------------------------------------- | --------------------------------------- |
| 🆕 [`snakecase-keys`](https://www.npmjs.com/package/snakecase-keys)     | Convert an object's keys to snake case  |
| 🆕 [`crypto-js`](https://www.npmjs.com/package/crypto-js)               | JavaScript library of crypto standards. |
| 🆕 [`@types/crypto-js`](https://www.npmjs.com/package/@types/crypto-js) | crypto-js TypeScript types              |

## Instructions

### 1. Install required dependencies

```bash
# JavaScript
npm i @snakecase-keys crypto-js

# TypeScript
npm i @snakecase-keys crypto-js
npm i --save-dev @types/crypto-js
```

### 2. Copy over the new files

- In your Hydrogen app, create the new files from the file list above, copying in the code as you go.
- If you already have a `.env` file, copy over these key-value pairs:
  - `PRIVATE_SHOPIFY_STORE_MULTIPASS_SECRET`
  - `PRIVATE_SHOPIFY_CHECKOUT_DOMAIN`

### 3. Edit the Cart component file

Import `MultipassCheckoutButton` and update the `CartCheckoutActions()` function. Wrap the standard `<Button>` component with the `<MultiPassCheckoutButton>` component:

```tsx
// app/components/Cart.tsx

import {MultipassCheckoutButton} from '~/components';

// ...

function CartCheckoutActions({checkoutUrl}: {checkoutUrl: string}) {
  if (!checkoutUrl) return null;

  return (
    <div>
      <MultipassCheckoutButton checkoutUrl={checkoutUrl}>
        <Button>Continue to Checkout</Button>
      </MultipassCheckoutButton>
    </div>
  );
}

// ...
```

[View the complete component file](app/components/Cart.tsx) to see these updates in context.
