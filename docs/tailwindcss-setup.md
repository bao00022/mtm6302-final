[Back to Home](../note.md)

# tailwindcss setup step by step

1. Initialization

```bash
# initialize npm
npm init -y

# install tailwind package
npm install tailwindcss @tailwindcss/cli

# create basic files and folders
public/
public/css/input.css
public/images/
public/index.html
```

2. write tailwindcss config into ./public/css/input.css

```css
@import "tailwindcss";
```

3. create tailwind.config.js, tailwindcss will load this configuration automatically

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./public/**/*.html", // scan all HTML files
    "./public/js/**/*.js", // scan all JS files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

3. write start dev script to package.json

```json
{
  "scripts": {
    "dev": "npx @tailwindcss/cli -i ./public/css/input.css -o ./public/css/output.css --watch"
  }
}
```

4. start tailwindcli

```bash

npm run dev

```
