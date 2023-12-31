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
    mode: 'directory', // -> with functionPerRoute: false also working!
    functionPerRoute: true,
    // functionPerRoute: true -> src/pages/posts/[slug].astro moved outside pages folder to prevent file size error Cloudflare
    // with src/pages/posts/[slug].astro -> the product content is also in /functions/slug.js ?!?!?!?!
    imageService: 'passthrough',
  })
});
