import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

export const plugins = new Map() 

export const loadPlugins = async () => {
    const pluginFolder = './plugins'
    if (!fs.existsSync(pluginFolder)) fs.mkdirSync(pluginFolder)
    const files = fs.readdirSync(pluginFolder)
    for (const file of files) {
        if (file.endsWith('.js')) {
            const filePath = pathToFileURL(path.resolve(pluginFolder, file)).href
            const plugin = await import(`${filePath}?update=${Date.now()}`)
            plugins.set(file, plugin.default)
        }
    }
}

export const getPlugin = (cmd) => {
    for (const [file, plugin] of plugins) {
        if (Array.isArray(plugin.cmd) && plugin.cmd.includes(cmd)) {
            return plugin
        }
    }
    return null
}