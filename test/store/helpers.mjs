import Ajv from 'ajv'

import { getTabState } from '../../src/integrations/index.mjs'
import {
  createWindow,
  createTabGroup,
  default_config,
  findTab,
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
        createTabGroup( 1, [
          createTestTab({
            id: 1,
            is_active: true
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
      createTabGroup( 2, [
        createTestTab({
          id: 3,
          active: true
        }),
        createTestTab({
          id: 4
        })
      ])
    ])
  )

  return initial_state
}

export const tab_schema = {
  type: 'object',
  properties: {
    'id': {
      type: 'number'
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
    'is_active': {
      type: 'boolean'
    },
    'is_discarded': {
      type: 'boolean'
    },
    'last_accessed': {
      type: 'number'
    },
    'preview_image': {
      type: 'object',
      properties: {
        'width': {
          type: 'number'
        },
        'height': {
          type: 'number'
        },
        'uri': {
          type: 'string',
          format: 'uri'
        }
      }
    }
  },
  required: [
    'id',
    'status',
  ]
}

export const tab_group_schema = {
  type: 'object',
  properties: {
    'id': {
      type: 'number'
    },
    'title': {
      type: 'string'
    },
    'tabs': {
      type: 'array',
      items: tab_schema
    },
    'tabs_count': {
      type: 'number'
    }
  },
  required: [
    'id',
    'title',
    'tabs',
    'tabs_count',
  ]
}

export const window_schema = {
  type: 'object',
  properties: {
    'id': {
      type: 'number'
    },
    'active_tab_group_id': {
      type: 'number'
    },
    'tab_groups': {
      type: 'array',
      items: tab_group_schema
    }
  },
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
      items: tab_schema
    },
    windows: {
      type: 'array',
      items: window_schema
    }
  },
  required: [
    'config',
    'windows',
  ]
}

const ajv = new Ajv()
export const validateTab = ajv.compile( tab_schema )
export const validateTabGroup = ajv.compile( tab_group_schema )
export const validateWindow = ajv.compile( window_schema )
export const validateState = ajv.compile( state_schema )

function testFindTab( t ) {
  let state = getInitialState()
  let tab = findTab( state, state.windows[ 0 ].id, state.windows[ 0 ].tab_groups[ 0 ].tabs[ 0 ].id )
  t.end()
}

function testValidate( t ) {
  let state = getInitialState()
  t.equal( validateState( state ), true )
  t.end()
}

export default function( tap ) {
  tap.test( testFindTab )
  tap.test( testValidate )
  tap.end()
}
