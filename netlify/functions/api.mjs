// Netlify Functions entry. Storage = Netlify Blobs (no setup needed).
import { handle } from "../../src/core.js";
import { netlifyStore } from "../../src/stores/netlify.js";

export default async (request) => handle(request, netlifyStore(), { env: process.env });

export const config = { path: "/api/*" };
