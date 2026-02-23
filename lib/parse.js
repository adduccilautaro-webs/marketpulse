// lib/parse.js
// Inicializa el cliente de Back4App (Parse SDK)

import Parse from 'parse/node'

let initialized = false

export function initParse() {
  if (initialized) return Parse

  Parse.initialize(
    process.env.BACK4APP_APP_ID,
    process.env.BACK4APP_JS_KEY,
    process.env.BACK4APP_MASTER_KEY
  )
  Parse.serverURL = process.env.BACK4APP_SERVER_URL || 'https://parseapi.back4app.com'
  initialized = true

  return Parse
}

export default Parse
