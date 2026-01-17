# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16.1.3 project using the App Router architecture with React 19, TypeScript, and Tailwind CSS v4. The project includes React Compiler (experimental) enabled in the Next.js configuration.

## Development Commands

- `npm run dev` - Start the development server (runs on http://localhost:3000)
- `npm run build` - Build the production application
- `npm start` - Start the production server (must run `build` first)

## Project Structure

- `src/app/` - App Router directory containing all routes and pages
  - `layout.tsx` - Root layout with font configuration (Geist Sans and Geist Mono)
  - `page.tsx` - Home page component
  - `globals.css` - Global CSS with Tailwind directives
- `public/` - Static assets served from the root
- TypeScript path alias `@/*` maps to `./src/*`

## Architecture Notes

### Next.js App Router

This project uses the App Router (not Pages Router). All routing happens through the `src/app/` directory structure.

### React Compiler

The project has React Compiler enabled (`reactCompiler: true` in next.config.ts). This is an experimental feature that optimizes React components automatically.

### Styling

- Shad cn ui

### TypeScript Configuration

- Strict mode enabled
- Module resolution: `bundler`
- JSX runtime: `react-jsx` (automatic JSX transform)
- Target: ES2017
