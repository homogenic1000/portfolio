# Portfolio Project Structure

## 📁 Organized Folder Structure

```
portfolio/
├── index.html              # Main homepage
├── package.json            # NPM dependencies
├── package-lock.json       # NPM lock file
├── vite.config.js          # Vite configuration
├── README.md               # Project documentation
├── .gitignore              # Git ignore rules
│
├── 📁 assets/              # Images and media files
│   ├── Close.svg           # Close icon
│   ├── Open.svg            # Open icon
│   ├── matheo.jpeg         # Profile photo
│   └── mid.svg             # Mid icon
│
├── 📁 css/                 # All stylesheets
│   ├── style.css           # Main stylesheet
│   ├── reset.css           # CSS reset
│   ├── utility.css         # Utility classes
│   └── wiki-style.css      # Wikipedia-style page styles
│
├── 📁 js/                  # JavaScript files
│   ├── offest.js           # Main JavaScript functionality
│   └── index.js            # Additional JS functionality
│
├── 📁 font/                # Custom fonts
│   └── PinyonScript-Regular.ttf  # Pinyon Script font
│
└── 📁 pages/               # Additional HTML pages
    ├── about.html          # About/Wikipedia-style page
    ├── motion.html         # Motion design page
    ├── graphic.html        # Graphic design page
    ├── photo.html          # Photography page
    └── video.html          # Video page
```

## 🔗 Updated File Paths

### In index.html:
- CSS: `css/style.css`
- JS: `js/offest.js`
- Links: `pages/motion.html`

### In pages/*.html:
- CSS: `../css/style.css`
- Assets: `../assets/image.jpg`
- Fonts: `../font/font.ttf`

### In css/style.css:
- Assets: `../assets/image.svg`
- Fonts: `../font/font.ttf`

## ✅ Benefits of This Structure:

1. **Clean organization** - Each file type has its own folder
2. **Easy maintenance** - Files are logically grouped
3. **Scalable** - Easy to add new pages, styles, or scripts
4. **Professional** - Follows web development best practices
5. **Clear navigation** - Intuitive folder structure

## 🚀 How to Add New Files:

- **New page**: Add to `pages/` folder
- **New styles**: Add to `css/` folder
- **New scripts**: Add to `js/` folder
- **New images**: Add to `assets/` folder

Remember to update the relative paths when linking between files!
