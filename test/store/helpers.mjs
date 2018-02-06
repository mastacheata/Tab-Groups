import Ajv from 'ajv'

import { getTabState } from '../../src/integrations/index.mjs'
import {
  createWindow,
  createTabGroup,
  createPinnedTabGroup,
  default_config,
  findTab,
  getTabGroupsPersistState,
  getTabMoveData,
} from '../../src/store/helpers.mjs'

export const base_new_browser_tab = {
  id: null,
  // index: null,
  // windowId: null,
  highlighted: false,
  active: false,
  pinned: false,
  status: "complete",
  discarded: false,
  incognito: false,
  width: 1278,
  height: 968,
  lastAccessed: 1512330352266,
  audible: false,
  mutedInfo: { muted: false },
  isArticle: false,
  isInReaderMode: false,
  url: "about:blank",
  title: "New Tab"
}

export const base_new_tab = getTabState( base_new_browser_tab )

export function createBrowserTab( tab ) {
  return Object.assign( {}, base_new_browser_tab, tab )
}

export function createTestTab( tab ) {
  return Object.assign( {}, base_new_tab, tab )
}

export function getInitialState() {
  const initial_state = {
    config: default_config,
    orphan_tabs: [],
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [] ),
        createTabGroup( 1, [
          createTestTab({
            id: 1
          }),
          createTestTab({
            id: 2
          })
        ])
      ])
    ]
  }

  return initial_state
}

export function getMultiWindowInitialState() {
  const initial_state = getInitialState()

  initial_state.windows.push(
    createWindow( 2, [
      createPinnedTabGroup( [] ),
      createTabGroup( 2, [
        createTestTab({
          id: 3
        }),
        createTestTab({
          id: 4
        })
      ])
    ])
  )

  return initial_state
}

export const tab_state_schema = {
  type: 'object',
  properties: {
    'id': {
      type: 'integer'
    },
    'title': {
      type: 'string'
    },
    'status': {
      type: 'string'
    },
    'url': {
      type: 'string'
    },
    'icon_url': {
      type: 'string',
      format: 'uri'
    },
    'discarded': {
      type: 'boolean'
    },
    'last_accessed': {
      type: 'integer'
    },
    'preview_image': {
      type: 'object',
      properties: {
        'width': {
          type: 'integer'
        },
        'height': {
          type: 'integer'
        },
        'uri': {
          type: 'string',
          format: 'uri'
        }
      }
    }
  },
  additionalProperties: false,
  required: [
    'id',
    'status',
  ]
}

export const tab_group_state_schema = {
  properties: {
    'id': {
      type: 'integer'
    },
    'title': {
      type: 'string'
    },
    'active_tab_id': {
    },
    'tabs': {
      type: 'array',
      items: tab_state_schema
    },
    'tabs_count': {
      type: 'integer'
    }
  },
  additionalProperties: false,
  required: [
    'id',
    'title',
    'active_tab_id',
    'tabs',
    'tabs_count',
  ]
}

export const pinned_tab_group_state_schema = {
  properties: {
    'id': {
      enum: [ 0 ]
    },
    'pinned': {
      enum: [ true ]
    },
    'active_tab_id': {
    },
    'tabs': {
      type: 'array',
      items: tab_state_schema
    },
    'tabs_count': {
      type: 'integer',
      minimum: 0
    }
  },
  additionalProperties: false,
  required: [
    'pinned'
  ]
}

export const window_state_schema = {
  type: 'object',
  properties: {
    'id': {
      type: 'integer'
    },
    'active_tab_group_id': {
      type: 'integer',
      minimum: 1
    },
    'tab_groups': {
      type: 'array',
      minItems: 2,
      items: {
        type: 'object',
        oneOf: [
          pinned_tab_group_state_schema,
          tab_group_state_schema
        ]
      }
    }
  },
  additionalProperties: false,
  required: [
    'id',
    'active_tab_group_id',
    'tab_groups',
  ]
}

export const state_schema = {
  type: 'object',
  properties: {
    config: {
      type: 'object'
    },
    orphan_tabs: {
      type: 'array',
      items: tab_state_schema
    },
    windows: {
      type: 'array',
      items: window_state_schema
    }
  },
  additionalProperties: false,
  required: [
    'config',
    'windows',
  ]
}

const ajv = new Ajv()
export const validateTabState = ajv.compile( tab_state_schema )
export const validateTabGroupState = ajv.compile( Object.assign( { type: 'object' }, tab_group_state_schema ) )
export const validateWindowState = ajv.compile( window_state_schema )
export const validateState = ajv.compile( state_schema )

function testFindTab( t ) {
  let state = getInitialState()
  let tab = findTab( state, state.windows[ 0 ].id, state.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ].id )
  t.equal( tab, state.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ] )
  t.end()
}

function testGetTabMoveData( t ) {
  const initial_state = {
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [] ),
        createTabGroup( 2, [
          createTestTab({ id: 4 }),
          createTestTab({ id: 5 }),
          createTestTab({ id: 6 })
        ]),
        createTabGroup( 3, [
          createTestTab({ id: 7 }),
          createTestTab({ id: 8 })
        ])
      ])
    ]
  }

  let source_data = {
    window_id: 1,
    tab_ids: [ 4, 5 ]
  }
  let target_data = {
    window_id: 1,
    tab_group_id: 3
  }

  let tab_move_data = getTabMoveData( initial_state, source_data, target_data )

  t.equal( tab_move_data.source_data.window_id, 1 )
  t.equal( tab_move_data.source_data.tabs.filter( tab => tab ).length, 2, "no missing tabs" )
  t.same( tab_move_data.source_data.tabs.map( tab => tab.id ), [ 4, 5 ], "tabs match ids and order" )
  t.equal( tab_move_data.source_data.tabs[ 0 ], initial_state.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ], "copy tab 4 by reference" )
  t.equal( tab_move_data.source_data.tabs[ 1 ], initial_state.windows[ 0 ].tab_groups[ 1 ].tabs[ 1 ], "copy tab 5 by reference" )
  t.same( tab_move_data.target_data, {
    window_id: 1,
    index: 3,
    tab_group_id: 3,
    tab_group_index: 2
  })

  t.end()
}

function testValidate( t ) {
  let state = getInitialState()
  t.equal( validateState( state ), true )
  t.end()
}

function testPersistence( t ) {
  let state = getInitialState()
  let tab_groups_state = getTabGroupsPersistState( state.windows[ 0 ] )

  t.same( tab_groups_state, [
    {
      id: 1,
      title: 'Group 1',
      active: true,
      active_tab_id: 1,
      tabs_count: 2
    }
  ])

  t.end()
}

export default function( tap ) {
  tap.test( testFindTab )
  tap.test( testGetTabMoveData )
  tap.test( testValidate )
  tap.test( testPersistence )
  tap.end()
}
