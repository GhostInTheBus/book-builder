# Busflicks Phototable Project

This document outlines the Busflicks Phototable project, its build process, and deployment.

## Project Overview
The `phototable` project is a frontend application, likely built with Vite (as indicated by `package.json`, `vite.config.ts`, `src`, `node_modules`, and `dist` directories in `phototable-src`). It serves content for `busflicks.com/phototable/`.

## Location
- **Source Code:** `/volume1/docker/busflicks/phototable-src`
- **Served Content:** `/volume1/docker/busflicks/html/phototable`

## Build and Deployment Process

1.  **Install Dependencies:**
    Run `npm install` in the `phototable-src` directory:
    ```bash
    npm install
    ```

2.  **Build Project:**
    Build the project for production. This compiles the source code and outputs static assets to the `dist` directory within `phototable-src`.
    ```bash
    npm run build
    ```

3.  **Deploy to Nginx Serving Directory:**
    The built assets from `phototable-src/dist` need to be copied to the Nginx serving directory (`html/phototable`).
    ```bash
    rm -rf /volume1/docker/busflicks/html/phototable/*
    cp -r /volume1/docker/busflicks/phototable-src/dist/* /volume1/docker/busflicks/html/phototable/
    ```

4.  **Restart Nginx Container:**
    After deploying new files, the Nginx container (`busflicks-landing`) needs to be restarted to ensure it serves the latest content.
    ```bash
    docker compose -f /volume1/docker/busflicks/docker-compose.yml restart busflicks-landing
    ```
    *(Note: As of April 24, 2026, there's an issue with the `docker` command not being found in the environment's PATH. This step is currently blocked until the `docker` command can be executed.)*

## Next Free Subnet
The next free subnet for new Docker services is `10.10.35.0/24`.
