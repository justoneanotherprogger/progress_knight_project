# Progress Knight Quest mod

A continuation of Progress Knight Quest from https://indomit.github.io/progress_knight_2/ . My vision of balance and names in this game.

## Localization

The game supports multiple languages. Translations are stored in `locales/` directory as YAML files.

### Supported Languages
- English (`en`)
- Russian (`ru`)

### Adding a New Language

1. Create a new YAML file in `locales/` (e.g., `locales/de.yaml` for German)
2. Copy the structure from `locales/en.yaml`
3. Translate all values
4. Add the language button to the Settings tab in `index.html`:
   ```html
   <button class="w3-button button lang-btn" data-lang="de" onclick="setLang('de')">Deutsch</button>
   ```
5. Run `python build.py` to regenerate `js/i18n.js`

### Building

```bash
pip install pyyaml jinja2
python build.py
```

This generates `js/i18n.js` with all locale data embedded.

### Deployment

The project deploys automatically to GitHub Pages on push to `main`. The workflow:
1. Runs `build.py` to generate `js/i18n.js`
2. Deploys the static files to GitHub Pages

## Development

- All translatable strings use `data-i18n="key"` attribute for content
- Use `data-i18n-placeholder="key"` for placeholder text
- The `t(key)` function returns the translation for the current language
- Language is saved to `localizr` and auto-detected from browser settings
