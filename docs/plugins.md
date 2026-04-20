# Plugins in OpenClaude

OpenClaude supports a flexible plugin system that allows you to extend the CLI with new commands, agents, skills, and tools. Plugins can be installed from official marketplaces, third-party repositories, or directly from your local filesystem.

## Installing Plugins

### From Marketplace
By default, OpenClaude searchs the `claude-plugins-official` marketplace.
```bash
openclaude plugin install superpowers
```

### From Local Directory
You can install a plugin directly from a local path. This is especially useful for plugin development.
```bash
# From current directory
openclaude plugin install .

# From an absolute path
openclaude plugin install /path/to/your/plugin
```

## Plugin Structure
A plugin is a directory containing a `plugin.json` (or `.claude-plugin/plugin.json`) manifest and optional component directories.

### Manifest (`plugin.json`)
The manifest defines the plugin's identity and capabilities.

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A collection of helpful tools",
  "author": "Your Name",
  "commands": ["./custom-command.md"],
  "skills": ["./skills/"]
}
```

- **name**: Unique identifier (kebab-case).
- **version**: Semantic version.
- **author**: String or object.
- **commands**: List of markdown files or skill directories to expose as slash commands.
- **skills**: List of directories containing skill definitions.

### Components
- `commands/`: Markdown files defining slash commands.
- `agents/`: Markdown files defining custom agents.
- `skills/`: Subdirectories with `SKILL.md` files defining agent tools.
- `output-styles/`: Custom rendering styles.

## Management Commands
- `openclaude plugin list`: Show all installed plugins and their status.
- `openclaude plugin enable <plugin>`: Enable a plugin.
- `openclaude plugin disable <plugin>`: Disable a plugin without uninstalling.
- `openclaude plugin uninstall <plugin>`: Remove a plugin.

## Prototyping and Development
When developing a plugin, you can install it locally to test changes immediately. OpenClaude tracks local plugins via their absolute path, so you don't need to re-install after making edits to the plugin source.
