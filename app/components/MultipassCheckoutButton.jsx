import React, {useCallback} from 'react';
import {multipass} from '~/utils/multipass/multipass';

/*
  This component attempts to persist the customer session
  state in the checkout by using multipass.
  Note: multipass checkout is a Shopify Plus+ feature only.
*/
/**
 * @param {MultipassCheckoutButtonProps} props
 */
export function MultipassCheckoutButton(props) {
  const {children, onClick, checkoutUrl, redirect = true} = props;

  const checkoutHandler = useCallback(
    async (event) => {
      event.preventDefault();
      if (!checkoutUrl) return;

      if (typeof onClick === 'function') {
        onClick();
      }

      /*
       * If they user is logged in we persist it in the checkout,
       * otherwise we log them out of the checkout too.
       */
      return await multipass({return_to: checkoutUrl, redirect});
    },
    [redirect, checkoutUrl, onClick],
  );

  return <button onClick={checkoutHandler}>{children}</button>;
}

/**
 * @typedef {{
 *   checkoutUrl: string;
 *   children: React.ReactNode;
 *   onClick?: () => void;
 *   redirect?: boolean;
 * }} MultipassCheckoutButtonProps
 */
