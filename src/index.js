/**
 * @jest-environment jsdom
 */

import React, { forwardRef, memo } from 'react';

const noop = () => {};
const REACT_MEMO_TYPE = memo(noop).$$typeof;
const REACT_FORWARD_REF_TYPE = forwardRef(noop).$$typeof;

const BASE_IGNORE_LIST = [
  'staticContext',
  'routeParams',
  'children',
  'location',
  'history',
  'context',
  'params',
  'routes',
  'route',
  'match',
  'slug',
  'fn',
];

function check(Component, props, ignoreData) {
  const ignoreList = BASE_IGNORE_LIST.concat(ignoreData);
  const unspecifiedProps = Object.keys(props).filter(
    (prop) => !Component.propTypes.hasOwnProperty(prop) && ignoreList.indexOf(prop) === -1
  );
  const name = Component.name || Component.displayName;
  if (!name) {
    console.warn(
      `Missing 'displayName'. Make sure to add a displayName to all forwardRef, memo, and HOC wrapped components. See: https://reactjs.org/docs/higher-order-components.html#convention-wrap-the-display-name-for-easy-debugging`
    );
  } else {
    if (unspecifiedProps.length) {
      console.warn(`Component ${name} has unspecified props: ${unspecifiedProps.join(', ')}`);
    }
  }
}

function withCheckExtraProps(Component, ignoreData = []) {
  if (process.env.NODE_ENV === 'production') return Component;

  if (
    Component.$$typeof === REACT_FORWARD_REF_TYPE ||
    (Component.$$typeof === REACT_MEMO_TYPE && Component.type.$$typeof === REACT_FORWARD_REF_TYPE)
  ) {
    return forwardRef(function (props, ref) {
      check(Component, props, ignoreData);
      return <Component {...props} ref={ref} />;
    });
  }

  return function (props) {
    check(Component, props, ignoreData);
    return <Component {...props} />;
  };
}

export default withCheckExtraProps;
