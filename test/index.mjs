import tap from 'tap'

import testHelper from './store/helpers.mjs'
import testInit from './store/init.mjs'
import testTabActivate from './store/tab-activate.mjs'
import testTabAdd from './store/tab-add.mjs'
import testTabRemove from './store/tab-remove.mjs'
import testTabMove from './store/tab-move.mjs'
import testWindowAdd from './store/window-add.mjs'
import testWindowSearch from './store/window-search.mjs'
import testPinnedTabs from './store/pinned-tabs.mjs'

tap.test( './store/helpers.mjs', testHelper )
tap.test( './store/init.mjs', testInit )
tap.test( './store/tab-activate.mjs', testTabActivate )
tap.test( './store/tab-add.mjs', testTabAdd )
tap.test( './store/tab-remove.mjs', testTabRemove )
tap.test( './store/tab-move.mjs', testTabMove )
tap.test( './store/window-add.mjs', testWindowAdd )
tap.test( './store/window-search.mjs', testWindowSearch )
tap.test( './store/pinned-tabs.mjs', testPinnedTabs )
