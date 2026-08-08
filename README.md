# Progress Knight Quest mod

A continuation of Progress Knight Quest from https://indomit.github.io/progress_knight_2/ . My vision of balance and names in this game.

## Localization

The game supports multiple languages. Translations are stored in `locales/` directory as YAML files.

### Supported Languages
- **English** (`en`) — default
- **Russian** (`ru`)

### Adding a New Language

1. Create a new YAML file in `locales/` (e.g., `locales/de.yaml` for German)
2. Copy the structure from `locales/en.yaml`
3. Translate all values
4. Add the language button to the Settings tab in `index.html`:
   ```html
   <button class="w3-button button lang-btn" data-lang="de" onclick="setLang('de')">Deutsch</button>
   ```
5. Run `python build.py` to regenerate `js/i18n.js`

### How It Works

- `build.py` reads all YAML files from `locales/` and generates `js/i18n.js`
- `js/i18n.js` contains all translations and provides `t(key)` function
- HTML elements use `data-i18n="key"` for text content and `data-i18n-placeholder="key"` for placeholders
- Language auto-detection from browser settings on first visit
- Language choice is saved to `localStorage`

## Development

### Prerequisites
- Python 3.8+
- pip

### Setup
```bash
pip install pyyaml jinja2
```

### Build
```bash
python build.py
```

### Local Server
```bash
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Deployment

The project deploys automatically to GitHub Pages on push to `main`. The GitHub Actions workflow:
1. Checks out the repository
2. Installs Python dependencies
3. Runs `build.py` to generate `js/i18n.js`
4. Deploys all static files to GitHub Pages

## Project Structure

```
progress_knight_project/
├── .github/workflows/deploy.yml    # GitHub Actions CI/CD
├── .gitignore                      # Git ignore rules
├── build.py                        # i18n build script
├── README.md                       # This file
├── index.html                      # Main HTML file with data-i18n attributes
├── locales/                        # Translation files
│   ├── en.yaml                     # English strings
│   └── ru.yaml                     # Russian strings
├── css/                            # Stylesheets
│   ├── styles.css                  # Main styles
│   ├── dark.css                    # Dark theme
│   ├── colorblind.css              # Color blind friendly theme
│   └── currencies.css              # Currency display styles
├── js/                             # JavaScript modules
│   ├── i18n.js                     # Generated localization module
│   ├── main.js                     # Main game logic
│   ├── ui.js                       # UI updates
│   ├── data.js                     # Game data
│   ├── classes.js                  # Game classes
│   ├── challenges.js               # Challenges logic
│   ├── dark_matter.js              # Dark Matter features
│   ├── metaverse.js                # Metaverse features
│   ├── milestones.js               # Milestones
│   ├── tooltips.js                 # Tooltip system
│   ├── math.js                     # Math utilities
│   ├── utils.js                    # Utility functions
│   └── HackTimer.js                # Timer optimization
└── img/                            # Images
    ├── logo.ico                    # Favicon
    ├── logos.png                   # Header logo
    └── discord_icon.png            # Discord icon
```

## License

This project is a fan mod of Progress Knight 2.0 by indomit.
