/**
 * Tailwind CSS v4 — custom configuration
 *
 * In Tailwind v4 the primary configuration lives in globals.css (@theme).
 * This file documents the Doggram design tokens for IDE reference.
 *
 * Colors are registered via CSS custom properties in src/app/globals.css
 * and exposed as Tailwind utilities (e.g. bg-doggram-orange, text-doggram-brown-dark).
 */
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
