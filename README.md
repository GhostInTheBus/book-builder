# Book Builder

A browser-based tool for laying out photobooks. Drag your photos onto pages, pick a layout, and export a print-ready PDF — all without leaving the browser.

![Book Builder interface showing two pages with photo layouts, a contact-sheet library at the bottom, and layout controls on the right](screenshot.svg)

---

## What it does

You load folders of photos from your computer. They show up as contact sheets at the bottom of the screen — one row per folder, scrolling sideways. Then you drag photos onto the pages in the middle.

Each page can have its own layout: full bleed, two columns, a photo with a caption, a grid of four, and so on. You can also design a spread — one image or layout that runs across both pages of an open book.

Once everything looks right, you hit **Export PDF** and it renders each page to a file you can send to a printer.

---

## Screenshot

The interface is split into four areas:

| Area | What's there |
|---|---|
| Left | Page list — click any spread to jump to it |
| Center | The open spread — navigate with arrows or the slider |
| Right | Controls — book size, page count, layout picker, export |
| Bottom | Photo library — one row per folder, drag thumbnails to slots |

---

## Features

- **Industry book sizes** — 8×8, 10×10, 11×8.5, 12×12 and more. Or type in your own dimensions.
- **14 layout presets** — full bleed, two-column, triptych, grid, photo+caption, text-only, and others.
- **Full-spread layouts** — designs that cross the gutter, treated as one canvas.
- **Custom freeform layout** — place image and text slots anywhere on the page by entering percentages.
- **Photo adjustment** — once a photo is on the page, click Adjust to drag it around and scroll to zoom in.
- **Typeable text slots** — click any text slot and just start typing.
- **Per-page independence** — left and right pages can have completely different layouts.
- **PDF export** — each page rendered to canvas at 150 DPI with correct cropping and zoom.
- **JSON export** — structured layout data for InDesign scripting.

---

## How to use it

1. Open the app in Chrome or Edge (requires File System Access API).
2. Click **+ Add Folder** in the library and pick a folder of photos. They load as thumbnails.
3. Use the arrows or slider to navigate to the page you want to work on.
4. Pick a layout from the right panel.
5. Drag a thumbnail from the bottom strip onto a slot on the page.
6. To adjust the crop, hover the photo and click **Adjust** — drag to pan, scroll to zoom, click **Done**.
7. Repeat for as many pages as you need.
8. Click **Export PDF** to download the book.

---

## Run it locally

```bash
cd phototable-src
npm install
npm run dev
```

Then open `http://localhost:5173`.

---

## Build and deploy

```bash
cd phototable-src
npm run build
# dist/ output goes to your web server
```

The app builds to a subfolder path (`/book-builder/`). If you change that, update `vite.config.ts`:

```ts
base: '/your-path/'
```

And add an nginx SPA fallback:

```nginx
location /book-builder/ {
  try_files $uri $uri/ /book-builder/index.html;
}
```

---

## Stack

- React 18 + TypeScript
- Zustand (state)
- Tailwind CSS
- Vite
- jsPDF + Canvas 2D (PDF export)

---

## Browser support

Works in **Chrome** and **Edge**. The folder picker uses the File System Access API which Safari and Firefox do not fully support yet.
