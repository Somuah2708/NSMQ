const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)

// resolveRequest intercepts module resolution before Metro looks in node_modules.
// This is required (extraNodeModules only fills gaps, it won't override existing packages).
// Shim Node.js-only packages that @supabase/* pulls in but don't exist in React Native:
//   ws               → global WebSocket (built into RN)
//   @supabase/node-fetch → global fetch (built into RN)
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'ws') {
    return { type: 'sourceFile', filePath: path.resolve(__dirname, 'ws-shim.js') }
  }
  if (moduleName === '@supabase/node-fetch') {
    return { type: 'sourceFile', filePath: path.resolve(__dirname, 'node-fetch-shim.js') }
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
