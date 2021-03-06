
export function pick( obj, fn ) {
  return Object.keys( obj ).reduce( ( result, key ) => {
    if( fn( obj[ key ] ) ) {
      result[ key ] = obj[ key ]
    }
    return result
  }, {})
}

export function createStore( reducer, initial_state ) {
  const listeners = []
  let current_state = initial_state
  let is_dispatching = false
  let dispatch_id = 0

  const store = {
    is_dispatching,
    dispatch,
    subscribe,
    getState,
  }

  function getState() {
    return current_state
  }

  function subscribe( listener ) {
    listeners.push( listener )

    return function unsubscribe() {
      var index = listeners.indexOf( listener )
      listeners.splice( index, 1 )
    }
  }

  function dispatch( action ) {
    let local_dispatch_id = ++dispatch_id
    // if( is_dispatching ) {
    //   throw new Error('Reducers may not dispatch actions.')
    // }

    try {
      store.is_dispatching = true
      current_state = reducer( current_state, action )
    } finally {
      store.is_dispatching = false
    }

    for( let listener of listeners.slice() ) {
      if( dispatch_id !== local_dispatch_id ) {
        console.info('parallel dispatch, early abort')
        break
      }
      listener()
    }
    return action
  }

  dispatch({ type: '@@redux/INIT' })

  return store
}
