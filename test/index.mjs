import tap from 'tap'

import testIntegations from './integrations/index.mjs'
import testStore from './store/index.mjs'

tap.test( './integrations', testIntegations )
tap.test( './store', testStore )
