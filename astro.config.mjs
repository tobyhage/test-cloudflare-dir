import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
//import keystatic from '@keystatic/astro';

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), markdoc(),
    //keystatic()
  ],
  output: 'hybrid',
  prefetch: true,
  build: {
    format: 'file',
  },
  adapter: cloudflare({
    // mode: 'advanced' -> working!
    mode: 'directory',
    functionPerRoute: true,
    imageService: 'passthrough',
  })
});
