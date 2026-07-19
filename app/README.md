# PhotoTable

A digital light table for photographers, editors, and designers.

Drag your photos onto an infinite canvas, arrange them into sequences, group related shots, and export your edit order — all in the browser, all on your machine. Nothing is uploaded anywhere.

![PhotoTable screenshot](docs/screenshot.png)

---

## What it's for

- Sequencing a photo story or editorial
- Roughing out a layout or mood board
- Sorting selects before sending to a client
- Anything you'd normally do by spreading prints on a table

## Getting started

1. Open the app in Chrome (or any Chromium browser)
2. Click **+ Add Folder** in the sidebar and pick a folder of JPEGs
3. Drag photos onto the canvas
4. Arrange, resize, rotate — then **Export** when you're done

> Firefox works too. You won't get auto-refresh when files change on disk, but everything else is the same.

## Features

**Canvas**
- Infinite pan and zoom
- Drag photos from the sidebar to place them
- Drag photos directly from Finder / Explorer onto the canvas
- Resize from any corner
- Rotate freely — double-click a photo to snap back to straight
- Rubber-band select multiple photos at once

**Grouping**
- Select 2 or more photos → **Clump** to link them into a color-coded group
- Clumped photos move together and are labeled in the export

**Projects**
- Create multiple projects and switch between them
- Each project saves automatically — layouts persist when you close the tab

**Export**
- **Text** — a plain list of filenames in sequence, organized by clump. Paste it into Capture One, Lightroom, or send it to a client.
- **PDF** — a contact-sheet style layout of the current canvas

## Controls

| | |
|---|---|
| Pan | Middle-mouse drag · Space + drag |
| Zoom | Scroll wheel |
| Fit to screen | Double-click empty space |
| Add to selection | Shift + click |
| Select area | Drag on empty space |
| Resize photo | Drag any corner handle |
| Rotate reset | Double-click photo |
| Toggle filenames | `F` |
| Delete selected | `Delete` / `Backspace` |

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

---

Vibe-coded with [Claude Code](https://claude.ai/code).
