import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginsDir = path.join(__dirname, '../plugins');

export const plugins = new Map();

export const loadPlugins = async () => {
    if (!fs.existsSync(pluginsDir)) {
        fs.mkdirSync(pluginsDir);
    }

    const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
    for (const file of files) {
        try {
            const pluginPath = `../plugins/${file}`;
            const plugin = await import(`${pluginPath}?t=${Date.now()}`);
            if (plugin.default && plugin.default.command) {
                if (Array.isArray(plugin.default.command)) {
                    for (const cmd of plugin.default.command) {
                        plugins.set(cmd, plugin.default);
                    }
                } else {
                    plugins.set(plugin.default.command, plugin.default);
                }
                console.log(`Loaded plugin: ${file}`);
            }
        } catch (e) {
            console.error(`Error loading plugin ${file}:`, e);
        }
    }
};
