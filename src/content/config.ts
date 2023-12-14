// @ts-ignore
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { posts };

export const productCollection = defineCollection({
  type: 'content',
  schema: z
    .object({
      name: z.string(),
      brand: z.string(),
      feed_url: z.string().url(),
      price: z.number().gt(0),
      currency: z.string(),
      GTIN: z.union([z.string(), z.number()]).nullable(),
      external_image_url: z.string().optional(),
      supplier: z.string(),
      category: z.string(),
      short_description: z.string().nullable(),
      bullet_points: z.array(z.string()).nullable(),
      features: z
        .object({
          screen_diagonal_inches: z.string().optional(),
          screen_resolution: z.string().optional(),
          processor_family: z.string().optional(),
          memory_size: z.string().optional(),
          memory_type: z.string().optional(),
          total_storage_space: z.string().optional(),
          graphics_card: z.string().optional(),
          graphics_memory_size: z.string().optional(),
          operating_system: z.string().optional(),
          purpose_laptop: z.string().optional(),
        })
        .nullable(),
      delivery_time: z.string().nullable().optional(),
      changed: z.string().nullable().optional(),
      selection_group: z
        .object({
          processor: z.string().optional(),
          screen_diagonal: z.string().optional(),
          changed_price_past_3_days: z.boolean().optional(),
          productline: z.string().optional(),
        })
        .optional(),
      previous_price: z.number().optional().nullable(),
      historical_prices: z
        .array(
          z.object({
            date: z.string(),
            price: z.number().gt(0),
          }),
        )
        .nullable()
        .optional(),
      seo_header_title: z.string(),
      seo_meta_description: z.string(),
      seo_h1_title: z.string(),
      seo_short_description: z.string(),
      seo_long_description: z.string(),
    })
    .strict(),
});
