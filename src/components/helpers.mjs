
/**
 * Delay execution of function, use only most recent args.  Works to wrap method on component
 * @param fn Function to delay
 * @param delay MS to delay
 */
export function debounce( fn, delay ) {
  let timeout_id = null
  return function() {
    clearTimeout( timeout_id )
    const args = arguments
    timeout_id = setTimeout(
      () => fn.apply( this, args ),
      delay
    )
  }
}

/**
 * Helper to pull the plural/singular version of a key
 * @param key The base localization key for the message
 * @param count The count for the property
 */
export function getCountMessage( key, count ) {
  return browser.i18n.getMessage( `${ key }_count_${ count === 1 ? 'singular' : 'plural' }`, [ count ] )
}
