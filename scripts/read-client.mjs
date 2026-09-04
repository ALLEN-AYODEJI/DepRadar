#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const clientPath = path.resolve(__dirname, "../clients/read-client/dist/index.js");

try {
  const client = require(clientPath);
  if (typeof client.runCli === "function") {
    client.runCli();
  }
} catch (err) {
  console.error("Failed to run read client:", err);
  process.exit(1);
}
