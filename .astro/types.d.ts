declare module 'astro:content' {
	interface Render {
		'.mdoc': Promise<{
			Content(props: Record<string, any>): import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
		}>;
	}
}

declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';

	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>,
				import('astro/zod').ZodLiteral<'avif'>,
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<[BaseSchemaWithoutEffects, ...BaseSchemaWithoutEffects[]]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<BaseSchemaWithoutEffects, BaseSchemaWithoutEffects>;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"posts": {
"first-post.mdoc": {
	id: "first-post.mdoc";
  slug: "first-post";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".mdoc"] };
"test.mdoc": {
	id: "test.mdoc";
  slug: "test";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".mdoc"] };
};
"product": {
"14-1920-x-1080-full-hd-intel-core-i5-1135g7-8-gb-ddr4-sdram-512-gb-ssd-intel-iris-xe-graphics-wlan-802-11-webcam-windows-11-home.md": {
	id: "14-1920-x-1080-full-hd-intel-core-i5-1135g7-8-gb-ddr4-sdram-512-gb-ssd-intel-iris-xe-graphics-wlan-802-11-webcam-windows-11-home.md";
  slug: "14-1920-x-1080-full-hd-intel-core-i5-1135g7-8-gb-ddr4-sdram-512-gb-ssd-intel-iris-xe-graphics-wlan-802-11-webcam-windows-11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"470-17-inch-g10-notebook-pc-17-3-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-fhd.md": {
	id: "470-17-inch-g10-notebook-pc-17-3-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-fhd.md";
  slug: "470-17-inch-g10-notebook-pc-17-3-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-fhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-apire-3-a317-54-50p6-laptop-17-3-inch.md": {
	id: "acer-apire-3-a317-54-50p6-laptop-17-3-inch.md";
  slug: "acer-apire-3-a317-54-50p6-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-14-a314-23p-r432-laptop-amd-ryzen-5-7520u-35-6-cm-fhd-ips-comfyview-16gb-lpddr5-sdram-512gb-pcie-nvme-ssd-amd-radeon-610m-wi-fi-6-ax-bt-windows-11-home-us-int-keyboard.md": {
	id: "acer-aspire-3-14-a314-23p-r432-laptop-amd-ryzen-5-7520u-35-6-cm-fhd-ips-comfyview-16gb-lpddr5-sdram-512gb-pcie-nvme-ssd-amd-radeon-610m-wi-fi-6-ax-bt-windows-11-home-us-int-keyboard.md";
  slug: "acer-aspire-3-14-a314-23p-r432-laptop-amd-ryzen-5-7520u-35-6-cm-fhd-ips-comfyview-16gb-lpddr5-sdram-512gb-pcie-nvme-ssd-amd-radeon-610m-wi-fi-6-ax-bt-windows-11-home-us-int-keyboard";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-15-a315-24p-r7gh.md": {
	id: "acer-aspire-3-15-a315-24p-r7gh.md";
  slug: "acer-aspire-3-15-a315-24p-r7gh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-17-3-f-hd-i5-1135g7-8gb-512gb-w11p.md": {
	id: "acer-aspire-3-17-3-f-hd-i5-1135g7-8gb-512gb-w11p.md";
  slug: "acer-aspire-3-17-3-f-hd-i5-1135g7-8gb-512gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a314-22-r3z0-notebook-35-6-cm-1920-x-1080-pixels-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-home-zwart.md": {
	id: "acer-aspire-3-a314-22-r3z0-notebook-35-6-cm-1920-x-1080-pixels-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-home-zwart.md";
  slug: "acer-aspire-3-a314-22-r3z0-notebook-35-6-cm-1920-x-1080-pixels-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-home-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a314-23p-r3jz.md": {
	id: "acer-aspire-3-a314-23p-r3jz.md";
  slug: "acer-aspire-3-a314-23p-r3jz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a314-23p-r44d.md": {
	id: "acer-aspire-3-a314-23p-r44d.md";
  slug: "acer-aspire-3-a314-23p-r44d";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a314-42p-r9bv.md": {
	id: "acer-aspire-3-a314-42p-r9bv.md";
  slug: "acer-aspire-3-a314-42p-r9bv";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-24p-r123.md": {
	id: "acer-aspire-3-a315-24p-r123.md";
  slug: "acer-aspire-3-a315-24p-r123";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-24p-r2zv-laptop-15-6-inch-azerty.md": {
	id: "acer-aspire-3-a315-24p-r2zv-laptop-15-6-inch-azerty.md";
  slug: "acer-aspire-3-a315-24p-r2zv-laptop-15-6-inch-azerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-24p-r3sa.md": {
	id: "acer-aspire-3-a315-24p-r3sa.md";
  slug: "acer-aspire-3-a315-24p-r3sa";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-44p-r45z.md": {
	id: "acer-aspire-3-a315-44p-r45z.md";
  slug: "acer-aspire-3-a315-44p-r45z";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-44p-r8b9-156-inch-amd-ryzen-7-16-gb-512-gb-1790920.md": {
	id: "acer-aspire-3-a315-44p-r8b9-156-inch-amd-ryzen-7-16-gb-512-gb-1790920.md";
  slug: "acer-aspire-3-a315-44p-r8b9-156-inch-amd-ryzen-7-16-gb-512-gb-1790920";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-56-50af-laptop-15-6-inch.md": {
	id: "acer-aspire-3-a315-56-50af-laptop-15-6-inch.md";
  slug: "acer-aspire-3-a315-56-50af-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-57g-547r-laptop-15-inch.md": {
	id: "acer-aspire-3-a315-57g-547r-laptop-15-inch.md";
  slug: "acer-aspire-3-a315-57g-547r-laptop-15-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-58-51uc.md": {
	id: "acer-aspire-3-a315-58-51uc.md";
  slug: "acer-aspire-3-a315-58-51uc";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-58-55v2-1715427.md": {
	id: "acer-aspire-3-a315-58-55v2-1715427.md";
  slug: "acer-aspire-3-a315-58-55v2-1715427";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-58-57f6-laptop-15-6-inch.md": {
	id: "acer-aspire-3-a315-58-57f6-laptop-15-6-inch.md";
  slug: "acer-aspire-3-a315-58-57f6-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-58-596k.md": {
	id: "acer-aspire-3-a315-58-596k.md";
  slug: "acer-aspire-3-a315-58-596k";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-58-74ba-intel-core-i7-1165g7-8gb-512gb-ssd-15-6-fhd-intel-iris-xe-graphics-windows-11-home-silver.md": {
	id: "acer-aspire-3-a315-58-74ba-intel-core-i7-1165g7-8gb-512gb-ssd-15-6-fhd-intel-iris-xe-graphics-windows-11-home-silver.md";
  slug: "acer-aspire-3-a315-58-74ba-intel-core-i7-1165g7-8gb-512gb-ssd-15-6-fhd-intel-iris-xe-graphics-windows-11-home-silver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-58-intel-core-i5-8gb-512gb-windows-11-pro-zilver.md": {
	id: "acer-aspire-3-a315-58-intel-core-i5-8gb-512gb-windows-11-pro-zilver.md";
  slug: "acer-aspire-3-a315-58-intel-core-i5-8gb-512gb-windows-11-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-58g-55pa-intel-core-i5-1135g7-15-6inch-16gb-512gb-ssd-mx350-2gb-w11h-pure-silver.md": {
	id: "acer-aspire-3-a315-58g-55pa-intel-core-i5-1135g7-15-6inch-16gb-512gb-ssd-mx350-2gb-w11h-pure-silver.md";
  slug: "acer-aspire-3-a315-58g-55pa-intel-core-i5-1135g7-15-6inch-16gb-512gb-ssd-mx350-2gb-w11h-pure-silver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-59-55hc-156-inch-intel-core-i5-8-gb-512-gb-1795354.md": {
	id: "acer-aspire-3-a315-59-55hc-156-inch-intel-core-i5-8-gb-512-gb-1795354.md";
  slug: "acer-aspire-3-a315-59-55hc-156-inch-intel-core-i5-8-gb-512-gb-1795354";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-59-55yk-i5-16-gb-512-gb-15-6.md": {
	id: "acer-aspire-3-a315-59-55yk-i5-16-gb-512-gb-15-6.md";
  slug: "acer-aspire-3-a315-59-55yk-i5-16-gb-512-gb-15-6";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-59-55yk.md": {
	id: "acer-aspire-3-a315-59-55yk.md";
  slug: "acer-aspire-3-a315-59-55yk";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-59-59ur-156-inch-intel-core-i5-16-gb-512-gb-1770703.md": {
	id: "acer-aspire-3-a315-59-59ur-156-inch-intel-core-i5-16-gb-512-gb-1770703.md";
  slug: "acer-aspire-3-a315-59-59ur-156-inch-intel-core-i5-16-gb-512-gb-1770703";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-59-72za.md": {
	id: "acer-aspire-3-a315-59-72za.md";
  slug: "acer-aspire-3-a315-59-72za";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-59-76jz-laptop-15-6-inch.md": {
	id: "acer-aspire-3-a315-59-76jz-laptop-15-6-inch.md";
  slug: "acer-aspire-3-a315-59-76jz-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a315-59g-55ql.md": {
	id: "acer-aspire-3-a315-59g-55ql.md";
  slug: "acer-aspire-3-a315-59g-55ql";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a317-53-52xa.md": {
	id: "acer-aspire-3-a317-53-52xa.md";
  slug: "acer-aspire-3-a317-53-52xa";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a317-53-545d.md": {
	id: "acer-aspire-3-a317-53-545d.md";
  slug: "acer-aspire-3-a317-53-545d";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a317-53-58qa-laptop-17-inch.md": {
	id: "acer-aspire-3-a317-53-58qa-laptop-17-inch.md";
  slug: "acer-aspire-3-a317-53-58qa-laptop-17-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a317-54-51s4.md": {
	id: "acer-aspire-3-a317-54-51s4.md";
  slug: "acer-aspire-3-a317-54-51s4";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a317-54-56uh-17-fhd-i5-1235u-16gb-512gb-w11.md": {
	id: "acer-aspire-3-a317-54-56uh-17-fhd-i5-1235u-16gb-512gb-w11.md";
  slug: "acer-aspire-3-a317-54-56uh-17-fhd-i5-1235u-16gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a317-54-5986.md": {
	id: "acer-aspire-3-a317-54-5986.md";
  slug: "acer-aspire-3-a317-54-5986";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3-a317-54-74xm.md": {
	id: "acer-aspire-3-a317-54-74xm.md";
  slug: "acer-aspire-3-a317-54-74xm";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-3.md": {
	id: "acer-aspire-3.md";
  slug: "acer-aspire-3";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-14-a514-56m-555l.md": {
	id: "acer-aspire-5-14-a514-56m-555l.md";
  slug: "acer-aspire-5-14-a514-56m-555l";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-14-a514-56m-799y-14-inch-intel-core-i7-16-gb-512-gb-1768633.md": {
	id: "acer-aspire-5-14-a514-56m-799y-14-inch-intel-core-i7-16-gb-512-gb-1768633.md";
  slug: "acer-aspire-5-14-a514-56m-799y-14-inch-intel-core-i7-16-gb-512-gb-1768633";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-14-a514-56p-5585-14-inch-intel-core-i5-1335u-16-gb-ddr5-512-gb-1761559.md": {
	id: "acer-aspire-5-14-a514-56p-5585-14-inch-intel-core-i5-1335u-16-gb-ddr5-512-gb-1761559.md";
  slug: "acer-aspire-5-14-a514-56p-5585-14-inch-intel-core-i5-1335u-16-gb-ddr5-512-gb-1761559";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-14.md": {
	id: "acer-aspire-5-14.md";
  slug: "acer-aspire-5-14";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-15-a515-48m-r5vm-laptop-15-6-inch.md": {
	id: "acer-aspire-5-15-a515-48m-r5vm-laptop-15-6-inch.md";
  slug: "acer-aspire-5-15-a515-48m-r5vm-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-15-a515-58m-77dk-156-inch-intel-core-i7-16-gb-1-tb-1768639.md": {
	id: "acer-aspire-5-15-a515-58m-77dk-156-inch-intel-core-i7-16-gb-1-tb-1768639.md";
  slug: "acer-aspire-5-15-a515-58m-77dk-156-inch-intel-core-i7-16-gb-1-tb-1768639";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-15-a515-58m-79pz-156-inch-intel-core-i7-1355u-32gb-1-tb-intel-iris-xe-graphics-1761563.md": {
	id: "acer-aspire-5-15-a515-58m-79pz-156-inch-intel-core-i7-1355u-32gb-1-tb-intel-iris-xe-graphics-1761563.md";
  slug: "acer-aspire-5-15-a515-58m-79pz-156-inch-intel-core-i7-1355u-32gb-1-tb-intel-iris-xe-graphics-1761563";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a514-54-51bb-laptop.md": {
	id: "acer-aspire-5-a514-54-51bb-laptop.md";
  slug: "acer-aspire-5-a514-54-51bb-laptop";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a514-54-54xv-laptop-14-inch.md": {
	id: "acer-aspire-5-a514-54-54xv-laptop-14-inch.md";
  slug: "acer-aspire-5-a514-54-54xv-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a514-56m-599y.md": {
	id: "acer-aspire-5-a514-56m-599y.md";
  slug: "acer-aspire-5-a514-56m-599y";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a514-56p-52wx.md": {
	id: "acer-aspire-5-a514-56p-52wx.md";
  slug: "acer-aspire-5-a514-56p-52wx";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a514-56p-73s2.md": {
	id: "acer-aspire-5-a514-56p-73s2.md";
  slug: "acer-aspire-5-a514-56p-73s2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-44-r7fz-laptop-15-6-inch-ryzen-5-4500-8gb-ddr4-512gb-ssd-vega-6-windows-10.md": {
	id: "acer-aspire-5-a515-44-r7fz-laptop-15-6-inch-ryzen-5-4500-8gb-ddr4-512gb-ssd-vega-6-windows-10.md";
  slug: "acer-aspire-5-a515-44-r7fz-laptop-15-6-inch-ryzen-5-4500-8gb-ddr4-512gb-ssd-vega-6-windows-10";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-45-r2hj-r5-16gb-1tb-15-6-w11h.md": {
	id: "acer-aspire-5-a515-45-r2hj-r5-16gb-1tb-15-6-w11h.md";
  slug: "acer-aspire-5-a515-45-r2hj-r5-16gb-1tb-15-6-w11h";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-45-r7d6-r7-5700u-16-1tb.md": {
	id: "acer-aspire-5-a515-45-r7d6-r7-5700u-16-1tb.md";
  slug: "acer-aspire-5-a515-45-r7d6-r7-5700u-16-1tb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-45g-r2rq-15-6-zilver-r7-16gb-512gb-w11.md": {
	id: "acer-aspire-5-a515-45g-r2rq-15-6-zilver-r7-16gb-512gb-w11.md";
  slug: "acer-aspire-5-a515-45g-r2rq-15-6-zilver-r7-16gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-45g-r668-1742890.md": {
	id: "acer-aspire-5-a515-45g-r668-1742890.md";
  slug: "acer-aspire-5-a515-45g-r668-1742890";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-47-r50h-laptop-15-6-inch.md": {
	id: "acer-aspire-5-a515-47-r50h-laptop-15-6-inch.md";
  slug: "acer-aspire-5-a515-47-r50h-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-47-r87w-15-fhd-r7-5825u-32gb-1tb.md": {
	id: "acer-aspire-5-a515-47-r87w-15-fhd-r7-5825u-32gb-1tb.md";
  slug: "acer-aspire-5-a515-47-r87w-15-fhd-r7-5825u-32gb-1tb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-56-57dm-notebook-39-6-cm-1920-x-1080-pixels-intel-11de-generatie-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-home-zwart.md": {
	id: "acer-aspire-5-a515-56-57dm-notebook-39-6-cm-1920-x-1080-pixels-intel-11de-generatie-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-home-zwart.md";
  slug: "acer-aspire-5-a515-56-57dm-notebook-39-6-cm-1920-x-1080-pixels-intel-11de-generatie-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-home-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-57-56rg-156-inch-intel-core-i5-16-gb-512-gb-1768637.md": {
	id: "acer-aspire-5-a515-57-56rg-156-inch-intel-core-i5-16-gb-512-gb-1768637.md";
  slug: "acer-aspire-5-a515-57-56rg-156-inch-intel-core-i5-16-gb-512-gb-1768637";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-57-56rg-laptop.md": {
	id: "acer-aspire-5-a515-57-56rg-laptop.md";
  slug: "acer-aspire-5-a515-57-56rg-laptop";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-57-56rg.md": {
	id: "acer-aspire-5-a515-57-56rg.md";
  slug: "acer-aspire-5-a515-57-56rg";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-57-594t-156-inch-intel-core-i5-16-gb-512-gb-1790535.md": {
	id: "acer-aspire-5-a515-57-594t-156-inch-intel-core-i5-16-gb-512-gb-1790535.md";
  slug: "acer-aspire-5-a515-57-594t-156-inch-intel-core-i5-16-gb-512-gb-1790535";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-57-70c0-laptop-15-6-inch.md": {
	id: "acer-aspire-5-a515-57-70c0-laptop-15-6-inch.md";
  slug: "acer-aspire-5-a515-57-70c0-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-57-750w.md": {
	id: "acer-aspire-5-a515-57-750w.md";
  slug: "acer-aspire-5-a515-57-750w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-57-795a.md": {
	id: "acer-aspire-5-a515-57-795a.md";
  slug: "acer-aspire-5-a515-57-795a";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-57g-583f-1743717.md": {
	id: "acer-aspire-5-a515-57g-583f-1743717.md";
  slug: "acer-aspire-5-a515-57g-583f-1743717";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-57g-589u-15-fhd-i5-1235u-16gb-512gb-2050-w11.md": {
	id: "acer-aspire-5-a515-57g-589u-15-fhd-i5-1235u-16gb-512gb-2050-w11.md";
  slug: "acer-aspire-5-a515-57g-589u-15-fhd-i5-1235u-16gb-512gb-2050-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-57g-589u-156-inch-intel-core-i5-16-gb-512-gb-geforce-rtx-2050-1768638.md": {
	id: "acer-aspire-5-a515-57g-589u-156-inch-intel-core-i5-16-gb-512-gb-geforce-rtx-2050-1768638.md";
  slug: "acer-aspire-5-a515-57g-589u-156-inch-intel-core-i5-16-gb-512-gb-geforce-rtx-2050-1768638";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-57g-72r5.md": {
	id: "acer-aspire-5-a515-57g-72r5.md";
  slug: "acer-aspire-5-a515-57g-72r5";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-57g-76lh-15-fhd-i7-1255u-32gb-2050-1tb.md": {
	id: "acer-aspire-5-a515-57g-76lh-15-fhd-i7-1255u-32gb-2050-1tb.md";
  slug: "acer-aspire-5-a515-57g-76lh-15-fhd-i7-1255u-32gb-2050-1tb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-58m-500c.md": {
	id: "acer-aspire-5-a515-58m-500c.md";
  slug: "acer-aspire-5-a515-58m-500c";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a515-58m-77fx.md": {
	id: "acer-aspire-5-a515-58m-77fx.md";
  slug: "acer-aspire-5-a515-58m-77fx";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a517-52-522a-laptop-17-inch.md": {
	id: "acer-aspire-5-a517-52-522a-laptop-17-inch.md";
  slug: "acer-aspire-5-a517-52-522a-laptop-17-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a517-53-54fj-i5-16gb-512gb-17-3.md": {
	id: "acer-aspire-5-a517-53-54fj-i5-16gb-512gb-17-3.md";
  slug: "acer-aspire-5-a517-53-54fj-i5-16gb-512gb-17-3";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a517-53-7385-173-inch-intel-core-i7-16-gb-512-gb-1770704.md": {
	id: "acer-aspire-5-a517-53-7385-173-inch-intel-core-i7-16-gb-512-gb-1770704.md";
  slug: "acer-aspire-5-a517-53-7385-173-inch-intel-core-i7-16-gb-512-gb-1770704";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a517-53-79sg.md": {
	id: "acer-aspire-5-a517-53-79sg.md";
  slug: "acer-aspire-5-a517-53-79sg";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-a517-53g-76bu.md": {
	id: "acer-aspire-5-a517-53g-76bu.md";
  slug: "acer-aspire-5-a517-53g-76bu";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-nx-aadeh-00e-17-3-i5-1135g7-16gb-512gb-windows-11.md": {
	id: "acer-aspire-5-nx-aadeh-00e-17-3-i5-1135g7-16gb-512gb-windows-11.md";
  slug: "acer-aspire-5-nx-aadeh-00e-17-3-i5-1135g7-16gb-512gb-windows-11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-pro-a517-52g-52w4.md": {
	id: "acer-aspire-5-pro-a517-52g-52w4.md";
  slug: "acer-aspire-5-pro-a517-52g-52w4";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-pro-a517-53-57j8.md": {
	id: "acer-aspire-5-pro-a517-53-57j8.md";
  slug: "acer-aspire-5-pro-a517-53-57j8";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-pro-a517-53g-50wb-qwerty.md": {
	id: "acer-aspire-5-pro-a517-53g-50wb-qwerty.md";
  slug: "acer-aspire-5-pro-a517-53g-50wb-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-5-pro-a517-53g-50wb.md": {
	id: "acer-aspire-5-pro-a517-53g-50wb.md";
  slug: "acer-aspire-5-pro-a517-53g-50wb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-7-a715-42g-r2ll-creator-laptop-15-6-inch.md": {
	id: "acer-aspire-7-a715-42g-r2ll-creator-laptop-15-6-inch.md";
  slug: "acer-aspire-7-a715-42g-r2ll-creator-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-7-a715-42g-r9na-1734633.md": {
	id: "acer-aspire-7-a715-42g-r9na-1734633.md";
  slug: "acer-aspire-7-a715-42g-r9na-1734633";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-7-a715-51g-5251-1723286.md": {
	id: "acer-aspire-7-a715-51g-5251-1723286.md";
  slug: "acer-aspire-7-a715-51g-5251-1723286";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-7-a715-51g-5251.md": {
	id: "acer-aspire-7-a715-51g-5251.md";
  slug: "acer-aspire-7-a715-51g-5251";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-7-a715-51g-74wp.md": {
	id: "acer-aspire-7-a715-51g-74wp.md";
  slug: "acer-aspire-7-a715-51g-74wp";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-7-a715-51g-75yr-1723287.md": {
	id: "acer-aspire-7-a715-51g-75yr-1723287.md";
  slug: "acer-aspire-7-a715-51g-75yr-1723287";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-7-a715-75g-549p-15-inch-laptop.md": {
	id: "acer-aspire-7-a715-75g-549p-15-inch-laptop.md";
  slug: "acer-aspire-7-a715-75g-549p-15-inch-laptop";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-7-a715-75g-56hr-creator-laptop-15-6-inch.md": {
	id: "acer-aspire-7-a715-75g-56hr-creator-laptop-15-6-inch.md";
  slug: "acer-aspire-7-a715-75g-56hr-creator-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-7-a715-75g-59vh-15-6-full-hd-i5-9300h-16gb-ddr4-512gb-m-2-ssd-nvidia-geforce-gtx-1650-windows-10.md": {
	id: "acer-aspire-7-a715-75g-59vh-15-6-full-hd-i5-9300h-16gb-ddr4-512gb-m-2-ssd-nvidia-geforce-gtx-1650-windows-10.md";
  slug: "acer-aspire-7-a715-75g-59vh-15-6-full-hd-i5-9300h-16gb-ddr4-512gb-m-2-ssd-nvidia-geforce-gtx-1650-windows-10";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-7-a715-76g-53fn.md": {
	id: "acer-aspire-7-a715-76g-53fn.md";
  slug: "acer-aspire-7-a715-76g-53fn";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-7-a715-76g-5939-creator-laptop-15-inch.md": {
	id: "acer-aspire-7-a715-76g-5939-creator-laptop-15-inch.md";
  slug: "acer-aspire-7-a715-76g-5939-creator-laptop-15-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-7-amd-ryzen-7-5700u-16gb-ddr4-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-lcd-amd-radeon-graphics-nvidia-geforce-gtx-1650-wlan-webcam-windows-11-home-64-bit.md": {
	id: "acer-aspire-7-amd-ryzen-7-5700u-16gb-ddr4-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-lcd-amd-radeon-graphics-nvidia-geforce-gtx-1650-wlan-webcam-windows-11-home-64-bit.md";
  slug: "acer-aspire-7-amd-ryzen-7-5700u-16gb-ddr4-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-lcd-amd-radeon-graphics-nvidia-geforce-gtx-1650-wlan-webcam-windows-11-home-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-nx-hzweh-00s-qwerty.md": {
	id: "acer-aspire-nx-hzweh-00s-qwerty.md";
  slug: "acer-aspire-nx-hzweh-00s-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-vero-av14-51-52gy-evo-14-inch-intel-core-i5-16-gb-512-gb-intel-iris-xe-graphics-1753591.md": {
	id: "acer-aspire-vero-av14-51-52gy-evo-14-inch-intel-core-i5-16-gb-512-gb-intel-iris-xe-graphics-1753591.md";
  slug: "acer-aspire-vero-av14-51-52gy-evo-14-inch-intel-core-i5-16-gb-512-gb-intel-iris-xe-graphics-1753591";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-vero-av15-51-574g-laptop-15-6-inch.md": {
	id: "acer-aspire-vero-av15-51-574g-laptop-15-6-inch.md";
  slug: "acer-aspire-vero-av15-51-574g-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-vero-av15-51-574g.md": {
	id: "acer-aspire-vero-av15-51-574g.md";
  slug: "acer-aspire-vero-av15-51-574g";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-vero-av15-51-7739-laptop-15-6-inch.md": {
	id: "acer-aspire-vero-av15-51-7739-laptop-15-6-inch.md";
  slug: "acer-aspire-vero-av15-51-7739-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-vero-av15-52-54d7-15-fhd-i5-1235u-16gb-512gb-eco-w11-grijs.md": {
	id: "acer-aspire-vero-av15-52-54d7-15-fhd-i5-1235u-16gb-512gb-eco-w11-grijs.md";
  slug: "acer-aspire-vero-av15-52-54d7-15-fhd-i5-1235u-16gb-512gb-eco-w11-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-vero-av15-52-71a3-15-fhd-i7-1255u-16gb-512gb-eco-w11-grijs.md": {
	id: "acer-aspire-vero-av15-52-71a3-15-fhd-i7-1255u-16gb-512gb-eco-w11-grijs.md";
  slug: "acer-aspire-vero-av15-52-71a3-15-fhd-i7-1255u-16gb-512gb-eco-w11-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-aspire-vero-av15-52-71a3-evo.md": {
	id: "acer-aspire-vero-av15-52-71a3-evo.md";
  slug: "acer-aspire-vero-av15-52-71a3-evo";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-chromebook-514-cb514-1w-50cm.md": {
	id: "acer-chromebook-514-cb514-1w-50cm.md";
  slug: "acer-chromebook-514-cb514-1w-50cm";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-chromebook-516-ge-cbg516-1h-560s-16-inch-120-hz-intel-core-i5-8-gb-128-gb-1764654.md": {
	id: "acer-chromebook-516-ge-cbg516-1h-560s-16-inch-120-hz-intel-core-i5-8-gb-128-gb-1764654.md";
  slug: "acer-chromebook-516-ge-cbg516-1h-560s-16-inch-120-hz-intel-core-i5-8-gb-128-gb-1764654";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-chromebook-516-ge-cbg516-1h-560s.md": {
	id: "acer-chromebook-516-ge-cbg516-1h-560s.md";
  slug: "acer-chromebook-516-ge-cbg516-1h-560s";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-chromebook-516-ge-cbg516-1h-70tm-gaming-chromebook-16-inch-120-hz.md": {
	id: "acer-chromebook-516-ge-cbg516-1h-70tm-gaming-chromebook-16-inch-120-hz.md";
  slug: "acer-chromebook-516-ge-cbg516-1h-70tm-gaming-chromebook-16-inch-120-hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-chromebook-516-ge.md": {
	id: "acer-chromebook-516-ge.md";
  slug: "acer-chromebook-516-ge";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-chromebook-cb315-4h-c92y.md": {
	id: "acer-chromebook-cb315-4h-c92y.md";
  slug: "acer-chromebook-cb315-4h-c92y";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-chromebook-plus-515-cb515-2ht-5789-15-6-inch-touchscreen.md": {
	id: "acer-chromebook-plus-515-cb515-2ht-5789-15-6-inch-touchscreen.md";
  slug: "acer-chromebook-plus-515-cb515-2ht-5789-15-6-inch-touchscreen";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-chromebook-plus-515-cb515-2ht-5789.md": {
	id: "acer-chromebook-plus-515-cb515-2ht-5789.md";
  slug: "acer-chromebook-plus-515-cb515-2ht-5789";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-chromebook-vero-514-cbv514-1h-52pp-14-inch.md": {
	id: "acer-chromebook-vero-514-cbv514-1h-52pp-14-inch.md";
  slug: "acer-chromebook-vero-514-cbv514-1h-52pp-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-enduro-urban-n3-eun314la-51w-52k5-laptop-14-inch.md": {
	id: "acer-enduro-urban-n3-eun314la-51w-52k5-laptop-14-inch.md";
  slug: "acer-enduro-urban-n3-eun314la-51w-52k5-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-enduro-urban-n3-lite-eun314la-51w-52k5.md": {
	id: "acer-enduro-urban-n3-lite-eun314la-51w-52k5.md";
  slug: "acer-enduro-urban-n3-lite-eun314la-51w-52k5";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-laptop-aspire-5-a515-56-5393-core-i5-16gb-ram-512gb-ssd.md": {
	id: "acer-laptop-aspire-5-a515-56-5393-core-i5-16gb-ram-512gb-ssd.md";
  slug: "acer-laptop-aspire-5-a515-56-5393-core-i5-16gb-ram-512gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-laptop-aspire-5-a515-57-540g-15-6-inch-16-gb.md": {
	id: "acer-laptop-aspire-5-a515-57-540g-15-6-inch-16-gb.md";
  slug: "acer-laptop-aspire-5-a515-57-540g-15-6-inch-16-gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-laptop-aspire-5-a515-58m-56dl-grijs-15-6-inch.md": {
	id: "acer-laptop-aspire-5-a515-58m-56dl-grijs-15-6-inch.md";
  slug: "acer-laptop-aspire-5-a515-58m-56dl-grijs-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-laptop-aspire-5-a517-53-7385-17-3-inch.md": {
	id: "acer-laptop-aspire-5-a517-53-7385-17-3-inch.md";
  slug: "acer-laptop-aspire-5-a517-53-7385-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-laptop-swift-go-intel-core-i5-512-gb.md": {
	id: "acer-laptop-swift-go-intel-core-i5-512-gb.md";
  slug: "acer-laptop-swift-go-intel-core-i5-512-gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-laptop-swift-x-sfx14-41g-r75h.md": {
	id: "acer-laptop-swift-x-sfx14-41g-r75h.md";
  slug: "acer-laptop-swift-x-sfx14-41g-r75h";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-nb-aspire-5-a514-53-79u2-14-fhd-i7-1065g7-8gb-512gb-w10.md": {
	id: "acer-nb-aspire-5-a514-53-79u2-14-fhd-i7-1065g7-8gb-512gb-w10.md";
  slug: "acer-nb-aspire-5-a514-53-79u2-14-fhd-i7-1065g7-8gb-512gb-w10";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-nb-aspire-5-pro-a517-53-57j8-17-fhd-i5-1235u-16gb-512gb-w11p.md": {
	id: "acer-nb-aspire-5-pro-a517-53-57j8-17-fhd-i5-1235u-16gb-512gb-w11p.md";
  slug: "acer-nb-aspire-5-pro-a517-53-57j8-17-fhd-i5-1235u-16gb-512gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-nb-p4-tmp416-51-59t4-16-i5-1235u-8gb-512gb-w11-pro-slate-blue.md": {
	id: "acer-nb-p4-tmp416-51-59t4-16-i5-1235u-8gb-512gb-w11-pro-slate-blue.md";
  slug: "acer-nb-p4-tmp416-51-59t4-16-i5-1235u-8gb-512gb-w11-pro-slate-blue";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-sf314-71-713f-14-touch-i7-12650h-16gb-1tbssd-irisxe-w11.md": {
	id: "acer-sf314-71-713f-14-touch-i7-12650h-16gb-1tbssd-irisxe-w11.md";
  slug: "acer-sf314-71-713f-14-touch-i7-12650h-16gb-1tbssd-irisxe-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-spin-3-sp314-21-r92e-2-in-1-laptop-14-inch.md": {
	id: "acer-spin-3-sp314-21-r92e-2-in-1-laptop-14-inch.md";
  slug: "acer-spin-3-sp314-21-r92e-2-in-1-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-spin-3-sp314-54n-52v7-pure-silver-laptop.md": {
	id: "acer-spin-3-sp314-54n-52v7-pure-silver-laptop.md";
  slug: "acer-spin-3-sp314-54n-52v7-pure-silver-laptop";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-spin-5-sp14-51mtn-53p0.md": {
	id: "acer-spin-5-sp14-51mtn-53p0.md";
  slug: "acer-spin-5-sp14-51mtn-53p0";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-spin-5-sp14-51mtn-76j4.md": {
	id: "acer-spin-5-sp14-51mtn-76j4.md";
  slug: "acer-spin-5-sp14-51mtn-76j4";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-14-sf14-71t-786z.md": {
	id: "acer-swift-14-sf14-71t-786z.md";
  slug: "acer-swift-14-sf14-71t-786z";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-3-laptop-14-inch-fhd-ips-led-lcd-ryzen-7-4700u-8gb-ram-512gb-ssd-windows-11-zeer-krachtig-en-snel.md": {
	id: "acer-swift-3-laptop-14-inch-fhd-ips-led-lcd-ryzen-7-4700u-8gb-ram-512gb-ssd-windows-11-zeer-krachtig-en-snel.md";
  slug: "acer-swift-3-laptop-14-inch-fhd-ips-led-lcd-ryzen-7-4700u-8gb-ram-512gb-ssd-windows-11-zeer-krachtig-en-snel";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-3-sf314-43-r68z.md": {
	id: "acer-swift-3-sf314-43-r68z.md";
  slug: "acer-swift-3-sf314-43-r68z";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-3-sf314-511-73nr.md": {
	id: "acer-swift-3-sf314-511-73nr.md";
  slug: "acer-swift-3-sf314-511-73nr";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-3-sf314-71-59fh-1743714.md": {
	id: "acer-swift-3-sf314-71-59fh-1743714.md";
  slug: "acer-swift-3-sf314-71-59fh-1743714";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-3-sf314-71-59fh-grijs.md": {
	id: "acer-swift-3-sf314-71-59fh-grijs.md";
  slug: "acer-swift-3-sf314-71-59fh-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-3-sf316-51-779l-laptop.md": {
	id: "acer-swift-3-sf316-51-779l-laptop.md";
  slug: "acer-swift-3-sf316-51-779l-laptop";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-3-ultradraagbare-laptop-14-inch-amd-ryzen-7-16gb-ram.md": {
	id: "acer-swift-3-ultradraagbare-laptop-14-inch-amd-ryzen-7-16gb-ram.md";
  slug: "acer-swift-3-ultradraagbare-laptop-14-inch-amd-ryzen-7-16gb-ram";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-5-azerty.md": {
	id: "acer-swift-5-azerty.md";
  slug: "acer-swift-5-azerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-5-sf514-56t-50dt-14-touch-i5-1240p-16gb-512gb-w11.md": {
	id: "acer-swift-5-sf514-56t-50dt-14-touch-i5-1240p-16gb-512gb-w11.md";
  slug: "acer-swift-5-sf514-56t-50dt-14-touch-i5-1240p-16gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-5-sf514-56t-50dt-evo-1743712.md": {
	id: "acer-swift-5-sf514-56t-50dt-evo-1743712.md";
  slug: "acer-swift-5-sf514-56t-50dt-evo-1743712";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-5-sf514-56t-76fq-14-touch-i7-1260p-16gb-1tb-w11.md": {
	id: "acer-swift-5-sf514-56t-76fq-14-touch-i7-1260p-16gb-1tb-w11.md";
  slug: "acer-swift-5-sf514-56t-76fq-14-touch-i7-1260p-16gb-1tb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-5-sf514-56t-76fq-evo-1743713.md": {
	id: "acer-swift-5-sf514-56t-76fq-evo-1743713.md";
  slug: "acer-swift-5-sf514-56t-76fq-evo-1743713";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-5-sf514-56t-77vr-14-i7-1260p-16gb-512gb-windows-11-pro.md": {
	id: "acer-swift-5-sf514-56t-77vr-14-i7-1260p-16gb-512gb-windows-11-pro.md";
  slug: "acer-swift-5-sf514-56t-77vr-14-i7-1260p-16gb-512gb-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-edge-16-sfe16-42-r6e0-16-r5-7535u-16gb-512gb-660m-w11.md": {
	id: "acer-swift-edge-16-sfe16-42-r6e0-16-r5-7535u-16gb-512gb-660m-w11.md";
  slug: "acer-swift-edge-16-sfe16-42-r6e0-16-r5-7535u-16gb-512gb-660m-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-edge-16-sfe16-43-r2he-r7-7840u-32-1tb-16-oled-3-2k-120hz.md": {
	id: "acer-swift-edge-16-sfe16-43-r2he-r7-7840u-32-1tb-16-oled-3-2k-120hz.md";
  slug: "acer-swift-edge-16-sfe16-43-r2he-r7-7840u-32-1tb-16-oled-3-2k-120hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-edge-sfa16-41-r32m-glacier-blue-40-6-cm-wquxga-16gb-lpddr5-sdram-512gb-pcie-nvme-sed-ssd-amd-radeon-660m-wi-fi-6e-ax-windows-11-home-backlit-us-int-keyboard.md": {
	id: "acer-swift-edge-sfa16-41-r32m-glacier-blue-40-6-cm-wquxga-16gb-lpddr5-sdram-512gb-pcie-nvme-sed-ssd-amd-radeon-660m-wi-fi-6e-ax-windows-11-home-backlit-us-int-keyboard.md";
  slug: "acer-swift-edge-sfa16-41-r32m-glacier-blue-40-6-cm-wquxga-16gb-lpddr5-sdram-512gb-pcie-nvme-sed-ssd-amd-radeon-660m-wi-fi-6e-ax-windows-11-home-backlit-us-int-keyboard";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-edge-sfa16-41-r5ke-16-inch-amd-ryzen-5-16-gb-512-gb-1769643.md": {
	id: "acer-swift-edge-sfa16-41-r5ke-16-inch-amd-ryzen-5-16-gb-512-gb-1769643.md";
  slug: "acer-swift-edge-sfa16-41-r5ke-16-inch-amd-ryzen-5-16-gb-512-gb-1769643";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-edge-sfa16-41-r5ke-ryzen-5-16gb-1tb-16-oled-scherm.md": {
	id: "acer-swift-edge-sfa16-41-r5ke-ryzen-5-16gb-1tb-16-oled-scherm.md";
  slug: "acer-swift-edge-sfa16-41-r5ke-ryzen-5-16gb-1tb-16-oled-scherm";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-go-14-oled-fg14-71-71gh.md": {
	id: "acer-swift-go-14-oled-fg14-71-71gh.md";
  slug: "acer-swift-go-14-oled-fg14-71-71gh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-go-14-oled-sfg14-42-r4rz.md": {
	id: "acer-swift-go-14-oled-sfg14-42-r4rz.md";
  slug: "acer-swift-go-14-oled-sfg14-42-r4rz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-go-14-sfg14-41-r3pt.md": {
	id: "acer-swift-go-14-sfg14-41-r3pt.md";
  slug: "acer-swift-go-14-sfg14-41-r3pt";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-go-14-sfg14-71-54h9-14-inch-intel-core-i5-16-gb-512-gb-1768627.md": {
	id: "acer-swift-go-14-sfg14-71-54h9-14-inch-intel-core-i5-16-gb-512-gb-1768627.md";
  slug: "acer-swift-go-14-sfg14-71-54h9-14-inch-intel-core-i5-16-gb-512-gb-1768627";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-go-14-sfg14-71-54h9-i5-1335u-16-512gb-14-qhd.md": {
	id: "acer-swift-go-14-sfg14-71-54h9-i5-1335u-16-512gb-14-qhd.md";
  slug: "acer-swift-go-14-sfg14-71-54h9-i5-1335u-16-512gb-14-qhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-go-14-sfg14-71-57lg-14-inch-oled-intel-core-i5-16-gb-512-gb-1768628.md": {
	id: "acer-swift-go-14-sfg14-71-57lg-14-inch-oled-intel-core-i5-16-gb-512-gb-1768628.md";
  slug: "acer-swift-go-14-sfg14-71-57lg-14-inch-oled-intel-core-i5-16-gb-512-gb-1768628";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-go-14-sfg14-71-57lg-i5-1335u-16-512gb-14-2-8k-oled-90hz.md": {
	id: "acer-swift-go-14-sfg14-71-57lg-i5-1335u-16-512gb-14-2-8k-oled-90hz.md";
  slug: "acer-swift-go-14-sfg14-71-57lg-i5-1335u-16-512gb-14-2-8k-oled-90hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-go-14-sfg14-71-71gs-i7-1335u-32-1tb-14-2-8k-oled-90hz.md": {
	id: "acer-swift-go-14-sfg14-71-71gs-i7-1335u-32-1tb-14-2-8k-oled-90hz.md";
  slug: "acer-swift-go-14-sfg14-71-71gs-i7-1335u-32-1tb-14-2-8k-oled-90hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-go-16-sfg16-71-7649-i7-1355u-16-512gb-16-wqxga.md": {
	id: "acer-swift-go-16-sfg16-71-7649-i7-1355u-16-512gb-16-wqxga.md";
  slug: "acer-swift-go-16-sfg16-71-7649-i7-1355u-16-512gb-16-wqxga";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-go-16-sfg16-71-786z-i7-1355u-32-1tb-16-3-2k-oled-120hz.md": {
	id: "acer-swift-go-16-sfg16-71-786z-i7-1355u-32-1tb-16-3-2k-oled-120hz.md";
  slug: "acer-swift-go-16-sfg16-71-786z-i7-1355u-32-1tb-16-3-2k-oled-120hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-porsche-design-ap714-51gt-755z-14-i7-1165g7-16gb-1tb-geforce-mx350.md": {
	id: "acer-swift-porsche-design-ap714-51gt-755z-14-i7-1165g7-16gb-1tb-geforce-mx350.md";
  slug: "acer-swift-porsche-design-ap714-51gt-755z-14-i7-1165g7-16gb-1tb-geforce-mx350";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-sfx16-61g-r1pc.md": {
	id: "acer-swift-sfx16-61g-r1pc.md";
  slug: "acer-swift-sfx16-61g-r1pc";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-x-14-sfx14-71g-72ll-i7-13700h-32-1tb-4050-14-5-2-8k-oled.md": {
	id: "acer-swift-x-14-sfx14-71g-72ll-i7-13700h-32-1tb-4050-14-5-2-8k-oled.md";
  slug: "acer-swift-x-14-sfx14-71g-72ll-i7-13700h-32-1tb-4050-14-5-2-8k-oled";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-x-sfx14-41g-r7d2-r5-5600u-16-512gb-3050-14-prodigy-pink.md": {
	id: "acer-swift-x-sfx14-41g-r7d2-r5-5600u-16-512gb-3050-14-prodigy-pink.md";
  slug: "acer-swift-x-sfx14-41g-r7d2-r5-5600u-16-512gb-3050-14-prodigy-pink";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-x-sfx14-41g-r93d-14-fhd-r5-5500u-16gb-512gb-1650-w11.md": {
	id: "acer-swift-x-sfx14-41g-r93d-14-fhd-r5-5500u-16gb-512gb-1650-w11.md";
  slug: "acer-swift-x-sfx14-41g-r93d-14-fhd-r5-5500u-16gb-512gb-1650-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-x-sfx14-42g-r0kk-14-inch-amd-ryzen-5-16-gb-512-gb-geforce-rtx-3050-1770714.md": {
	id: "acer-swift-x-sfx14-42g-r0kk-14-inch-amd-ryzen-5-16-gb-512-gb-geforce-rtx-3050-1770714.md";
  slug: "acer-swift-x-sfx14-42g-r0kk-14-inch-amd-ryzen-5-16-gb-512-gb-geforce-rtx-3050-1770714";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-x-sfx14-42g-r0kk-r5-5625u-16-512gb-3050-14.md": {
	id: "acer-swift-x-sfx14-42g-r0kk-r5-5625u-16-512gb-3050-14.md";
  slug: "acer-swift-x-sfx14-42g-r0kk-r5-5625u-16-512gb-3050-14";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-x-sfx16-51g-52nk-laptop.md": {
	id: "acer-swift-x-sfx16-51g-52nk-laptop.md";
  slug: "acer-swift-x-sfx16-51g-52nk-laptop";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-swift-x-sfx16-52g-7621.md": {
	id: "acer-swift-x-sfx16-52g-7621.md";
  slug: "acer-swift-x-sfx16-52g-7621";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-tm-p2-tmp216-51-tco-530a-16-fhd-i5-1335u-16gb-512gb-w11-pro.md": {
	id: "acer-tm-p2-tmp216-51-tco-530a-16-fhd-i5-1335u-16gb-512gb-w11-pro.md";
  slug: "acer-tm-p2-tmp216-51-tco-530a-16-fhd-i5-1335u-16gb-512gb-w11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-travelmate-p2-14-tmp214-55-55bs.md": {
	id: "acer-travelmate-p2-14-tmp214-55-55bs.md";
  slug: "acer-travelmate-p2-14-tmp214-55-55bs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-travelmate-p2-14-tmp214-55-73yq.md": {
	id: "acer-travelmate-p2-14-tmp214-55-73yq.md";
  slug: "acer-travelmate-p2-14-tmp214-55-73yq";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-travelmate-p2-16-tmp216-51-55t6-16-inch-intel-core-i5-16-gb-512-gb-1770994.md": {
	id: "acer-travelmate-p2-16-tmp216-51-55t6-16-inch-intel-core-i5-16-gb-512-gb-1770994.md";
  slug: "acer-travelmate-p2-16-tmp216-51-55t6-16-inch-intel-core-i5-16-gb-512-gb-1770994";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-travelmate-p2-16-tmp216-51-55t6.md": {
	id: "acer-travelmate-p2-16-tmp216-51-55t6.md";
  slug: "acer-travelmate-p2-16-tmp216-51-55t6";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-travelmate-p2-tmp215-54-52xu-15-6-zwart-i5-8gb-512gb-w11p.md": {
	id: "acer-travelmate-p2-tmp215-54-52xu-15-6-zwart-i5-8gb-512gb-w11p.md";
  slug: "acer-travelmate-p2-tmp215-54-52xu-15-6-zwart-i5-8gb-512gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-travelmate-p2-tmp215-54-54u1-2.md": {
	id: "acer-travelmate-p2-tmp215-54-54u1-2.md";
  slug: "acer-travelmate-p2-tmp215-54-54u1-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-travelmate-p2-tmp215-54-54u1.md": {
	id: "acer-travelmate-p2-tmp215-54-54u1.md";
  slug: "acer-travelmate-p2-tmp215-54-54u1";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-travelmate-p2-tmp215-54-70lk-i7-16gb-512gb-15-6-w11p.md": {
	id: "acer-travelmate-p2-tmp215-54-70lk-i7-16gb-512gb-15-6-w11p.md";
  slug: "acer-travelmate-p2-tmp215-54-70lk-i7-16gb-512gb-15-6-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-travelmate-p2-tmp216-51-76g1-16-i7-1355u-16gb-512gb-w11.md": {
	id: "acer-travelmate-p2-tmp216-51-76g1-16-i7-1355u-16gb-512gb-w11.md";
  slug: "acer-travelmate-p2-tmp216-51-76g1-16-i7-1355u-16gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-travelmate-p4-tmp414-52-53qu-14-fhd-i5-1240p-16gb-512gb-w10p.md": {
	id: "acer-travelmate-p4-tmp414-52-53qu-14-fhd-i5-1240p-16gb-512gb-w10p.md";
  slug: "acer-travelmate-p4-tmp414-52-53qu-14-fhd-i5-1240p-16gb-512gb-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-travelmate-vero-tmv15-51-5797.md": {
	id: "acer-travelmate-vero-tmv15-51-5797.md";
  slug: "acer-travelmate-vero-tmv15-51-5797";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-travelmate-vero-tmv15-51-58hq-15-6-zwart-i5-16gb-512gb-w11p.md": {
	id: "acer-travelmate-vero-tmv15-51-58hq-15-6-zwart-i5-16gb-512gb-w11p.md";
  slug: "acer-travelmate-vero-tmv15-51-58hq-15-6-zwart-i5-16gb-512gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-travelmate-vero-tmv15-51-58hq.md": {
	id: "acer-travelmate-vero-tmv15-51-58hq.md";
  slug: "acer-travelmate-vero-tmv15-51-58hq";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"acer-triton-17x-ptx17-71-99c4-173-inch-intel-core-i9-32-gb-2-tb-geforce-rtx-4090-1769652.md": {
	id: "acer-triton-17x-ptx17-71-99c4-173-inch-intel-core-i9-32-gb-2-tb-geforce-rtx-4090-1769652.md";
  slug: "acer-triton-17x-ptx17-71-99c4-173-inch-intel-core-i9-32-gb-2-tb-geforce-rtx-4090-1769652";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"amd-ryzen-3-3250u-8gb-ddr4-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-amd-radeon-graphics-wlan-webcam-windows-10-home-64-bit.md": {
	id: "amd-ryzen-3-3250u-8gb-ddr4-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-amd-radeon-graphics-wlan-webcam-windows-10-home-64-bit.md";
  slug: "amd-ryzen-3-3250u-8gb-ddr4-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-amd-radeon-graphics-wlan-webcam-windows-10-home-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"amd-ryzen-5-7520u-8gb-lpddr5-4800-256gb-ssd-m-2-2242-pcie-4-0x4-nvme-14-fhd-tn-250nits-anti-glare-amd-radeon-610m-graphics-11ac-2x2-bt5-1-hd-720p-with-privacy-shutter-windows-11-pro.md": {
	id: "amd-ryzen-5-7520u-8gb-lpddr5-4800-256gb-ssd-m-2-2242-pcie-4-0x4-nvme-14-fhd-tn-250nits-anti-glare-amd-radeon-610m-graphics-11ac-2x2-bt5-1-hd-720p-with-privacy-shutter-windows-11-pro.md";
  slug: "amd-ryzen-5-7520u-8gb-lpddr5-4800-256gb-ssd-m-2-2242-pcie-4-0x4-nvme-14-fhd-tn-250nits-anti-glare-amd-radeon-610m-graphics-11ac-2x2-bt5-1-hd-720p-with-privacy-shutter-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"amd-ryzen-5-pro-5650u-16gb-ddr4-sdram-256gb-ssd-35-6-cm-full-hd-1920-x-1080-ips-amd-radeon-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md": {
	id: "amd-ryzen-5-pro-5650u-16gb-ddr4-sdram-256gb-ssd-35-6-cm-full-hd-1920-x-1080-ips-amd-radeon-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md";
  slug: "amd-ryzen-5-pro-5650u-16gb-ddr4-sdram-256gb-ssd-35-6-cm-full-hd-1920-x-1080-ips-amd-radeon-graphics-lan-wlan-webcam-windows-11-pro-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"amd-ryzen-5-pro-6650u-16gb-lpddr5-sdram-512gb-ssd-33-8-cm-wuxga-1920-x-1200-ips-amd-radeon-660m-wlan-4g-webcam-windows-11-pro-64-bit.md": {
	id: "amd-ryzen-5-pro-6650u-16gb-lpddr5-sdram-512gb-ssd-33-8-cm-wuxga-1920-x-1200-ips-amd-radeon-660m-wlan-4g-webcam-windows-11-pro-64-bit.md";
  slug: "amd-ryzen-5-pro-6650u-16gb-lpddr5-sdram-512gb-ssd-33-8-cm-wuxga-1920-x-1200-ips-amd-radeon-660m-wlan-4g-webcam-windows-11-pro-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"amd-ryzen-7-5825u-16gb-ddr4-sdram-1000gb-ssd-40-6-cm-wuxga-1920-x-1200-ips-amd-radeon-graphics-wlan-webcam-windows-11-home-64-bit.md": {
	id: "amd-ryzen-7-5825u-16gb-ddr4-sdram-1000gb-ssd-40-6-cm-wuxga-1920-x-1200-ips-amd-radeon-graphics-wlan-webcam-windows-11-home-64-bit.md";
  slug: "amd-ryzen-7-5825u-16gb-ddr4-sdram-1000gb-ssd-40-6-cm-wuxga-1920-x-1200-ips-amd-radeon-graphics-wlan-webcam-windows-11-home-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"amd-ryzen-7-5825u-8gb-ddr4-sdram-512gb-ssd-40-6-cm-wuxga-1920-x-1200-ips-amd-radeon-graphics-wlan-webcam-windows-11-home-64-bit.md": {
	id: "amd-ryzen-7-5825u-8gb-ddr4-sdram-512gb-ssd-40-6-cm-wuxga-1920-x-1200-ips-amd-radeon-graphics-wlan-webcam-windows-11-home-64-bit.md";
  slug: "amd-ryzen-7-5825u-8gb-ddr4-sdram-512gb-ssd-40-6-cm-wuxga-1920-x-1200-ips-amd-radeon-graphics-wlan-webcam-windows-11-home-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"amd-ryzen-9-7940hs-16gb-ddr5-sdram-1000gb-ssd-43-9-cm-wide-quad-hd-2560-x-1440-ips-amd-radeon-780m-nvidia-geforce-rtx-4070-lan-wlan-webcam-windows-11-home-64-bit.md": {
	id: "amd-ryzen-9-7940hs-16gb-ddr5-sdram-1000gb-ssd-43-9-cm-wide-quad-hd-2560-x-1440-ips-amd-radeon-780m-nvidia-geforce-rtx-4070-lan-wlan-webcam-windows-11-home-64-bit.md";
  slug: "amd-ryzen-9-7940hs-16gb-ddr5-sdram-1000gb-ssd-43-9-cm-wide-quad-hd-2560-x-1440-ips-amd-radeon-780m-nvidia-geforce-rtx-4070-lan-wlan-webcam-windows-11-home-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"amd-ryzen-9-7945hx-32gb-ddr5-sdram-2000gb-ssd-40-6-cm-wqxga-2560-x-1600-ips-amd-radeon-610m-nvidia-geforce-rtx-4090-lan-wlan-webcam-windows-11-home.md": {
	id: "amd-ryzen-9-7945hx-32gb-ddr5-sdram-2000gb-ssd-40-6-cm-wqxga-2560-x-1600-ips-amd-radeon-610m-nvidia-geforce-rtx-4090-lan-wlan-webcam-windows-11-home.md";
  slug: "amd-ryzen-9-7945hx-32gb-ddr5-sdram-2000gb-ssd-40-6-cm-wqxga-2560-x-1600-ips-amd-radeon-610m-nvidia-geforce-rtx-4090-lan-wlan-webcam-windows-11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-128-gb-opslag-13-3-inch-grijs.md": {
	id: "apple-macbook-air-128-gb-opslag-13-3-inch-grijs.md";
  slug: "apple-macbook-air-128-gb-opslag-13-3-inch-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-13-3-2020-goud-m1-256gb-16gb-1682023.md": {
	id: "apple-macbook-air-13-3-2020-goud-m1-256gb-16gb-1682023.md";
  slug: "apple-macbook-air-13-3-2020-goud-m1-256gb-16gb-1682023";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-13-3-2020-goud-m1-256gb-8gb-1681035.md": {
	id: "apple-macbook-air-13-3-2020-goud-m1-256gb-8gb-1681035.md";
  slug: "apple-macbook-air-13-3-2020-goud-m1-256gb-8gb-1681035";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-13-3-2020-spacegrijs-m1-256gb-16gb-1682021.md": {
	id: "apple-macbook-air-13-3-2020-spacegrijs-m1-256gb-16gb-1682021.md";
  slug: "apple-macbook-air-13-3-2020-spacegrijs-m1-256gb-16gb-1682021";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-13-3-2020-spacegrijs-m1-256gb-8gb-1681031.md": {
	id: "apple-macbook-air-13-3-2020-spacegrijs-m1-256gb-8gb-1681031.md";
  slug: "apple-macbook-air-13-3-2020-spacegrijs-m1-256gb-8gb-1681031";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-13-3-2020-spacegrijs-m1-512gb-16gb-1682024.md": {
	id: "apple-macbook-air-13-3-2020-spacegrijs-m1-512gb-16gb-1682024.md";
  slug: "apple-macbook-air-13-3-2020-spacegrijs-m1-512gb-16gb-1682024";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-13-3-2020-zilver-m1-256-gb-1681033.md": {
	id: "apple-macbook-air-13-3-2020-zilver-m1-256-gb-1681033.md";
  slug: "apple-macbook-air-13-3-2020-zilver-m1-256-gb-1681033";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-13-6-2022-middernacht-m2-10-core-gpu-8gb-512gb-1729686.md": {
	id: "apple-macbook-air-13-6-2022-middernacht-m2-10-core-gpu-8gb-512gb-1729686.md";
  slug: "apple-macbook-air-13-6-2022-middernacht-m2-10-core-gpu-8gb-512gb-1729686";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-13-6-2022-middernacht-m2-8-core-gpu-8gb-256gb-1729685.md": {
	id: "apple-macbook-air-13-6-2022-middernacht-m2-8-core-gpu-8gb-256gb-1729685.md";
  slug: "apple-macbook-air-13-6-2022-middernacht-m2-8-core-gpu-8gb-256gb-1729685";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-13-6-2022-spacegrijs-m2-10-core-gpu-8gb-512gb-1729680.md": {
	id: "apple-macbook-air-13-6-2022-spacegrijs-m2-10-core-gpu-8gb-512gb-1729680.md";
  slug: "apple-macbook-air-13-6-2022-spacegrijs-m2-10-core-gpu-8gb-512gb-1729680";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-13-6-2022-spacegrijs-m2-8-core-gpu-8gb-256gb-1729679.md": {
	id: "apple-macbook-air-13-6-2022-spacegrijs-m2-8-core-gpu-8gb-256gb-1729679.md";
  slug: "apple-macbook-air-13-6-2022-spacegrijs-m2-8-core-gpu-8gb-256gb-1729679";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-13-6-2022-sterrenlicht-m2-10-core-gpu-8gb-512gb-1729684.md": {
	id: "apple-macbook-air-13-6-2022-sterrenlicht-m2-10-core-gpu-8gb-512gb-1729684.md";
  slug: "apple-macbook-air-13-6-2022-sterrenlicht-m2-10-core-gpu-8gb-512gb-1729684";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-13-6-2022-sterrenlicht-m2-8-core-gpu-8gb-256gb-1729683.md": {
	id: "apple-macbook-air-13-6-2022-sterrenlicht-m2-8-core-gpu-8gb-256gb-1729683.md";
  slug: "apple-macbook-air-13-6-2022-sterrenlicht-m2-8-core-gpu-8gb-256gb-1729683";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-13-6-2022-zilver-m2-10-core-gpu-8gb-512gb-1729682.md": {
	id: "apple-macbook-air-13-6-2022-zilver-m2-10-core-gpu-8gb-512gb-1729682.md";
  slug: "apple-macbook-air-13-6-2022-zilver-m2-10-core-gpu-8gb-512gb-1729682";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-13-6-2022-zilver-m2-8-core-gpu-8gb-256gb-1729681.md": {
	id: "apple-macbook-air-13-6-2022-zilver-m2-8-core-gpu-8gb-256gb-1729681.md";
  slug: "apple-macbook-air-13-6-2022-zilver-m2-8-core-gpu-8gb-256gb-1729681";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-133-2023-spacegrijs-m1-512gb-8gb-1741917.md": {
	id: "apple-macbook-air-133-2023-spacegrijs-m1-512gb-8gb-1741917.md";
  slug: "apple-macbook-air-133-2023-spacegrijs-m1-512gb-8gb-1741917";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-136-2022-spacegrijs-m2-8-core-gpu-16-gb-256-gb-1741914.md": {
	id: "apple-macbook-air-136-2022-spacegrijs-m2-8-core-gpu-16-gb-256-gb-1741914.md";
  slug: "apple-macbook-air-136-2022-spacegrijs-m2-8-core-gpu-16-gb-256-gb-1741914";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-16gb-1tb-middernacht-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-16gb-1tb-middernacht-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-16gb-1tb-middernacht-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-16gb-1tb-spacegrijs-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-16gb-1tb-spacegrijs-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-16gb-1tb-spacegrijs-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-16gb-256gb-middernacht-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-16gb-256gb-middernacht-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-16gb-256gb-middernacht-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-16gb-256gb-spacegrijs-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-16gb-256gb-spacegrijs-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-16gb-256gb-spacegrijs-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-16gb-512gb-middernacht-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-16gb-512gb-middernacht-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-16gb-512gb-middernacht-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-16gb-512gb-spacegrijs-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-16gb-512gb-spacegrijs-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-16gb-512gb-spacegrijs-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-24gb-1tb-middernacht-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-24gb-1tb-middernacht-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-24gb-1tb-middernacht-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-24gb-1tb-spacegrijs-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-24gb-1tb-spacegrijs-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-24gb-1tb-spacegrijs-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-24gb-512gb-middernacht-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-24gb-512gb-middernacht-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-24gb-512gb-middernacht-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-24gb-512gb-spacegrijs-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-24gb-512gb-spacegrijs-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-24gb-512gb-spacegrijs-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-1tb-middernacht-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-1tb-middernacht-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-1tb-middernacht-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-1tb-spacegrijs-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-1tb-spacegrijs-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-1tb-spacegrijs-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-256gb-middernacht-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-256gb-middernacht-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-256gb-middernacht-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-256gb-spacegrijs-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-256gb-spacegrijs-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-256gb-spacegrijs-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-256gb-sterrenlicht-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-256gb-sterrenlicht-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-256gb-sterrenlicht-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-256gb-zilver-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-256gb-zilver-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-256gb-zilver-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-512gb-middernacht-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-512gb-middernacht-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-512gb-middernacht-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-512gb-spacegrijs-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-512gb-spacegrijs-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-512gb-spacegrijs-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-512gb-sterrenlicht-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-512gb-sterrenlicht-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-512gb-sterrenlicht-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-512gb-zilver-qwerty.md": {
	id: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-512gb-zilver-qwerty.md";
  slug: "apple-macbook-air-15-2023-m2-8-core-cpu-10-core-gpu-8gb-512gb-zilver-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-inch-m2-16gb-256-gb-sterrenlicht.md": {
	id: "apple-macbook-air-15-inch-m2-16gb-256-gb-sterrenlicht.md";
  slug: "apple-macbook-air-15-inch-m2-16gb-256-gb-sterrenlicht";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-inch-m2-16gb-256-gb-zilver.md": {
	id: "apple-macbook-air-15-inch-m2-16gb-256-gb-zilver.md";
  slug: "apple-macbook-air-15-inch-m2-16gb-256-gb-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-inch-m2-16gb-512-gb-middernacht.md": {
	id: "apple-macbook-air-15-inch-m2-16gb-512-gb-middernacht.md";
  slug: "apple-macbook-air-15-inch-m2-16gb-512-gb-middernacht";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-inch-m2-16gb-512-gb-spacegrijs.md": {
	id: "apple-macbook-air-15-inch-m2-16gb-512-gb-spacegrijs.md";
  slug: "apple-macbook-air-15-inch-m2-16gb-512-gb-spacegrijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-inch-m2-16gb-512-gb-sterrenlicht.md": {
	id: "apple-macbook-air-15-inch-m2-16gb-512-gb-sterrenlicht.md";
  slug: "apple-macbook-air-15-inch-m2-16gb-512-gb-sterrenlicht";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-15-inch-m2-16gb-512-gb-zilver.md": {
	id: "apple-macbook-air-15-inch-m2-16gb-512-gb-zilver.md";
  slug: "apple-macbook-air-15-inch-m2-16gb-512-gb-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2020-16gb-256gb-apple-m1-met-7-core-gpu-goud-qwerty.md": {
	id: "apple-macbook-air-2020-16gb-256gb-apple-m1-met-7-core-gpu-goud-qwerty.md";
  slug: "apple-macbook-air-2020-16gb-256gb-apple-m1-met-7-core-gpu-goud-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2020-16gb-256gb-apple-m1-met-7-core-gpu-zilver-qwerty.md": {
	id: "apple-macbook-air-2020-16gb-256gb-apple-m1-met-7-core-gpu-zilver-qwerty.md";
  slug: "apple-macbook-air-2020-16gb-256gb-apple-m1-met-7-core-gpu-zilver-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2020-16gb-512gb-apple-m1-met-7-core-gpu-goud-qwerty.md": {
	id: "apple-macbook-air-2020-16gb-512gb-apple-m1-met-7-core-gpu-goud-qwerty.md";
  slug: "apple-macbook-air-2020-16gb-512gb-apple-m1-met-7-core-gpu-goud-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2020-16gb-512gb-apple-m1-met-7-core-gpu-grijs-qwerty.md": {
	id: "apple-macbook-air-2020-16gb-512gb-apple-m1-met-7-core-gpu-grijs-qwerty.md";
  slug: "apple-macbook-air-2020-16gb-512gb-apple-m1-met-7-core-gpu-grijs-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2022-apple-m2-8-core-cpu-10-core-gpu-8gb-512gb-blauw-qwerty.md": {
	id: "apple-macbook-air-2022-apple-m2-8-core-cpu-10-core-gpu-8gb-512gb-blauw-qwerty.md";
  slug: "apple-macbook-air-2022-apple-m2-8-core-cpu-10-core-gpu-8gb-512gb-blauw-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2022-apple-m2-8-core-cpu-10-core-gpu-8gb-512gb-goud-qwerty.md": {
	id: "apple-macbook-air-2022-apple-m2-8-core-cpu-10-core-gpu-8gb-512gb-goud-qwerty.md";
  slug: "apple-macbook-air-2022-apple-m2-8-core-cpu-10-core-gpu-8gb-512gb-goud-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2022-apple-m2-8-core-cpu-10-core-gpu-8gb-512gb-space-gray-qwerty.md": {
	id: "apple-macbook-air-2022-apple-m2-8-core-cpu-10-core-gpu-8gb-512gb-space-gray-qwerty.md";
  slug: "apple-macbook-air-2022-apple-m2-8-core-cpu-10-core-gpu-8gb-512gb-space-gray-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2022-apple-m2-8-core-cpu-10-core-gpu-8gb-512gb-zilver-qwerty.md": {
	id: "apple-macbook-air-2022-apple-m2-8-core-cpu-10-core-gpu-8gb-512gb-zilver-qwerty.md";
  slug: "apple-macbook-air-2022-apple-m2-8-core-cpu-10-core-gpu-8gb-512gb-zilver-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2022-apple-m2-8-core-cpu-8-core-gpu-8gb-256gb-space-gray-qwerty.md": {
	id: "apple-macbook-air-2022-apple-m2-8-core-cpu-8-core-gpu-8gb-256gb-space-gray-qwerty.md";
  slug: "apple-macbook-air-2022-apple-m2-8-core-cpu-8-core-gpu-8gb-256gb-space-gray-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2022-apple-m2-8-core-cpu-8-core-gpu-8gb-256gb-zilver-qwerty.md": {
	id: "apple-macbook-air-2022-apple-m2-8-core-cpu-8-core-gpu-8gb-256gb-zilver-qwerty.md";
  slug: "apple-macbook-air-2022-apple-m2-8-core-cpu-8-core-gpu-8gb-256gb-zilver-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2022-m2-8-core-cpu-10-core-gpu-16gb-1tb-space-gray-qwerty.md": {
	id: "apple-macbook-air-2022-m2-8-core-cpu-10-core-gpu-16gb-1tb-space-gray-qwerty.md";
  slug: "apple-macbook-air-2022-m2-8-core-cpu-10-core-gpu-16gb-1tb-space-gray-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2022-m2-8-core-cpu-10-core-gpu-16gb-256gb-blauw-qwerty.md": {
	id: "apple-macbook-air-2022-m2-8-core-cpu-10-core-gpu-16gb-256gb-blauw-qwerty.md";
  slug: "apple-macbook-air-2022-m2-8-core-cpu-10-core-gpu-16gb-256gb-blauw-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2022-m2-8-core-cpu-10-core-gpu-16gb-512gb-blauw-qwerty.md": {
	id: "apple-macbook-air-2022-m2-8-core-cpu-10-core-gpu-16gb-512gb-blauw-qwerty.md";
  slug: "apple-macbook-air-2022-m2-8-core-cpu-10-core-gpu-16gb-512gb-blauw-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2022-m2-8-core-cpu-10-core-gpu-16gb-512gb-space-gray-qwerty.md": {
	id: "apple-macbook-air-2022-m2-8-core-cpu-10-core-gpu-16gb-512gb-space-gray-qwerty.md";
  slug: "apple-macbook-air-2022-m2-8-core-cpu-10-core-gpu-16gb-512gb-space-gray-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2022-m2-8-core-cpu-10-core-gpu-24gb-256gb-space-gray-qwerty.md": {
	id: "apple-macbook-air-2022-m2-8-core-cpu-10-core-gpu-24gb-256gb-space-gray-qwerty.md";
  slug: "apple-macbook-air-2022-m2-8-core-cpu-10-core-gpu-24gb-256gb-space-gray-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2022-m2-8-core-cpu-10-core-gpu-24gb-512gb-blauw-qwerty.md": {
	id: "apple-macbook-air-2022-m2-8-core-cpu-10-core-gpu-24gb-512gb-blauw-qwerty.md";
  slug: "apple-macbook-air-2022-m2-8-core-cpu-10-core-gpu-24gb-512gb-blauw-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2022-m2-8-core-cpu-8-core-gpu-16gb-1tb-blauw-qwerty.md": {
	id: "apple-macbook-air-2022-m2-8-core-cpu-8-core-gpu-16gb-1tb-blauw-qwerty.md";
  slug: "apple-macbook-air-2022-m2-8-core-cpu-8-core-gpu-16gb-1tb-blauw-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2022-m2-8-core-cpu-8-core-gpu-16gb-1tb-space-gray-qwerty.md": {
	id: "apple-macbook-air-2022-m2-8-core-cpu-8-core-gpu-16gb-1tb-space-gray-qwerty.md";
  slug: "apple-macbook-air-2022-m2-8-core-cpu-8-core-gpu-16gb-1tb-space-gray-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2022-m2-8-core-cpu-8-core-gpu-16gb-256gb-blauw-qwerty.md": {
	id: "apple-macbook-air-2022-m2-8-core-cpu-8-core-gpu-16gb-256gb-blauw-qwerty.md";
  slug: "apple-macbook-air-2022-m2-8-core-cpu-8-core-gpu-16gb-256gb-blauw-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2022-m2-8-core-cpu-8-core-gpu-16gb-512gb-blauw-qwerty.md": {
	id: "apple-macbook-air-2022-m2-8-core-cpu-8-core-gpu-16gb-512gb-blauw-qwerty.md";
  slug: "apple-macbook-air-2022-m2-8-core-cpu-8-core-gpu-16gb-512gb-blauw-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2022-m2-8-core-cpu-8-core-gpu-24gb-512gb-space-gray-qwerty.md": {
	id: "apple-macbook-air-2022-m2-8-core-cpu-8-core-gpu-24gb-512gb-space-gray-qwerty.md";
  slug: "apple-macbook-air-2022-m2-8-core-cpu-8-core-gpu-24gb-512gb-space-gray-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2022-m2-8-core-cpu-8-core-gpu-8gb-512gb-space-gray-qwerty.md": {
	id: "apple-macbook-air-2022-m2-8-core-cpu-8-core-gpu-8gb-512gb-space-gray-qwerty.md";
  slug: "apple-macbook-air-2022-m2-8-core-cpu-8-core-gpu-8gb-512gb-space-gray-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2023-middernacht-15-inch-apple-m2-8-gb-256-gb-1765034.md": {
	id: "apple-macbook-air-2023-middernacht-15-inch-apple-m2-8-gb-256-gb-1765034.md";
  slug: "apple-macbook-air-2023-middernacht-15-inch-apple-m2-8-gb-256-gb-1765034";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2023-middernacht-15-inch-apple-m2-8-gb-512-gb-1765035.md": {
	id: "apple-macbook-air-2023-middernacht-15-inch-apple-m2-8-gb-512-gb-1765035.md";
  slug: "apple-macbook-air-2023-middernacht-15-inch-apple-m2-8-gb-512-gb-1765035";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2023-spacegrijs-15-inch-apple-m2-8-gb-256-gb-1765028.md": {
	id: "apple-macbook-air-2023-spacegrijs-15-inch-apple-m2-8-gb-256-gb-1765028.md";
  slug: "apple-macbook-air-2023-spacegrijs-15-inch-apple-m2-8-gb-256-gb-1765028";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2023-spacegrijs-15-inch-apple-m2-8-gb-512-gb-1765029.md": {
	id: "apple-macbook-air-2023-spacegrijs-15-inch-apple-m2-8-gb-512-gb-1765029.md";
  slug: "apple-macbook-air-2023-spacegrijs-15-inch-apple-m2-8-gb-512-gb-1765029";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2023-sterrenlicht-15-inch-apple-m2-8-gb-256-gb-1765032.md": {
	id: "apple-macbook-air-2023-sterrenlicht-15-inch-apple-m2-8-gb-256-gb-1765032.md";
  slug: "apple-macbook-air-2023-sterrenlicht-15-inch-apple-m2-8-gb-256-gb-1765032";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-2023-sterrenlicht-15-inch-apple-m2-8-gb-512-gb-1765033.md": {
	id: "apple-macbook-air-2023-sterrenlicht-15-inch-apple-m2-8-gb-512-gb-1765033.md";
  slug: "apple-macbook-air-2023-sterrenlicht-15-inch-apple-m2-8-gb-512-gb-1765033";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mlxw3n-a-cto-13-6-inch-apple-m2-256-gb-spacegrijs-2.md": {
	id: "apple-macbook-air-mlxw3n-a-cto-13-6-inch-apple-m2-256-gb-spacegrijs-2.md";
  slug: "apple-macbook-air-mlxw3n-a-cto-13-6-inch-apple-m2-256-gb-spacegrijs-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mlxw3n-a-cto-13-6-inch-apple-m2-256-gb-spacegrijs.md": {
	id: "apple-macbook-air-mlxw3n-a-cto-13-6-inch-apple-m2-256-gb-spacegrijs.md";
  slug: "apple-macbook-air-mlxw3n-a-cto-13-6-inch-apple-m2-256-gb-spacegrijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mlxw3n-a-cto-13-6-inch-apple-m2-512-gb-spacegrijs.md": {
	id: "apple-macbook-air-mlxw3n-a-cto-13-6-inch-apple-m2-512-gb-spacegrijs.md";
  slug: "apple-macbook-air-mlxw3n-a-cto-13-6-inch-apple-m2-512-gb-spacegrijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mlxx3n-a-13-6-inch-apple-m2-512-gb-spacegrijs.md": {
	id: "apple-macbook-air-mlxx3n-a-13-6-inch-apple-m2-512-gb-spacegrijs.md";
  slug: "apple-macbook-air-mlxx3n-a-13-6-inch-apple-m2-512-gb-spacegrijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mlxy3n-a-cto-13-6-inch-apple-m2-256-gb-zilver.md": {
	id: "apple-macbook-air-mlxy3n-a-cto-13-6-inch-apple-m2-256-gb-zilver.md";
  slug: "apple-macbook-air-mlxy3n-a-cto-13-6-inch-apple-m2-256-gb-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mly03n-a-13-6-inch-apple-m2-512-gb-zilver.md": {
	id: "apple-macbook-air-mly03n-a-13-6-inch-apple-m2-512-gb-zilver.md";
  slug: "apple-macbook-air-mly03n-a-13-6-inch-apple-m2-512-gb-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mly13n-a-13-6-inch-apple-m2-256-gb-sterrenlicht.md": {
	id: "apple-macbook-air-mly13n-a-13-6-inch-apple-m2-256-gb-sterrenlicht.md";
  slug: "apple-macbook-air-mly13n-a-13-6-inch-apple-m2-256-gb-sterrenlicht";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mly13n-a-cto-13-6-inch-apple-m2-256-gb-sterrenlicht.md": {
	id: "apple-macbook-air-mly13n-a-cto-13-6-inch-apple-m2-256-gb-sterrenlicht.md";
  slug: "apple-macbook-air-mly13n-a-cto-13-6-inch-apple-m2-256-gb-sterrenlicht";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mly13n-a-cto-13-6-inch-apple-m2-512-gb-sterrenlicht.md": {
	id: "apple-macbook-air-mly13n-a-cto-13-6-inch-apple-m2-512-gb-sterrenlicht.md";
  slug: "apple-macbook-air-mly13n-a-cto-13-6-inch-apple-m2-512-gb-sterrenlicht";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mly23n-a-13-6-inch-apple-m2-512-gb-sterrenlicht.md": {
	id: "apple-macbook-air-mly23n-a-13-6-inch-apple-m2-512-gb-sterrenlicht.md";
  slug: "apple-macbook-air-mly23n-a-13-6-inch-apple-m2-512-gb-sterrenlicht";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mly33n-a-cto-13-6-inch-apple-m2-256-gb-middernacht-2.md": {
	id: "apple-macbook-air-mly33n-a-cto-13-6-inch-apple-m2-256-gb-middernacht-2.md";
  slug: "apple-macbook-air-mly33n-a-cto-13-6-inch-apple-m2-256-gb-middernacht-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mly33n-a-cto-13-6-inch-apple-m2-256-gb-middernacht.md": {
	id: "apple-macbook-air-mly33n-a-cto-13-6-inch-apple-m2-256-gb-middernacht.md";
  slug: "apple-macbook-air-mly33n-a-cto-13-6-inch-apple-m2-256-gb-middernacht";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mly43n-a-13-6-inch-apple-m2-512-gb-middernacht.md": {
	id: "apple-macbook-air-mly43n-a-13-6-inch-apple-m2-512-gb-middernacht.md";
  slug: "apple-macbook-air-mly43n-a-13-6-inch-apple-m2-512-gb-middernacht";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mqkp3n-a-15-inch-m2-256-gb-spacegrijs.md": {
	id: "apple-macbook-air-mqkp3n-a-15-inch-m2-256-gb-spacegrijs.md";
  slug: "apple-macbook-air-mqkp3n-a-15-inch-m2-256-gb-spacegrijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mqkp3n-a-cto-15-inch-m2-256-gb-spacegrijs.md": {
	id: "apple-macbook-air-mqkp3n-a-cto-15-inch-m2-256-gb-spacegrijs.md";
  slug: "apple-macbook-air-mqkp3n-a-cto-15-inch-m2-256-gb-spacegrijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mqkq3n-a-15-inch-m2-512-gb-spacegrijs.md": {
	id: "apple-macbook-air-mqkq3n-a-15-inch-m2-512-gb-spacegrijs.md";
  slug: "apple-macbook-air-mqkq3n-a-15-inch-m2-512-gb-spacegrijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mqkr3n-a-15-inch-m2-256-gb-zilver.md": {
	id: "apple-macbook-air-mqkr3n-a-15-inch-m2-256-gb-zilver.md";
  slug: "apple-macbook-air-mqkr3n-a-15-inch-m2-256-gb-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mqku3n-a-15-inch-m2-256-gb-sterrenlicht.md": {
	id: "apple-macbook-air-mqku3n-a-15-inch-m2-256-gb-sterrenlicht.md";
  slug: "apple-macbook-air-mqku3n-a-15-inch-m2-256-gb-sterrenlicht";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mqkv3n-a-15-inch-m2-512-gb-sterrenlicht.md": {
	id: "apple-macbook-air-mqkv3n-a-15-inch-m2-512-gb-sterrenlicht.md";
  slug: "apple-macbook-air-mqkv3n-a-15-inch-m2-512-gb-sterrenlicht";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-air-mqkx3n-a-15-inch-m2-512-gb-middernacht.md": {
	id: "apple-macbook-air-mqkx3n-a-15-inch-m2-512-gb-middernacht.md";
  slug: "apple-macbook-air-mqkx3n-a-15-inch-m2-512-gb-middernacht";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-13-3-inch-256-gb-zilver.md": {
	id: "apple-macbook-pro-13-3-inch-256-gb-zilver.md";
  slug: "apple-macbook-pro-13-3-inch-256-gb-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-14''-2023-m3-8-core-cpu-10-core-gpu-8gb-512gb-spacegrijs-qwerty.md": {
	id: "apple-macbook-pro-14''-2023-m3-8-core-cpu-10-core-gpu-8gb-512gb-spacegrijs-qwerty.md";
  slug: "apple-macbook-pro-14-2023-m3-8-core-cpu-10-core-gpu-8gb-512gb-spacegrijs-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-14-2023-m2-max-12-core-cpu-30-core-gpu-64gb-1tb-space-gray-qwerty.md": {
	id: "apple-macbook-pro-14-2023-m2-max-12-core-cpu-30-core-gpu-64gb-1tb-space-gray-qwerty.md";
  slug: "apple-macbook-pro-14-2023-m2-max-12-core-cpu-30-core-gpu-64gb-1tb-space-gray-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-14-2023-m2-max-12-core-cpu-38-core-gpu-64gb-1tb-space-gray-qwerty.md": {
	id: "apple-macbook-pro-14-2023-m2-max-12-core-cpu-38-core-gpu-64gb-1tb-space-gray-qwerty.md";
  slug: "apple-macbook-pro-14-2023-m2-max-12-core-cpu-38-core-gpu-64gb-1tb-space-gray-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-14-2023-m2-pro-12-core-cpu-19-core-gpu-16gb-1tb-space-gray-qwerty.md": {
	id: "apple-macbook-pro-14-2023-m2-pro-12-core-cpu-19-core-gpu-16gb-1tb-space-gray-qwerty.md";
  slug: "apple-macbook-pro-14-2023-m2-pro-12-core-cpu-19-core-gpu-16gb-1tb-space-gray-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-14-2023-m3-8-core-cpu-10-core-gpu-8gb-512gb-zilver-qwerty.md": {
	id: "apple-macbook-pro-14-2023-m3-8-core-cpu-10-core-gpu-8gb-512gb-zilver-qwerty.md";
  slug: "apple-macbook-pro-14-2023-m3-8-core-cpu-10-core-gpu-8gb-512gb-zilver-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-14-2023-m3-8-core-cpu-10core-gpu-8gb-1tb-spacegrijs-qwerty.md": {
	id: "apple-macbook-pro-14-2023-m3-8-core-cpu-10core-gpu-8gb-1tb-spacegrijs-qwerty.md";
  slug: "apple-macbook-pro-14-2023-m3-8-core-cpu-10core-gpu-8gb-1tb-spacegrijs-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-14-2023-m3-8-core-cpu-10core-gpu-8gb-1tb-zilver-qwerty.md": {
	id: "apple-macbook-pro-14-2023-m3-8-core-cpu-10core-gpu-8gb-1tb-zilver-qwerty.md";
  slug: "apple-macbook-pro-14-2023-m3-8-core-cpu-10core-gpu-8gb-1tb-zilver-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-14-2023-spacegrijs-m2-max-12c-38c-96-gb-4-tb-1759737.md": {
	id: "apple-macbook-pro-14-2023-spacegrijs-m2-max-12c-38c-96-gb-4-tb-1759737.md";
  slug: "apple-macbook-pro-14-2023-spacegrijs-m2-max-12c-38c-96-gb-4-tb-1759737";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-14-2023-spacegrijs-m2-pro-10c-16c-16-gb-512-gb-1752352.md": {
	id: "apple-macbook-pro-14-2023-spacegrijs-m2-pro-10c-16c-16-gb-512-gb-1752352.md";
  slug: "apple-macbook-pro-14-2023-spacegrijs-m2-pro-10c-16c-16-gb-512-gb-1752352";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-15-4-inch-256-gb-zilver.md": {
	id: "apple-macbook-pro-15-4-inch-256-gb-zilver.md";
  slug: "apple-macbook-pro-15-4-inch-256-gb-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-16-2021-spacegrijs-m1-max-10c32c-16gb-1tb-1711413.md": {
	id: "apple-macbook-pro-16-2021-spacegrijs-m1-max-10c32c-16gb-1tb-1711413.md";
  slug: "apple-macbook-pro-16-2021-spacegrijs-m1-max-10c32c-16gb-1tb-1711413";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-16-2021-spacegrijs-m1-max-10c32c-64gb-8tb-1723441.md": {
	id: "apple-macbook-pro-16-2021-spacegrijs-m1-max-10c32c-64gb-8tb-1723441.md";
  slug: "apple-macbook-pro-16-2021-spacegrijs-m1-max-10c32c-64gb-8tb-1723441";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-16-2023-m2-max-12-core-cpu-30-core-gpu-32gb-1tb-space-gray-qwerty.md": {
	id: "apple-macbook-pro-16-2023-m2-max-12-core-cpu-30-core-gpu-32gb-1tb-space-gray-qwerty.md";
  slug: "apple-macbook-pro-16-2023-m2-max-12-core-cpu-30-core-gpu-32gb-1tb-space-gray-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-16-2023-m2-pro-12-core-cpu-19-core-gpu-16gb-512gb-space-gray-qwerty.md": {
	id: "apple-macbook-pro-16-2023-m2-pro-12-core-cpu-19-core-gpu-16gb-512gb-space-gray-qwerty.md";
  slug: "apple-macbook-pro-16-2023-m2-pro-12-core-cpu-19-core-gpu-16gb-512gb-space-gray-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-mneh3n-a-cto-13-3-inch-apple-m2-256-gb-spacegrijs.md": {
	id: "apple-macbook-pro-mneh3n-a-cto-13-3-inch-apple-m2-256-gb-spacegrijs.md";
  slug: "apple-macbook-pro-mneh3n-a-cto-13-3-inch-apple-m2-256-gb-spacegrijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-mnw83n-a-16-inch-apple-m2-pro-512gb-spacegrijs.md": {
	id: "apple-macbook-pro-mnw83n-a-16-inch-apple-m2-pro-512gb-spacegrijs.md";
  slug: "apple-macbook-pro-mnw83n-a-16-inch-apple-m2-pro-512gb-spacegrijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-mnw93n-a-16-inch-apple-m2-pro-1-tb-spacegrijs.md": {
	id: "apple-macbook-pro-mnw93n-a-16-inch-apple-m2-pro-1-tb-spacegrijs.md";
  slug: "apple-macbook-pro-mnw93n-a-16-inch-apple-m2-pro-1-tb-spacegrijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-mnwc3n-a-16-inch-apple-m2-pro-512gb-zilver.md": {
	id: "apple-macbook-pro-mnwc3n-a-16-inch-apple-m2-pro-512gb-zilver.md";
  slug: "apple-macbook-pro-mnwc3n-a-16-inch-apple-m2-pro-512gb-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-mnwe3n-a-16-inch-apple-m2-pro-1-tb-zilver.md": {
	id: "apple-macbook-pro-mnwe3n-a-16-inch-apple-m2-pro-1-tb-zilver.md";
  slug: "apple-macbook-pro-mnwe3n-a-16-inch-apple-m2-pro-1-tb-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-mphg3n-a-14-inch-apple-m2-max-1-tb-spacegrijs.md": {
	id: "apple-macbook-pro-mphg3n-a-14-inch-apple-m2-max-1-tb-spacegrijs.md";
  slug: "apple-macbook-pro-mphg3n-a-14-inch-apple-m2-max-1-tb-spacegrijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-mphj3n-a-14-inch-apple-m2-pro-1-tb-zilver.md": {
	id: "apple-macbook-pro-mphj3n-a-14-inch-apple-m2-pro-1-tb-zilver.md";
  slug: "apple-macbook-pro-mphj3n-a-14-inch-apple-m2-pro-1-tb-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-muhn2n-a-13-3-inch-128-gb-spacegrijs.md": {
	id: "apple-macbook-pro-muhn2n-a-13-3-inch-128-gb-spacegrijs.md";
  slug: "apple-macbook-pro-muhn2n-a-13-3-inch-128-gb-spacegrijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-touch-bar-15-4-inch-512-gb-spacegrijs.md": {
	id: "apple-macbook-pro-touch-bar-15-4-inch-512-gb-spacegrijs.md";
  slug: "apple-macbook-pro-touch-bar-15-4-inch-512-gb-spacegrijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-touch-bar-mv992-13-3-inch-intel-core-i5-256-gb-zilver.md": {
	id: "apple-macbook-pro-touch-bar-mv992-13-3-inch-intel-core-i5-256-gb-zilver.md";
  slug: "apple-macbook-pro-touch-bar-mv992-13-3-inch-intel-core-i5-256-gb-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-touch-bar-mvvj2-16-inch-intel-core-i7-512-gb-spacegrijs.md": {
	id: "apple-macbook-pro-touch-bar-mvvj2-16-inch-intel-core-i7-512-gb-spacegrijs.md";
  slug: "apple-macbook-pro-touch-bar-mvvj2-16-inch-intel-core-i7-512-gb-spacegrijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"apple-macbook-pro-touch-bar-mvvl2-16-inch-intel-core-i7-512-gb-zilver.md": {
	id: "apple-macbook-pro-touch-bar-mvvl2-16-inch-intel-core-i7-512-gb-zilver.md";
  slug: "apple-macbook-pro-touch-bar-mvvl2-16-inch-intel-core-i7-512-gb-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"aspire-3-a315-56-58wy-laptop-qwerty-256gb-i5-15-6.md": {
	id: "aspire-3-a315-56-58wy-laptop-qwerty-256gb-i5-15-6.md";
  slug: "aspire-3-a315-56-58wy-laptop-qwerty-256gb-i5-15-6";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"aspire-vero-av15-51-7739-1714290.md": {
	id: "aspire-vero-av15-51-7739-1714290.md";
  slug: "aspire-vero-av15-51-7739-1714290";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-15-6-fullhd-laptop-x515ea-intel-core-i5-1135g7-8gb-ram-512gb-ssd-windows-11-pro.md": {
	id: "asus-15-6-fullhd-laptop-x515ea-intel-core-i5-1135g7-8gb-ram-512gb-ssd-windows-11-pro.md";
  slug: "asus-15-6-fullhd-laptop-x515ea-intel-core-i5-1135g7-8gb-ram-512gb-ssd-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-15-6-inch-laptop-ryzen-7-8gb-ram-1000gb-ssd.md": {
	id: "asus-15-6-inch-laptop-ryzen-7-8gb-ram-1000gb-ssd.md";
  slug: "asus-15-6-inch-laptop-ryzen-7-8gb-ram-1000gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-15-inch-laptop-ryzen-5-8gb-ram-512gb-ssd.md": {
	id: "asus-15-inch-laptop-ryzen-5-8gb-ram-512gb-ssd.md";
  slug: "asus-15-inch-laptop-ryzen-5-8gb-ram-512gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-expertbook-15-6-f-hd-i5-1135g7-8gb-512gb-w11p.md": {
	id: "asus-expertbook-15-6-f-hd-i5-1135g7-8gb-512gb-w11p.md";
  slug: "asus-expertbook-15-6-f-hd-i5-1135g7-8gb-512gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-expertbook-15-6-f-hd-i5-1235u-8gb-512gb-w11p.md": {
	id: "asus-expertbook-15-6-f-hd-i5-1235u-8gb-512gb-w11p.md";
  slug: "asus-expertbook-15-6-f-hd-i5-1235u-8gb-512gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-expertbook-15-6-f-hd-i7-1255u-16gb-512gb-w11p-3y.md": {
	id: "asus-expertbook-15-6-f-hd-i7-1255u-16gb-512gb-w11p-3y.md";
  slug: "asus-expertbook-15-6-f-hd-i7-1255u-16gb-512gb-w11p-3y";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-expertbook-b1-14-0-f-hd-i7-1255u-8gb-512gb-w11p.md": {
	id: "asus-expertbook-b1-14-0-f-hd-i7-1255u-8gb-512gb-w11p.md";
  slug: "asus-expertbook-b1-14-0-f-hd-i7-1255u-8gb-512gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-expertbook-b1-b1402cba-eb0205xa.md": {
	id: "asus-expertbook-b1-b1402cba-eb0205xa.md";
  slug: "asus-expertbook-b1-b1402cba-eb0205xa";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-expertbook-b1-b1402cba-eb0381x-intel-core-i5-35-6-cm-1920-x-1080-pixels-8-gb-256-gb-windows-11-pro.md": {
	id: "asus-expertbook-b1-b1402cba-eb0381x-intel-core-i5-35-6-cm-1920-x-1080-pixels-8-gb-256-gb-windows-11-pro.md";
  slug: "asus-expertbook-b1-b1402cba-eb0381x-intel-core-i5-35-6-cm-1920-x-1080-pixels-8-gb-256-gb-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-expertbook-b1-b1402cba-eb0636xa-intel-core-i5-1-3-ghz-35-6-cm-1920-x-1080-pixels-8-gb-256-gb.md": {
	id: "asus-expertbook-b1-b1402cba-eb0636xa-intel-core-i5-1-3-ghz-35-6-cm-1920-x-1080-pixels-8-gb-256-gb.md";
  slug: "asus-expertbook-b1-b1402cba-eb0636xa-intel-core-i5-1-3-ghz-35-6-cm-1920-x-1080-pixels-8-gb-256-gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-expertbook-b1-b1500ceae-bq1884r-laptop-15-6-inch.md": {
	id: "asus-expertbook-b1-b1500ceae-bq1884r-laptop-15-6-inch.md";
  slug: "asus-expertbook-b1-b1500ceae-bq1884r-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-expertbook-b1-b1502cba-bq0295x-laptop-15-6-full-hd-intel-core-i5-1235u-iris-xe-graphics-8-gb-ddr4-256-gb-ssd-windows-11-pro-tsb-qwerty.md": {
	id: "asus-expertbook-b1-b1502cba-bq0295x-laptop-15-6-full-hd-intel-core-i5-1235u-iris-xe-graphics-8-gb-ddr4-256-gb-ssd-windows-11-pro-tsb-qwerty.md";
  slug: "asus-expertbook-b1-b1502cba-bq0295x-laptop-15-6-full-hd-intel-core-i5-1235u-iris-xe-graphics-8-gb-ddr4-256-gb-ssd-windows-11-pro-tsb-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-expertbook-b1-b1502cba-bq0297x-i7-1255u-notebook-39-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart.md": {
	id: "asus-expertbook-b1-b1502cba-bq0297x-i7-1255u-notebook-39-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart.md";
  slug: "asus-expertbook-b1-b1502cba-bq0297x-i7-1255u-notebook-39-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-expertbook-b1502cba-bq0295x.md": {
	id: "asus-expertbook-b1502cba-bq0295x.md";
  slug: "asus-expertbook-b1502cba-bq0295x";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-expertbook-b1502cba-bq0297x.md": {
	id: "asus-expertbook-b1502cba-bq0297x.md";
  slug: "asus-expertbook-b1502cba-bq0297x";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-expertbook-b5602cba-mb0222x.md": {
	id: "asus-expertbook-b5602cba-mb0222x.md";
  slug: "asus-expertbook-b5602cba-mb0222x";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-expertbook-b9-b9400cba-kc0189x-i7-1255u-notebook-35-6-cm-full-hd-intel-core-i7-16-gb-lpddr5-sdram-1000-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "asus-expertbook-b9-b9400cba-kc0189x-i7-1255u-notebook-35-6-cm-full-hd-intel-core-i7-16-gb-lpddr5-sdram-1000-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "asus-expertbook-b9-b9400cba-kc0189x-i7-1255u-notebook-35-6-cm-full-hd-intel-core-i7-16-gb-lpddr5-sdram-1000-gb-ssd-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-expertbook-b9400cba-kc0189x.md": {
	id: "asus-expertbook-b9400cba-kc0189x.md";
  slug: "asus-expertbook-b9400cba-kc0189x";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-expertbook-b9403cva-km0158x.md": {
	id: "asus-expertbook-b9403cva-km0158x.md";
  slug: "asus-expertbook-b9403cva-km0158x";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-expertbook-p1412cea-ek0138x-14-0-f-hd-i5-1135g7-8gb-256gb-w11p.md": {
	id: "asus-expertbook-p1412cea-ek0138x-14-0-f-hd-i5-1135g7-8gb-256gb-w11p.md";
  slug: "asus-expertbook-p1412cea-ek0138x-14-0-f-hd-i5-1135g7-8gb-256gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-laptop-14-inch-fhd-i5-8gb-ram-512gb-ssd-tijdelijk-met-gratis-office-2021-pro-t-w-v-euro-199.md": {
	id: "asus-laptop-14-inch-fhd-i5-8gb-ram-512gb-ssd-tijdelijk-met-gratis-office-2021-pro-t-w-v-euro-199.md";
  slug: "asus-laptop-14-inch-fhd-i5-8gb-ram-512gb-ssd-tijdelijk-met-gratis-office-2021-pro-t-w-v-euro-199";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-m1503qa-l1048w-vivobook.md": {
	id: "asus-m1503qa-l1048w-vivobook.md";
  slug: "asus-m1503qa-l1048w-vivobook";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-notebook-x415ja-eb110t-laptop-14-inch.md": {
	id: "asus-notebook-x415ja-eb110t-laptop-14-inch.md";
  slug: "asus-notebook-x415ja-eb110t-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-proart-studiobook-h7600zm-kv037x-creator-laptop-16-inch.md": {
	id: "asus-proart-studiobook-h7600zm-kv037x-creator-laptop-16-inch.md";
  slug: "asus-proart-studiobook-h7600zm-kv037x-creator-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-taichi21-cw003h-ultrabook-touch-hybride.md": {
	id: "asus-taichi21-cw003h-ultrabook-touch-hybride.md";
  slug: "asus-taichi21-cw003h-ultrabook-touch-hybride";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-a15-fa506ihrb-hn080w-gaming-laptop-15-6-inch-144-hz.md": {
	id: "asus-tuf-a15-fa506ihrb-hn080w-gaming-laptop-15-6-inch-144-hz.md";
  slug: "asus-tuf-a15-fa506ihrb-hn080w-gaming-laptop-15-6-inch-144-hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-a17-fa707nv-hx023w-17-144hz-r7-7735hz-4060-16gb-512gb.md": {
	id: "asus-tuf-a17-fa707nv-hx023w-17-144hz-r7-7735hz-4060-16gb-512gb.md";
  slug: "asus-tuf-a17-fa707nv-hx023w-17-144hz-r7-7735hz-4060-16gb-512gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-f15-fx506hc-hn361w-gaming-laptop-15-6-inch-144-hz.md": {
	id: "asus-tuf-f15-fx506hc-hn361w-gaming-laptop-15-6-inch-144-hz.md";
  slug: "asus-tuf-f15-fx506hc-hn361w-gaming-laptop-15-6-inch-144-hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-f15-fx506hf-hn018w-gaming-laptop-15-6-inch-144hz.md": {
	id: "asus-tuf-f15-fx506hf-hn018w-gaming-laptop-15-6-inch-144hz.md";
  slug: "asus-tuf-f15-fx506hf-hn018w-gaming-laptop-15-6-inch-144hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-f15-fx507zc-hn092w-gaming-laptop-15-6-inch.md": {
	id: "asus-tuf-f15-fx507zc-hn092w-gaming-laptop-15-6-inch.md";
  slug: "asus-tuf-f15-fx507zc-hn092w-gaming-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-f15-fx507zu4-lp067w-gaming-laptop-15-6-inch.md": {
	id: "asus-tuf-f15-fx507zu4-lp067w-gaming-laptop-15-6-inch.md";
  slug: "asus-tuf-f15-fx507zu4-lp067w-gaming-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-f15-fx507zv4-lp055w-gaming-laptop-15-6-inch-144hz.md": {
	id: "asus-tuf-f15-fx507zv4-lp055w-gaming-laptop-15-6-inch-144hz.md";
  slug: "asus-tuf-f15-fx507zv4-lp055w-gaming-laptop-15-6-inch-144hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-a15-fa507nu-lp045w-15-144hz-r7-7735hs-4050-16gb-512gb.md": {
	id: "asus-tuf-gaming-a15-fa507nu-lp045w-15-144hz-r7-7735hs-4050-16gb-512gb.md";
  slug: "asus-tuf-gaming-a15-fa507nu-lp045w-15-144hz-r7-7735hs-4050-16gb-512gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-a15-fa507nu-lp045w-156-inch-144hz-amd-ryzen-7-16gb-512-gb-geforce-rtx-4050-1758003.md": {
	id: "asus-tuf-gaming-a15-fa507nu-lp045w-156-inch-144hz-amd-ryzen-7-16gb-512-gb-geforce-rtx-4050-1758003.md";
  slug: "asus-tuf-gaming-a15-fa507nu-lp045w-156-inch-144hz-amd-ryzen-7-16gb-512-gb-geforce-rtx-4050-1758003";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-a15-fa507nu-lp045w-gaming-laptop-ryzen-7-7735hs-rtx-4050-16-gb-512-gb-ssd.md": {
	id: "asus-tuf-gaming-a15-fa507nu-lp045w-gaming-laptop-ryzen-7-7735hs-rtx-4050-16-gb-512-gb-ssd.md";
  slug: "asus-tuf-gaming-a15-fa507nu-lp045w-gaming-laptop-ryzen-7-7735hs-rtx-4050-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-a15-fa507nv-lp031w-gaming-laptop-ryzen-7-7735hs-rtx-4060-16-gb-512-gb-ssd.md": {
	id: "asus-tuf-gaming-a15-fa507nv-lp031w-gaming-laptop-ryzen-7-7735hs-rtx-4060-16-gb-512-gb-ssd.md";
  slug: "asus-tuf-gaming-a15-fa507nv-lp031w-gaming-laptop-ryzen-7-7735hs-rtx-4060-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-a15-fa507nv-lp066w.md": {
	id: "asus-tuf-gaming-a15-fa507nv-lp066w.md";
  slug: "asus-tuf-gaming-a15-fa507nv-lp066w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-a15-fa507xi-lp012w-156-inch-144hz-amd-ryzen-9-16gb-512-gb-geforce-rtx-4070-1758005.md": {
	id: "asus-tuf-gaming-a15-fa507xi-lp012w-156-inch-144hz-amd-ryzen-9-16gb-512-gb-geforce-rtx-4070-1758005.md";
  slug: "asus-tuf-gaming-a15-fa507xi-lp012w-156-inch-144hz-amd-ryzen-9-16gb-512-gb-geforce-rtx-4070-1758005";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-a15-fa507xi-lp072w.md": {
	id: "asus-tuf-gaming-a15-fa507xi-lp072w.md";
  slug: "asus-tuf-gaming-a15-fa507xi-lp072w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-a15-laptop-15-ips-full-hd-bij-144-hz-amd-phoenix-r9-7940hs-nvidia-geforce-rtx-4070-16-gb-ddr5-512-gb-ssd-wi-fi-bluetooth-windows-11-home-grijs.md": {
	id: "asus-tuf-gaming-a15-laptop-15-ips-full-hd-bij-144-hz-amd-phoenix-r9-7940hs-nvidia-geforce-rtx-4070-16-gb-ddr5-512-gb-ssd-wi-fi-bluetooth-windows-11-home-grijs.md";
  slug: "asus-tuf-gaming-a15-laptop-15-ips-full-hd-bij-144-hz-amd-phoenix-r9-7940hs-nvidia-geforce-rtx-4070-16-gb-ddr5-512-gb-ssd-wi-fi-bluetooth-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-a16-advantage-edition-fa617ns-n3085w-gaming-laptop-ryzen-7-7735hs-radeon-rx-7600s-16-gb-512gb-ssd.md": {
	id: "asus-tuf-gaming-a16-advantage-edition-fa617ns-n3085w-gaming-laptop-ryzen-7-7735hs-radeon-rx-7600s-16-gb-512gb-ssd.md";
  slug: "asus-tuf-gaming-a16-advantage-edition-fa617ns-n3085w-gaming-laptop-ryzen-7-7735hs-radeon-rx-7600s-16-gb-512gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-a16-advantage-edition-fa617ns-n3085w-qwerty.md": {
	id: "asus-tuf-gaming-a16-advantage-edition-fa617ns-n3085w-qwerty.md";
  slug: "asus-tuf-gaming-a16-advantage-edition-fa617ns-n3085w-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-a16-advantage-edition-fa617ns-n3085w.md": {
	id: "asus-tuf-gaming-a16-advantage-edition-fa617ns-n3085w.md";
  slug: "asus-tuf-gaming-a16-advantage-edition-fa617ns-n3085w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-a16-fa617ns-n3085w-16-inch-165hz-amd-ryzen-7-16gb-512-gb-radeon-rx-7600s-1758006.md": {
	id: "asus-tuf-gaming-a16-fa617ns-n3085w-16-inch-165hz-amd-ryzen-7-16gb-512-gb-radeon-rx-7600s-1758006.md";
  slug: "asus-tuf-gaming-a16-fa617ns-n3085w-16-inch-165hz-amd-ryzen-7-16gb-512-gb-radeon-rx-7600s-1758006";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-a17-fa707nu-hx023w-7735hs-gaming-laptops-amd-ryzen-7-17-3-inch-full-hd-ips.md": {
	id: "asus-tuf-gaming-a17-fa707nu-hx023w-7735hs-gaming-laptops-amd-ryzen-7-17-3-inch-full-hd-ips.md";
  slug: "asus-tuf-gaming-a17-fa707nu-hx023w-7735hs-gaming-laptops-amd-ryzen-7-17-3-inch-full-hd-ips";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-a17-fa707nu-hx023w-gaming-laptop-ryzen-7-7735hs-rtx-4050-16-gb-512-gb-ssd.md": {
	id: "asus-tuf-gaming-a17-fa707nu-hx023w-gaming-laptop-ryzen-7-7735hs-rtx-4050-16-gb-512-gb-ssd.md";
  slug: "asus-tuf-gaming-a17-fa707nu-hx023w-gaming-laptop-ryzen-7-7735hs-rtx-4050-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-a17-fa707nu-hx023w.md": {
	id: "asus-tuf-gaming-a17-fa707nu-hx023w.md";
  slug: "asus-tuf-gaming-a17-fa707nu-hx023w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-a17-fa707nv-hx023w-173-inch-144hz-amd-ryzen-7-16gb-512-gb-geforce-rtx-4060-1758008.md": {
	id: "asus-tuf-gaming-a17-fa707nv-hx023w-173-inch-144hz-amd-ryzen-7-16gb-512-gb-geforce-rtx-4060-1758008.md";
  slug: "asus-tuf-gaming-a17-fa707nv-hx023w-173-inch-144hz-amd-ryzen-7-16gb-512-gb-geforce-rtx-4060-1758008";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-a17-fa707xi-ll018w-gaming-laptop-ryzen-9-7940hs-rtx-4070-16-gb-1-tb-ssd.md": {
	id: "asus-tuf-gaming-a17-fa707xi-ll018w-gaming-laptop-ryzen-9-7940hs-rtx-4070-16-gb-1-tb-ssd.md";
  slug: "asus-tuf-gaming-a17-fa707xi-ll018w-gaming-laptop-ryzen-9-7940hs-rtx-4070-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-f15-15-6-fx507ze-hn061w.md": {
	id: "asus-tuf-gaming-f15-15-6-fx507ze-hn061w.md";
  slug: "asus-tuf-gaming-f15-15-6-fx507ze-hn061w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-f15-fx507zc4-hn083w-156-inch-144hz-intel-core-i5-16gb-512-gb-geforce-rtx-3050-1758014.md": {
	id: "asus-tuf-gaming-f15-fx507zc4-hn083w-156-inch-144hz-intel-core-i5-16gb-512-gb-geforce-rtx-3050-1758014.md";
  slug: "asus-tuf-gaming-f15-fx507zc4-hn083w-156-inch-144hz-intel-core-i5-16gb-512-gb-geforce-rtx-3050-1758014";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-f15-fx507zc4-hn083w-gaming-laptop-i5-12500h-rtx-3050-16-gb-512-gb-ssd.md": {
	id: "asus-tuf-gaming-f15-fx507zc4-hn083w-gaming-laptop-i5-12500h-rtx-3050-16-gb-512-gb-ssd.md";
  slug: "asus-tuf-gaming-f15-fx507zc4-hn083w-gaming-laptop-i5-12500h-rtx-3050-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-f15-fx507zc4-hn083w-laptop-39-6-cm-full-hd-intel-core-i5-i5-12500h-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6-windows-11-home-grijs.md": {
	id: "asus-tuf-gaming-f15-fx507zc4-hn083w-laptop-39-6-cm-full-hd-intel-core-i5-i5-12500h-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6-windows-11-home-grijs.md";
  slug: "asus-tuf-gaming-f15-fx507zc4-hn083w-laptop-39-6-cm-full-hd-intel-core-i5-i5-12500h-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-f15-fx507zc4-hn172w.md": {
	id: "asus-tuf-gaming-f15-fx507zc4-hn172w.md";
  slug: "asus-tuf-gaming-f15-fx507zc4-hn172w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-tuf-gaming-f17-fx707zc4-hx071w.md": {
	id: "asus-tuf-gaming-f17-fx707zc4-hx071w.md";
  slug: "asus-tuf-gaming-f17-fx707zc4-hx071w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-14-m1402ia-eb090w-4600h-notebook-35-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md": {
	id: "asus-vivobook-14-m1402ia-eb090w-4600h-notebook-35-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md";
  slug: "asus-vivobook-14-m1402ia-eb090w-4600h-notebook-35-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-14-m1402ia-eb090w-laptop-14-full-hd-amd-ryzen-5-4600h-radeon-graphics-8-gb-ddr4-512-gb-ssd-wi-fi-5-bluetooth-4-1-windows-11-home-zilver.md": {
	id: "asus-vivobook-14-m1402ia-eb090w-laptop-14-full-hd-amd-ryzen-5-4600h-radeon-graphics-8-gb-ddr4-512-gb-ssd-wi-fi-5-bluetooth-4-1-windows-11-home-zilver.md";
  slug: "asus-vivobook-14-m1402ia-eb090w-laptop-14-full-hd-amd-ryzen-5-4600h-radeon-graphics-8-gb-ddr4-512-gb-ssd-wi-fi-5-bluetooth-4-1-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-14-m1402ia-eb168w-laptop-14-inch.md": {
	id: "asus-vivobook-14-m1402ia-eb168w-laptop-14-inch.md";
  slug: "asus-vivobook-14-m1402ia-eb168w-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-14-x415ea-eb851w.md": {
	id: "asus-vivobook-14-x415ea-eb851w.md";
  slug: "asus-vivobook-14-x415ea-eb851w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-14x-oled-k3405vf-km138w-laptop-i9-13900h-rtx-2050-16-gb-1-tb-ssd.md": {
	id: "asus-vivobook-14x-oled-k3405vf-km138w-laptop-i9-13900h-rtx-2050-16-gb-1-tb-ssd.md";
  slug: "asus-vivobook-14x-oled-k3405vf-km138w-laptop-i9-13900h-rtx-2050-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-e1504fa-l1367w-156-inch-oled-amd-ryzen-5-16gb-512-gb-1758001.md": {
	id: "asus-vivobook-15-e1504fa-l1367w-156-inch-oled-amd-ryzen-5-16gb-512-gb-1758001.md";
  slug: "asus-vivobook-15-e1504fa-l1367w-156-inch-oled-amd-ryzen-5-16gb-512-gb-1758001";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-e1504fa-nj273w.md": {
	id: "asus-vivobook-15-e1504fa-nj273w.md";
  slug: "asus-vivobook-15-e1504fa-nj273w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-e1504fa-nj460w.md": {
	id: "asus-vivobook-15-e1504fa-nj460w.md";
  slug: "asus-vivobook-15-e1504fa-nj460w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-e1504fa-nj710w.md": {
	id: "asus-vivobook-15-e1504fa-nj710w.md";
  slug: "asus-vivobook-15-e1504fa-nj710w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-i5-16gb-512.md": {
	id: "asus-vivobook-15-i5-16gb-512.md";
  slug: "asus-vivobook-15-i5-16gb-512";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-k513ea-l12840w.md": {
	id: "asus-vivobook-15-k513ea-l12840w.md";
  slug: "asus-vivobook-15-k513ea-l12840w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-m1502ia-ej153w-4600h-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md": {
	id: "asus-vivobook-15-m1502ia-ej153w-4600h-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md";
  slug: "asus-vivobook-15-m1502ia-ej153w-4600h-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-m1502ia-ej226w-laptop-15-6-inch.md": {
	id: "asus-vivobook-15-m1502ia-ej226w-laptop-15-6-inch.md";
  slug: "asus-vivobook-15-m1502ia-ej226w-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-m1502ia-ej364w-laptop-15-6-inch.md": {
	id: "asus-vivobook-15-m1502ia-ej364w-laptop-15-6-inch.md";
  slug: "asus-vivobook-15-m1502ia-ej364w-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-m1502ya-nj110w.md": {
	id: "asus-vivobook-15-m1502ya-nj110w.md";
  slug: "asus-vivobook-15-m1502ya-nj110w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-m1502ya-nj147w.md": {
	id: "asus-vivobook-15-m1502ya-nj147w.md";
  slug: "asus-vivobook-15-m1502ya-nj147w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-m1502ya-nj166w.md": {
	id: "asus-vivobook-15-m1502ya-nj166w.md";
  slug: "asus-vivobook-15-m1502ya-nj166w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-m1502ya-nj201w-15-inch-amd-ryzen-7-8-gb-512-gb-1763903.md": {
	id: "asus-vivobook-15-m1502ya-nj201w-15-inch-amd-ryzen-7-8-gb-512-gb-1763903.md";
  slug: "asus-vivobook-15-m1502ya-nj201w-15-inch-amd-ryzen-7-8-gb-512-gb-1763903";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-oled-e1504fa-l1367w.md": {
	id: "asus-vivobook-15-oled-e1504fa-l1367w.md";
  slug: "asus-vivobook-15-oled-e1504fa-l1367w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-oled-k513ea-l11993w-laptop-i5-1135g7-intel-iris-xe-graphics-16gb-512gb-ssd.md": {
	id: "asus-vivobook-15-oled-k513ea-l11993w-laptop-i5-1135g7-intel-iris-xe-graphics-16gb-512gb-ssd.md";
  slug: "asus-vivobook-15-oled-k513ea-l11993w-laptop-i5-1135g7-intel-iris-xe-graphics-16gb-512gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-oled-k513ea-l13597w-laptop-15-6-inch.md": {
	id: "asus-vivobook-15-oled-k513ea-l13597w-laptop-15-6-inch.md";
  slug: "asus-vivobook-15-oled-k513ea-l13597w-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-oled-m1505ya-l1167w-laptop-15-6-inch.md": {
	id: "asus-vivobook-15-oled-m1505ya-l1167w-laptop-15-6-inch.md";
  slug: "asus-vivobook-15-oled-m1505ya-l1167w-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-oled-m1505ya-l1167w.md": {
	id: "asus-vivobook-15-oled-m1505ya-l1167w.md";
  slug: "asus-vivobook-15-oled-m1505ya-l1167w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-oled-m1505ya-l1177w-laptop-15-6-inch.md": {
	id: "asus-vivobook-15-oled-m1505ya-l1177w-laptop-15-6-inch.md";
  slug: "asus-vivobook-15-oled-m1505ya-l1177w-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-oled-x1503za-l1163w.md": {
	id: "asus-vivobook-15-oled-x1503za-l1163w.md";
  slug: "asus-vivobook-15-oled-x1503za-l1163w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-oled-x1505za-l1282w.md": {
	id: "asus-vivobook-15-oled-x1505za-l1282w.md";
  slug: "asus-vivobook-15-oled-x1505za-l1282w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-s513ea-bn2831w-laptop-15-6-inch.md": {
	id: "asus-vivobook-15-s513ea-bn2831w-laptop-15-6-inch.md";
  slug: "asus-vivobook-15-s513ea-bn2831w-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-x1500ea-laptop-15-6-inch-intel-core-i7.md": {
	id: "asus-vivobook-15-x1500ea-laptop-15-6-inch-intel-core-i7.md";
  slug: "asus-vivobook-15-x1500ea-laptop-15-6-inch-intel-core-i7";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-x1502za-ej1632w.md": {
	id: "asus-vivobook-15-x1502za-ej1632w.md";
  slug: "asus-vivobook-15-x1502za-ej1632w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-x1505za-l1281w-15-inch-intel-core-i5-8-gb-1-tb-1763901.md": {
	id: "asus-vivobook-15-x1505za-l1281w-15-inch-intel-core-i5-8-gb-1-tb-1763901.md";
  slug: "asus-vivobook-15-x1505za-l1281w-15-inch-intel-core-i5-8-gb-1-tb-1763901";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-15-x515ea-ej3289w.md": {
	id: "asus-vivobook-15-x515ea-ej3289w.md";
  slug: "asus-vivobook-15-x515ea-ej3289w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-16-m1605ya-mb183w-16-inch-amd-ryzen-5-8-gb-256-gb-1795242.md": {
	id: "asus-vivobook-16-m1605ya-mb183w-16-inch-amd-ryzen-5-8-gb-256-gb-1795242.md";
  slug: "asus-vivobook-16-m1605ya-mb183w-16-inch-amd-ryzen-5-8-gb-256-gb-1795242";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-16-m1605ya-mb401w.md": {
	id: "asus-vivobook-16-m1605ya-mb401w.md";
  slug: "asus-vivobook-16-m1605ya-mb401w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-16-m1605ya-mb414w.md": {
	id: "asus-vivobook-16-m1605ya-mb414w.md";
  slug: "asus-vivobook-16-m1605ya-mb414w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-16-x1605va-mb183w-laptop-i9-13900h-iris-xe-graphics-16-gb-1-tb-ssd.md": {
	id: "asus-vivobook-16-x1605va-mb183w-laptop-i9-13900h-iris-xe-graphics-16-gb-1-tb-ssd.md";
  slug: "asus-vivobook-16-x1605va-mb183w-laptop-i9-13900h-iris-xe-graphics-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-16x-k3605vc-n1059w.md": {
	id: "asus-vivobook-16x-k3605vc-n1059w.md";
  slug: "asus-vivobook-16x-k3605vc-n1059w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-16x-k3605vc-n1066w-creator-laptop-16-inch.md": {
	id: "asus-vivobook-16x-k3605vc-n1066w-creator-laptop-16-inch.md";
  slug: "asus-vivobook-16x-k3605vc-n1066w-creator-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-16x-k3605vc-n1066w-laptop-i7-13700h-rtx-3050-16-gb-1-tb-ssd.md": {
	id: "asus-vivobook-16x-k3605vc-n1066w-laptop-i7-13700h-rtx-3050-16-gb-1-tb-ssd.md";
  slug: "asus-vivobook-16x-k3605vc-n1066w-laptop-i7-13700h-rtx-3050-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-16x-k3605vc-n1068w-laptop-core-i9-13900h-rtx-3050-16-gb-512-gb-ssd.md": {
	id: "asus-vivobook-16x-k3605vc-n1068w-laptop-core-i9-13900h-rtx-3050-16-gb-512-gb-ssd.md";
  slug: "asus-vivobook-16x-k3605vc-n1068w-laptop-core-i9-13900h-rtx-3050-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-16x-k3605zf-n1027w-creator-laptop-16-inch.md": {
	id: "asus-vivobook-16x-k3605zf-n1027w-creator-laptop-16-inch.md";
  slug: "asus-vivobook-16x-k3605zf-n1027w-creator-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-16x-k3605zf-n1027w.md": {
	id: "asus-vivobook-16x-k3605zf-n1027w.md";
  slug: "asus-vivobook-16x-k3605zf-n1027w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-16x-k3605zf-n1093w-creator-laptop-16-inch.md": {
	id: "asus-vivobook-16x-k3605zf-n1093w-creator-laptop-16-inch.md";
  slug: "asus-vivobook-16x-k3605zf-n1093w-creator-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-16x-k3605zf-n1200w.md": {
	id: "asus-vivobook-16x-k3605zf-n1200w.md";
  slug: "asus-vivobook-16x-k3605zf-n1200w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-16x-k3605zu-n1111w-creator-laptop-16-inch.md": {
	id: "asus-vivobook-16x-k3605zu-n1111w-creator-laptop-16-inch.md";
  slug: "asus-vivobook-16x-k3605zu-n1111w-creator-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-16x-k3605zu-n1119w.md": {
	id: "asus-vivobook-16x-k3605zu-n1119w.md";
  slug: "asus-vivobook-16x-k3605zu-n1119w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-16x-m1603qa-mb073w-amd-ryzen-7-3-2-ghz-40-6-cm-1920-x-1200-pixels-16-gb-512-gb.md": {
	id: "asus-vivobook-16x-m1603qa-mb073w-amd-ryzen-7-3-2-ghz-40-6-cm-1920-x-1200-pixels-16-gb-512-gb.md";
  slug: "asus-vivobook-16x-m1603qa-mb073w-amd-ryzen-7-3-2-ghz-40-6-cm-1920-x-1200-pixels-16-gb-512-gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-16x-m1603qa-mb073w-laptop-ryzen-7-5800h-radeon-graphics-16-gb-512-gb-ssd.md": {
	id: "asus-vivobook-16x-m1603qa-mb073w-laptop-ryzen-7-5800h-radeon-graphics-16-gb-512-gb-ssd.md";
  slug: "asus-vivobook-16x-m1603qa-mb073w-laptop-ryzen-7-5800h-radeon-graphics-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-17-m1702qa-au007w-17-3-full-hd-ryzen-5-5600h-8gb-512gb-ssd-windows-11-home-blauw.md": {
	id: "asus-vivobook-17-m1702qa-au007w-17-3-full-hd-ryzen-5-5600h-8gb-512gb-ssd-windows-11-home-blauw.md";
  slug: "asus-vivobook-17-m1702qa-au007w-17-3-full-hd-ryzen-5-5600h-8gb-512gb-ssd-windows-11-home-blauw";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-17-m1702qa-au033w-5600h-notebook-43-9-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-blauw.md": {
	id: "asus-vivobook-17-m1702qa-au033w-5600h-notebook-43-9-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-blauw.md";
  slug: "asus-vivobook-17-m1702qa-au033w-5600h-notebook-43-9-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-blauw";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-17-m1702qa-au033w-laptop-ryzen-5-5600h-radeon-graphics-16-gb-512-gb-ssd.md": {
	id: "asus-vivobook-17-m1702qa-au033w-laptop-ryzen-5-5600h-radeon-graphics-16-gb-512-gb-ssd.md";
  slug: "asus-vivobook-17-m1702qa-au033w-laptop-ryzen-5-5600h-radeon-graphics-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-17-s712ea-bx270w-laptop-17-3-inch.md": {
	id: "asus-vivobook-17-s712ea-bx270w-laptop-17-3-inch.md";
  slug: "asus-vivobook-17-s712ea-bx270w-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-17-s712ea-bx355t-laptop-17-3-inch.md": {
	id: "asus-vivobook-17-s712ea-bx355t-laptop-17-3-inch.md";
  slug: "asus-vivobook-17-s712ea-bx355t-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-17-x1704za-au043w-173-inch-intel-core-i5-16-gb-512-gb-1764791.md": {
	id: "asus-vivobook-17-x1704za-au043w-173-inch-intel-core-i5-16-gb-512-gb-1764791.md";
  slug: "asus-vivobook-17-x1704za-au043w-173-inch-intel-core-i5-16-gb-512-gb-1764791";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-17-x1704za-au043w-intel-core-i5-1-3-ghz-43-9-cm-1920-x-1080-pixels-16-gb-512-gb.md": {
	id: "asus-vivobook-17-x1704za-au043w-intel-core-i5-1-3-ghz-43-9-cm-1920-x-1080-pixels-16-gb-512-gb.md";
  slug: "asus-vivobook-17-x1704za-au043w-intel-core-i5-1-3-ghz-43-9-cm-1920-x-1080-pixels-16-gb-512-gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-17-x1704za-au044w-intel-core-i5-1-3-ghz-43-9-cm-1920-x-1080-pixels-8-gb-512-gb.md": {
	id: "asus-vivobook-17-x1704za-au044w-intel-core-i5-1-3-ghz-43-9-cm-1920-x-1080-pixels-8-gb-512-gb.md";
  slug: "asus-vivobook-17-x1704za-au044w-intel-core-i5-1-3-ghz-43-9-cm-1920-x-1080-pixels-8-gb-512-gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-17-x1704za-au044w.md": {
	id: "asus-vivobook-17-x1704za-au044w.md";
  slug: "asus-vivobook-17-x1704za-au044w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-17-x1704za-au045w-laptop-17-3-inch.md": {
	id: "asus-vivobook-17-x1704za-au045w-laptop-17-3-inch.md";
  slug: "asus-vivobook-17-x1704za-au045w-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-17-x1704za-au045w-laptop-core-i7-1255u-iris-xe-graphics-16-gb-1-tb-ssd.md": {
	id: "asus-vivobook-17-x1704za-au045w-laptop-core-i7-1255u-iris-xe-graphics-16-gb-1-tb-ssd.md";
  slug: "asus-vivobook-17-x1704za-au045w-laptop-core-i7-1255u-iris-xe-graphics-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-17-x1704za-au045w.md": {
	id: "asus-vivobook-17-x1704za-au045w.md";
  slug: "asus-vivobook-17-x1704za-au045w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-17-x1704za-au053w-intel-core-i7-1-7-ghz-43-9-cm-1920-x-1080-pixels-16-gb-512-gb.md": {
	id: "asus-vivobook-17-x1704za-au053w-intel-core-i7-1-7-ghz-43-9-cm-1920-x-1080-pixels-16-gb-512-gb.md";
  slug: "asus-vivobook-17-x1704za-au053w-intel-core-i7-1-7-ghz-43-9-cm-1920-x-1080-pixels-16-gb-512-gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-17-x712ea-au598w.md": {
	id: "asus-vivobook-17-x712ea-au598w.md";
  slug: "asus-vivobook-17-x712ea-au598w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-17-x712ea-au698w-laptop-17-3-inch.md": {
	id: "asus-vivobook-17-x712ea-au698w-laptop-17-3-inch.md";
  slug: "asus-vivobook-17-x712ea-au698w-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-17x-m3704ya-au042w-173-inch-amd-ryzen-7-16-gb-1-tb-1795240.md": {
	id: "asus-vivobook-17x-m3704ya-au042w-173-inch-amd-ryzen-7-16-gb-1-tb-1795240.md";
  slug: "asus-vivobook-17x-m3704ya-au042w-173-inch-amd-ryzen-7-16-gb-1-tb-1795240";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-17x-m3704ya-au075w-laptop-r5-7530u-radeon-graphics-16-gb-512-gb-ssd.md": {
	id: "asus-vivobook-17x-m3704ya-au075w-laptop-r5-7530u-radeon-graphics-16-gb-512-gb-ssd.md";
  slug: "asus-vivobook-17x-m3704ya-au075w-laptop-r5-7530u-radeon-graphics-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-f512da-15-inch-full-hd-amd-ryzen-5-quad-core-8gb-ram-256gb-ssd-tijdelijk-incl-office-2019-home-student-t-w-v-euro-149.md": {
	id: "asus-vivobook-f512da-15-inch-full-hd-amd-ryzen-5-quad-core-8gb-ram-256gb-ssd-tijdelijk-incl-office-2019-home-student-t-w-v-euro-149.md";
  slug: "asus-vivobook-f512da-15-inch-full-hd-amd-ryzen-5-quad-core-8gb-ram-256gb-ssd-tijdelijk-incl-office-2019-home-student-t-w-v-euro-149";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-flip-14-tn3402ya-lz083w.md": {
	id: "asus-vivobook-flip-14-tn3402ya-lz083w.md";
  slug: "asus-vivobook-flip-14-tn3402ya-lz083w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-go-14-e1404fa-nk002w-14-inch-amd-ryzen-5-8-gb-512-gb-1763902.md": {
	id: "asus-vivobook-go-14-e1404fa-nk002w-14-inch-amd-ryzen-5-8-gb-512-gb-1763902.md";
  slug: "asus-vivobook-go-14-e1404fa-nk002w-14-inch-amd-ryzen-5-8-gb-512-gb-1763902";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-go-14-e1404fa-nk004w.md": {
	id: "asus-vivobook-go-14-e1404fa-nk004w.md";
  slug: "asus-vivobook-go-14-e1404fa-nk004w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-go-e1504fa-nj304w-laptop-15-6-inch.md": {
	id: "asus-vivobook-go-e1504fa-nj304w-laptop-15-6-inch.md";
  slug: "asus-vivobook-go-e1504fa-nj304w-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-go-e1504fa-nj460w-amd-ryzen-5-2-8-ghz-39-6-cm-1920-x-1080-pixels-8-gb-256-gb.md": {
	id: "asus-vivobook-go-e1504fa-nj460w-amd-ryzen-5-2-8-ghz-39-6-cm-1920-x-1080-pixels-8-gb-256-gb.md";
  slug: "asus-vivobook-go-e1504fa-nj460w-amd-ryzen-5-2-8-ghz-39-6-cm-1920-x-1080-pixels-8-gb-256-gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-k3605zu-mx109w-creator-laptop-16-inch.md": {
	id: "asus-vivobook-k3605zu-mx109w-creator-laptop-16-inch.md";
  slug: "asus-vivobook-k3605zu-mx109w-creator-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-m1605ya-mb451w-laptop-16-inch.md": {
	id: "asus-vivobook-m1605ya-mb451w-laptop-16-inch.md";
  slug: "asus-vivobook-m1605ya-mb451w-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-14-k3405vf-km096w-14-inch-intel-core-i9-8-gb-1-tb-geforce-rtx-2050-1763899.md": {
	id: "asus-vivobook-pro-14-k3405vf-km096w-14-inch-intel-core-i9-8-gb-1-tb-geforce-rtx-2050-1763899.md";
  slug: "asus-vivobook-pro-14-k3405vf-km096w-14-inch-intel-core-i9-8-gb-1-tb-geforce-rtx-2050-1763899";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-14-oled-k6400zc-km121w-i7-12650h-notebook-35-6-cm-2-8k-intel-core-i7-16-gb-lpddr5-sdram-512-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6e-windows-11-home-zilver.md": {
	id: "asus-vivobook-pro-14-oled-k6400zc-km121w-i7-12650h-notebook-35-6-cm-2-8k-intel-core-i7-16-gb-lpddr5-sdram-512-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6e-windows-11-home-zilver.md";
  slug: "asus-vivobook-pro-14-oled-k6400zc-km121w-i7-12650h-notebook-35-6-cm-2-8k-intel-core-i7-16-gb-lpddr5-sdram-512-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6e-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-14-oled-m3401qc-km180w-creator-laptop-14-inch.md": {
	id: "asus-vivobook-pro-14-oled-m3401qc-km180w-creator-laptop-14-inch.md";
  slug: "asus-vivobook-pro-14-oled-m3401qc-km180w-creator-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-14-x-laptop-14-5-2-8k-oled-intel-core-i9-12900h-nvidia-geforce-rtx-3050-ti-32-gb-ram-1-tb-ssd-wi-fi-6e-bluetooth-5-0-windows-11-zwart.md": {
	id: "asus-vivobook-pro-14-x-laptop-14-5-2-8k-oled-intel-core-i9-12900h-nvidia-geforce-rtx-3050-ti-32-gb-ram-1-tb-ssd-wi-fi-6e-bluetooth-5-0-windows-11-zwart.md";
  slug: "asus-vivobook-pro-14-x-laptop-14-5-2-8k-oled-intel-core-i9-12900h-nvidia-geforce-rtx-3050-ti-32-gb-ram-1-tb-ssd-wi-fi-6e-bluetooth-5-0-windows-11-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-14x-n7401ze-m9101w-1751799.md": {
	id: "asus-vivobook-pro-14x-n7401ze-m9101w-1751799.md";
  slug: "asus-vivobook-pro-14x-n7401ze-m9101w-1751799";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-14x-oled-n7400pc-km010w-i7-11370h-notebook-35-6-cm-intel-core-i7-16-gb-ddr4-sdram-1000-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6-windows-11-home-zilver.md": {
	id: "asus-vivobook-pro-14x-oled-n7400pc-km010w-i7-11370h-notebook-35-6-cm-intel-core-i7-16-gb-ddr4-sdram-1000-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6-windows-11-home-zilver.md";
  slug: "asus-vivobook-pro-14x-oled-n7400pc-km010w-i7-11370h-notebook-35-6-cm-intel-core-i7-16-gb-ddr4-sdram-1000-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-15-m6500qc-hn071w-laptop-ryzen-7-5800h-rtx-3050-16-gb-512-gb-ssd.md": {
	id: "asus-vivobook-pro-15-m6500qc-hn071w-laptop-ryzen-7-5800h-rtx-3050-16-gb-512-gb-ssd.md";
  slug: "asus-vivobook-pro-15-m6500qc-hn071w-laptop-ryzen-7-5800h-rtx-3050-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-15-m6500qc-hn071w.md": {
	id: "asus-vivobook-pro-15-m6500qc-hn071w.md";
  slug: "asus-vivobook-pro-15-m6500qc-hn071w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-15-m6500qc-hn120w-creator-laptop-15-6-inch.md": {
	id: "asus-vivobook-pro-15-m6500qc-hn120w-creator-laptop-15-6-inch.md";
  slug: "asus-vivobook-pro-15-m6500qc-hn120w-creator-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-15-oled-k3500ph-l1123w-i5-11300h-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-gtx-1650-max-q-wi-fi-6-windows-11-home-zilver.md": {
	id: "asus-vivobook-pro-15-oled-k3500ph-l1123w-i5-11300h-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-gtx-1650-max-q-wi-fi-6-windows-11-home-zilver.md";
  slug: "asus-vivobook-pro-15-oled-k3500ph-l1123w-i5-11300h-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-gtx-1650-max-q-wi-fi-6-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-15-oled-m6500qc-l1031w-laptop-15-6-amd-ryzen-7-5800h-nvidia-geforce-rtx-3050-16-gb-ram-512-gb-ssd-wi-fi-6-bluetooth-5-0-windows-11-home-blauw.md": {
	id: "asus-vivobook-pro-15-oled-m6500qc-l1031w-laptop-15-6-amd-ryzen-7-5800h-nvidia-geforce-rtx-3050-16-gb-ram-512-gb-ssd-wi-fi-6-bluetooth-5-0-windows-11-home-blauw.md";
  slug: "asus-vivobook-pro-15-oled-m6500qc-l1031w-laptop-15-6-amd-ryzen-7-5800h-nvidia-geforce-rtx-3050-16-gb-ram-512-gb-ssd-wi-fi-6-bluetooth-5-0-windows-11-home-blauw";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-16-k3605vu-n1082w-16-inch-intel-core-i9-16-gb-1-tb-geforce-rtx-4050-1763900.md": {
	id: "asus-vivobook-pro-16-k3605vu-n1082w-16-inch-intel-core-i9-16-gb-1-tb-geforce-rtx-4050-1763900.md";
  slug: "asus-vivobook-pro-16-k3605vu-n1082w-16-inch-intel-core-i9-16-gb-1-tb-geforce-rtx-4050-1763900";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-16-k3605zf-n1027w-16-inch-intel-core-i5-16-gb-512-gb-geforce-rtx-2050-1763897.md": {
	id: "asus-vivobook-pro-16-k3605zf-n1027w-16-inch-intel-core-i5-16-gb-512-gb-geforce-rtx-2050-1763897.md";
  slug: "asus-vivobook-pro-16-k3605zf-n1027w-16-inch-intel-core-i5-16-gb-512-gb-geforce-rtx-2050-1763897";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-16-k6602zc-mb100w-i7-12650h-notebook-40-6-cm-wuxga-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6e-windows-11-home-zilver.md": {
	id: "asus-vivobook-pro-16-k6602zc-mb100w-i7-12650h-notebook-40-6-cm-wuxga-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6e-windows-11-home-zilver.md";
  slug: "asus-vivobook-pro-16-k6602zc-mb100w-i7-12650h-notebook-40-6-cm-wuxga-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6e-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-16-k6602zc-n1107w-i7-12650h-notebook-40-6-cm-wuxga-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6e-windows-11-home-zilver.md": {
	id: "asus-vivobook-pro-16-k6602zc-n1107w-i7-12650h-notebook-40-6-cm-wuxga-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6e-windows-11-home-zilver.md";
  slug: "asus-vivobook-pro-16-k6602zc-n1107w-i7-12650h-notebook-40-6-cm-wuxga-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6e-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-16x-m7601rm-k8092w-6900hx-notebook-40-6-cm-wqxga-amd-ryzen-9-16-gb-lpddr5-sdram-1000-gb-ssd-nvidia-geforce-rtx-3060-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "asus-vivobook-pro-16x-m7601rm-k8092w-6900hx-notebook-40-6-cm-wqxga-amd-ryzen-9-16-gb-lpddr5-sdram-1000-gb-ssd-nvidia-geforce-rtx-3060-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "asus-vivobook-pro-16x-m7601rm-k8092w-6900hx-notebook-40-6-cm-wqxga-amd-ryzen-9-16-gb-lpddr5-sdram-1000-gb-ssd-nvidia-geforce-rtx-3060-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-16x-m7601rm-k8092w-laptop-ryzen-9-6900hx-rtx-3060-32-gb-1-tb-ssd-2-5-gb-lan.md": {
	id: "asus-vivobook-pro-16x-m7601rm-k8092w-laptop-ryzen-9-6900hx-rtx-3060-32-gb-1-tb-ssd-2-5-gb-lan.md";
  slug: "asus-vivobook-pro-16x-m7601rm-k8092w-laptop-ryzen-9-6900hx-rtx-3060-32-gb-1-tb-ssd-2-5-gb-lan";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-16x-n7600pc-kv034w-16-inch.md": {
	id: "asus-vivobook-pro-16x-n7600pc-kv034w-16-inch.md";
  slug: "asus-vivobook-pro-16x-n7600pc-kv034w-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-16x-n7600pc-kv205w-creator-laptop-16-inch-120-hz.md": {
	id: "asus-vivobook-pro-16x-n7600pc-kv205w-creator-laptop-16-inch-120-hz.md";
  slug: "asus-vivobook-pro-16x-n7600pc-kv205w-creator-laptop-16-inch-120-hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-pro-16x-n7601zm-k8234w.md": {
	id: "asus-vivobook-pro-16x-n7601zm-k8234w.md";
  slug: "asus-vivobook-pro-16x-n7601zm-k8234w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-s-14-flip-tn3402qa-lz009w-2-in-1-laptop-14-inch.md": {
	id: "asus-vivobook-s-14-flip-tn3402qa-lz009w-2-in-1-laptop-14-inch.md";
  slug: "asus-vivobook-s-14-flip-tn3402qa-lz009w-2-in-1-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-s14-s433ea-am217t-ddr4-sdram-notebook-35-6-cm-1920-x-1080-pixels-intel-11de-generatie-core-i5-8-gb-512-gb-ssd-wi-fi-6-windows-10-home-groen.md": {
	id: "asus-vivobook-s14-s433ea-am217t-ddr4-sdram-notebook-35-6-cm-1920-x-1080-pixels-intel-11de-generatie-core-i5-8-gb-512-gb-ssd-wi-fi-6-windows-10-home-groen.md";
  slug: "asus-vivobook-s14-s433ea-am217t-ddr4-sdram-notebook-35-6-cm-1920-x-1080-pixels-intel-11de-generatie-core-i5-8-gb-512-gb-ssd-wi-fi-6-windows-10-home-groen";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-s15-s530fn-ej086t-notebook-39-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-mx150-wi-fi-5-windows-10-home-goud.md": {
	id: "asus-vivobook-s15-s530fn-ej086t-notebook-39-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-mx150-wi-fi-5-windows-10-home-goud.md";
  slug: "asus-vivobook-s15-s530fn-ej086t-notebook-39-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-mx150-wi-fi-5-windows-10-home-goud";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-vivobook-x1605va-mb183w.md": {
	id: "asus-vivobook-x1605va-mb183w.md";
  slug: "asus-vivobook-x1605va-mb183w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-x1505za-l1038w-laptop-15-6-full-hd-oled-intel-core-i5-1235u-uhd-graphics-16-gb-ddr4-512-gb-ssd-windows-11-home.md": {
	id: "asus-x1505za-l1038w-laptop-15-6-full-hd-oled-intel-core-i5-1235u-uhd-graphics-16-gb-ddr4-512-gb-ssd-windows-11-home.md";
  slug: "asus-x1505za-l1038w-laptop-15-6-full-hd-oled-intel-core-i5-1235u-uhd-graphics-16-gb-ddr4-512-gb-ssd-windows-11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-x415ea-eb2172w-laptop-14-inch.md": {
	id: "asus-x415ea-eb2172w-laptop-14-inch.md";
  slug: "asus-x415ea-eb2172w-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-x415ea-eb2174w-laptop-14-inch.md": {
	id: "asus-x415ea-eb2174w-laptop-14-inch.md";
  slug: "asus-x415ea-eb2174w-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-x415ea-eb2178w-14-i5-1135g7-8gb-512gb-w11.md": {
	id: "asus-x415ea-eb2178w-14-i5-1135g7-8gb-512gb-w11.md";
  slug: "asus-x415ea-eb2178w-14-i5-1135g7-8gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-x415ea-eb2195w.md": {
	id: "asus-x415ea-eb2195w.md";
  slug: "asus-x415ea-eb2195w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-x415ea-eb851w-14-inch-laptop.md": {
	id: "asus-x415ea-eb851w-14-inch-laptop.md";
  slug: "asus-x415ea-eb851w-14-inch-laptop";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-x415ea-eb918w-laptop-14-inch.md": {
	id: "asus-x415ea-eb918w-laptop-14-inch.md";
  slug: "asus-x415ea-eb918w-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-x515-x515ea-ej4325w-156-inch-intel-core-i5-16-gb-512-gb-1795241.md": {
	id: "asus-x515-x515ea-ej4325w-156-inch-intel-core-i5-16-gb-512-gb-1795241.md";
  slug: "asus-x515-x515ea-ej4325w-156-inch-intel-core-i5-16-gb-512-gb-1795241";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-x515ea-bq1341w-laptop-15-6-inch.md": {
	id: "asus-x515ea-bq1341w-laptop-15-6-inch.md";
  slug: "asus-x515ea-bq1341w-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-x515ea-bq3081-15-6-full-hd-i5-1135g7-8gb-512-ssd-windows-11-pro.md": {
	id: "asus-x515ea-bq3081-15-6-full-hd-i5-1135g7-8gb-512-ssd-windows-11-pro.md";
  slug: "asus-x515ea-bq3081-15-6-full-hd-i5-1135g7-8gb-512-ssd-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-x515ea-ej2447-15-6-fhd-i3-8gb-ddr4-256gb-m-2-ssd-w11-pro.md": {
	id: "asus-x515ea-ej2447-15-6-fhd-i3-8gb-ddr4-256gb-m-2-ssd-w11-pro.md";
  slug: "asus-x515ea-ej2447-15-6-fhd-i3-8gb-ddr4-256gb-m-2-ssd-w11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-x515ea-ej3288w-laptop-15-6-inch.md": {
	id: "asus-x515ea-ej3288w-laptop-15-6-inch.md";
  slug: "asus-x515ea-ej3288w-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-x515ea-ej3289w-laptop-15-6-inch.md": {
	id: "asus-x515ea-ej3289w-laptop-15-6-inch.md";
  slug: "asus-x515ea-ej3289w-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-x515ea-ej4051w-15-i5-1135g7-8gb-512gb-w11.md": {
	id: "asus-x515ea-ej4051w-15-i5-1135g7-8gb-512gb-w11.md";
  slug: "asus-x515ea-ej4051w-15-i5-1135g7-8gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-x515ea-ej4137w.md": {
	id: "asus-x515ea-ej4137w.md";
  slug: "asus-x515ea-ej4137w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-x515ea-laptop-15-6-inch-core-i5-windows-11-pro.md": {
	id: "asus-x515ea-laptop-15-6-inch-core-i5-windows-11-pro.md";
  slug: "asus-x515ea-laptop-15-6-inch-core-i5-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-14-oled-ux3402va-km157w-laptop-14-wqxga-intel-core-i7-1360p-iris-xe-graphics-16-gb-lpddr5-sdram-1-tb-ssd-wi-fi-6e-bluetooth-5-0-windows-11-home-blauw.md": {
	id: "asus-zenbook-14-oled-ux3402va-km157w-laptop-14-wqxga-intel-core-i7-1360p-iris-xe-graphics-16-gb-lpddr5-sdram-1-tb-ssd-wi-fi-6e-bluetooth-5-0-windows-11-home-blauw.md";
  slug: "asus-zenbook-14-oled-ux3402va-km157w-laptop-14-wqxga-intel-core-i7-1360p-iris-xe-graphics-16-gb-lpddr5-sdram-1-tb-ssd-wi-fi-6e-bluetooth-5-0-windows-11-home-blauw";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-14-oled-ux3402va-km157w-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd.md": {
	id: "asus-zenbook-14-oled-ux3402va-km157w-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd.md";
  slug: "asus-zenbook-14-oled-ux3402va-km157w-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-14-oled-ux3402va.md": {
	id: "asus-zenbook-14-oled-ux3402va.md";
  slug: "asus-zenbook-14-oled-ux3402va";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-14-um3402ya-kp376w.md": {
	id: "asus-zenbook-14-um3402ya-kp376w.md";
  slug: "asus-zenbook-14-um3402ya-kp376w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-14-um3402ya-kp504w-14-inch-amd-ryzen-7-16-gb-512-gb-1763896.md": {
	id: "asus-zenbook-14-um3402ya-kp504w-14-inch-amd-ryzen-7-16-gb-512-gb-1763896.md";
  slug: "asus-zenbook-14-um3402ya-kp504w-14-inch-amd-ryzen-7-16-gb-512-gb-1763896";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-14-um3402ya-kp640w.md": {
	id: "asus-zenbook-14-um3402ya-kp640w.md";
  slug: "asus-zenbook-14-um3402ya-kp640w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-14-um3402ya-kp703w.md": {
	id: "asus-zenbook-14-um3402ya-kp703w.md";
  slug: "asus-zenbook-14-um3402ya-kp703w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-14-ux3402va-kp311w.md": {
	id: "asus-zenbook-14-ux3402va-kp311w.md";
  slug: "asus-zenbook-14-ux3402va-kp311w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-14-ux5401ea-l7106w-laptop-i7-1165g7-iris-xe-graphics-1-tb-ssd-16-gb.md": {
	id: "asus-zenbook-14-ux5401ea-l7106w-laptop-i7-1165g7-iris-xe-graphics-1-tb-ssd-16-gb.md";
  slug: "asus-zenbook-14-ux5401ea-l7106w-laptop-i7-1165g7-iris-xe-graphics-1-tb-ssd-16-gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-14x-oled-ux3404vc-m9026w-creator-laptop-14-inch.md": {
	id: "asus-zenbook-14x-oled-ux3404vc-m9026w-creator-laptop-14-inch.md";
  slug: "asus-zenbook-14x-oled-ux3404vc-m9026w-creator-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-14x-oled-ux3404vc-m9026w-laptop-i9-13900h-rtx-3050-32-gb-1-tb-ssd.md": {
	id: "asus-zenbook-14x-oled-ux3404vc-m9026w-laptop-i9-13900h-rtx-3050-32-gb-1-tb-ssd.md";
  slug: "asus-zenbook-14x-oled-ux3404vc-m9026w-laptop-i9-13900h-rtx-3050-32-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-14x-oled-ux5401ea-l7106w.md": {
	id: "asus-zenbook-14x-oled-ux5401ea-l7106w.md";
  slug: "asus-zenbook-14x-oled-ux5401ea-l7106w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-14x-oled-ux5401za-l7016w-laptop-14-inch.md": {
	id: "asus-zenbook-14x-oled-ux5401za-l7016w-laptop-14-inch.md";
  slug: "asus-zenbook-14x-oled-ux5401za-l7016w-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-15-oled-um3504da-ma204w-laptop-15-6-inch.md": {
	id: "asus-zenbook-15-oled-um3504da-ma204w-laptop-15-6-inch.md";
  slug: "asus-zenbook-15-oled-um3504da-ma204w-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-17-fold-oled-ux9702aa-md018w-2-in-1-laptop-17-3-inch.md": {
	id: "asus-zenbook-17-fold-oled-ux9702aa-md018w-2-in-1-laptop-17-3-inch.md";
  slug: "asus-zenbook-17-fold-oled-ux9702aa-md018w-2-in-1-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-oled-um3504da-ma204w.md": {
	id: "asus-zenbook-oled-um3504da-ma204w.md";
  slug: "asus-zenbook-oled-um3504da-ma204w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-pro-14-oled-ux6404vv-p4046w-145-inch-intel-core-i9-32-gb-1-tb-nvidia-geforce-rtx-4060-1764798.md": {
	id: "asus-zenbook-pro-14-oled-ux6404vv-p4046w-145-inch-intel-core-i9-32-gb-1-tb-nvidia-geforce-rtx-4060-1764798.md";
  slug: "asus-zenbook-pro-14-oled-ux6404vv-p4046w-145-inch-intel-core-i9-32-gb-1-tb-nvidia-geforce-rtx-4060-1764798";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-pro-14-oled-ux6404vv-p4046w-creator-laptop-14-5-inch.md": {
	id: "asus-zenbook-pro-14-oled-ux6404vv-p4046w-creator-laptop-14-5-inch.md";
  slug: "asus-zenbook-pro-14-oled-ux6404vv-p4046w-creator-laptop-14-5-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-pro-17-um6702ra-m2014w-laptop-ryzen-7-6800h-amd-radeon-680m-16-gb-1-tb-ssd.md": {
	id: "asus-zenbook-pro-17-um6702ra-m2014w-laptop-ryzen-7-6800h-amd-radeon-680m-16-gb-1-tb-ssd.md";
  slug: "asus-zenbook-pro-17-um6702ra-m2014w-laptop-ryzen-7-6800h-amd-radeon-680m-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-pro-17-um6702ra-m2014w.md": {
	id: "asus-zenbook-pro-17-um6702ra-m2014w.md";
  slug: "asus-zenbook-pro-17-um6702ra-m2014w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-pro-17-um6702rc-m2060w-creator-laptop-17-3-inch.md": {
	id: "asus-zenbook-pro-17-um6702rc-m2060w-creator-laptop-17-3-inch.md";
  slug: "asus-zenbook-pro-17-um6702rc-m2060w-creator-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-pro-oled-ux6404vv-p4046w.md": {
	id: "asus-zenbook-pro-oled-ux6404vv-p4046w.md";
  slug: "asus-zenbook-pro-oled-ux6404vv-p4046w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-s-13-oled-ux5304va-nq075w-laptop-13-3-inch.md": {
	id: "asus-zenbook-s-13-oled-ux5304va-nq075w-laptop-13-3-inch.md";
  slug: "asus-zenbook-s-13-oled-ux5304va-nq075w-laptop-13-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-s-13-oled-ux5304va-nq075w-laptop-i7-1355u-iris-xe-graphics-16-gb-1-tb-ssd.md": {
	id: "asus-zenbook-s-13-oled-ux5304va-nq075w-laptop-i7-1355u-iris-xe-graphics-16-gb-1-tb-ssd.md";
  slug: "asus-zenbook-s-13-oled-ux5304va-nq075w-laptop-i7-1355u-iris-xe-graphics-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-s-oled-ux5304va-nq075w.md": {
	id: "asus-zenbook-s-oled-ux5304va-nq075w.md";
  slug: "asus-zenbook-s-oled-ux5304va-nq075w";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"asus-zenbook-ux425ea-ki599w-14-inch-intel-core-i5-16gb-512-gb-1758052.md": {
	id: "asus-zenbook-ux425ea-ki599w-14-inch-intel-core-i5-16gb-512-gb-1758052.md";
  slug: "asus-zenbook-ux425ea-ki599w-14-inch-intel-core-i5-16gb-512-gb-1758052";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"conceptd-3-cn316-73g-78k7.md": {
	id: "conceptd-3-cn316-73g-78k7.md";
  slug: "conceptd-3-cn316-73g-78k7";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-15-6-fhd-120hz-ryzen5-5625u-256gb-gb-16-gb-ddr4-vingerafdruklezer-gezichtsherkenning-windows-11-pro-2-jaar-garantie.md": {
	id: "dell-15-6-fhd-120hz-ryzen5-5625u-256gb-gb-16-gb-ddr4-vingerafdruklezer-gezichtsherkenning-windows-11-pro-2-jaar-garantie.md";
  slug: "dell-15-6-fhd-120hz-ryzen5-5625u-256gb-gb-16-gb-ddr4-vingerafdruklezer-gezichtsherkenning-windows-11-pro-2-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-15-6-fhd-120hz-ryzen5-5625u-256gb-gb-8-gb-ddr4-vingerafdruklezer-gezichtsherkenning-windows-11-pro-2-jaar-garantie.md": {
	id: "dell-15-6-fhd-120hz-ryzen5-5625u-256gb-gb-8-gb-ddr4-vingerafdruklezer-gezichtsherkenning-windows-11-pro-2-jaar-garantie.md";
  slug: "dell-15-6-fhd-120hz-ryzen5-5625u-256gb-gb-8-gb-ddr4-vingerafdruklezer-gezichtsherkenning-windows-11-pro-2-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-3525-15-6-fullhd-laptop-ryzen-5-5625u-8gb-256gb-ssd-windows-11-pro.md": {
	id: "dell-3525-15-6-fullhd-laptop-ryzen-5-5625u-8gb-256gb-ssd-windows-11-pro.md";
  slug: "dell-3525-15-6-fullhd-laptop-ryzen-5-5625u-8gb-256gb-ssd-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-inspiron-3511-core-i5-1135g7-8gb-256gb-ssd-15-6-fhd-black-w11-home-qwerty.md": {
	id: "dell-inspiron-3511-core-i5-1135g7-8gb-256gb-ssd-15-6-fhd-black-w11-home-qwerty.md";
  slug: "dell-inspiron-3511-core-i5-1135g7-8gb-256gb-ssd-15-6-fhd-black-w11-home-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-inspiron-5620-core-i5-1235u-8gb-512gb-ssd-iris-xe-graphics-16-fhd-platinum-silver-w11-pro-qwerty.md": {
	id: "dell-inspiron-5620-core-i5-1235u-8gb-512gb-ssd-iris-xe-graphics-16-fhd-platinum-silver-w11-pro-qwerty.md";
  slug: "dell-inspiron-5620-core-i5-1235u-8gb-512gb-ssd-iris-xe-graphics-16-fhd-platinum-silver-w11-pro-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-inspiron-5625-amd-ryzen-7-5825u-16gb-512gb-ssd-radeon-graphics-16-fhd-platinum-silver-w11-pro-qwerty.md": {
	id: "dell-inspiron-5625-amd-ryzen-7-5825u-16gb-512gb-ssd-radeon-graphics-16-fhd-platinum-silver-w11-pro-qwerty.md";
  slug: "dell-inspiron-5625-amd-ryzen-7-5825u-16gb-512gb-ssd-radeon-graphics-16-fhd-platinum-silver-w11-pro-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-inspiron-7420-i7-1255u-2-in-1-14-touchscreen-platinum-silver-qwerty-es.md": {
	id: "dell-inspiron-7420-i7-1255u-2-in-1-14-touchscreen-platinum-silver-qwerty-es.md";
  slug: "dell-inspiron-7420-i7-1255u-2-in-1-14-touchscreen-platinum-silver-qwerty-es";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-3310-2in1-13-3-full-hd-touchscreen-laptop-i5-8265u-8gb-ddr4-256gb-ssd.md": {
	id: "dell-latitude-3310-2in1-13-3-full-hd-touchscreen-laptop-i5-8265u-8gb-ddr4-256gb-ssd.md";
  slug: "dell-latitude-3310-2in1-13-3-full-hd-touchscreen-laptop-i5-8265u-8gb-ddr4-256gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-3310-core-i5-8265u-8gb-256gb-ssd-13-fhd-2-in-1-touchscreen-silver-w10-pro-qwerty-uk.md": {
	id: "dell-latitude-3310-core-i5-8265u-8gb-256gb-ssd-13-fhd-2-in-1-touchscreen-silver-w10-pro-qwerty-uk.md";
  slug: "dell-latitude-3310-core-i5-8265u-8gb-256gb-ssd-13-fhd-2-in-1-touchscreen-silver-w10-pro-qwerty-uk";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-3420-i7-1165g7-14-fhd-zwart-qwerty-uk.md": {
	id: "dell-latitude-3420-i7-1165g7-14-fhd-zwart-qwerty-uk.md";
  slug: "dell-latitude-3420-i7-1165g7-14-fhd-zwart-qwerty-uk";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-3520-core-i5-1145g7-8gb-256gb-ssd-15-fhd-black-w11-pro-qwerty-it.md": {
	id: "dell-latitude-3520-core-i5-1145g7-8gb-256gb-ssd-15-fhd-black-w11-pro-qwerty-it.md";
  slug: "dell-latitude-3520-core-i5-1145g7-8gb-256gb-ssd-15-fhd-black-w11-pro-qwerty-it";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-3540-phm1x-laptop-i5-1335u-iris-xe-graphics-16-gb-256-gb-ssd.md": {
	id: "dell-latitude-3540-phm1x-laptop-i5-1335u-iris-xe-graphics-16-gb-256-gb-ssd.md";
  slug: "dell-latitude-3540-phm1x-laptop-i5-1335u-iris-xe-graphics-16-gb-256-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-5320-8gb-256gb-ssd-qwerty-uk.md": {
	id: "dell-latitude-5320-8gb-256gb-ssd-qwerty-uk.md";
  slug: "dell-latitude-5320-8gb-256gb-ssd-qwerty-uk";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-5320-core-i5-1135g7-8gb-256gb-ssd-13-fhd-gray-w10-pro-qwerty-es.md": {
	id: "dell-latitude-5320-core-i5-1135g7-8gb-256gb-ssd-13-fhd-gray-w10-pro-qwerty-es.md";
  slug: "dell-latitude-5320-core-i5-1135g7-8gb-256gb-ssd-13-fhd-gray-w10-pro-qwerty-es";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-5320-i5-1145g7-notebook-33-8-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-grijs.md": {
	id: "dell-latitude-5320-i5-1145g7-notebook-33-8-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-grijs.md";
  slug: "dell-latitude-5320-i5-1145g7-notebook-33-8-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-5330-i5-1235u-notebook-33-8-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-10-pro-grijs.md": {
	id: "dell-latitude-5330-i5-1235u-notebook-33-8-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-10-pro-grijs.md";
  slug: "dell-latitude-5330-i5-1235u-notebook-33-8-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-5420-core-i5-1145g7-8gb-256gb-ssd-14-fhd-gray-w11-pro-qwerty-es.md": {
	id: "dell-latitude-5420-core-i5-1145g7-8gb-256gb-ssd-14-fhd-gray-w11-pro-qwerty-es.md";
  slug: "dell-latitude-5420-core-i5-1145g7-8gb-256gb-ssd-14-fhd-gray-w11-pro-qwerty-es";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-5420-laptop-14-inch-256gb-ssd-intel-i5-windows-10-pro.md": {
	id: "dell-latitude-5420-laptop-14-inch-256gb-ssd-intel-i5-windows-10-pro.md";
  slug: "dell-latitude-5420-laptop-14-inch-256gb-ssd-intel-i5-windows-10-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-5430-i5-1235u-notebook-35-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-11-pro-grijs.md": {
	id: "dell-latitude-5430-i5-1235u-notebook-35-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-11-pro-grijs.md";
  slug: "dell-latitude-5430-i5-1235u-notebook-35-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-11-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-5430-i5-1245u-notebook-35-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-10-pro-grijs.md": {
	id: "dell-latitude-5430-i5-1245u-notebook-35-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-10-pro-grijs.md";
  slug: "dell-latitude-5430-i5-1245u-notebook-35-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-5440-intel-core-i5-35-6-cm-1920-x-1080-pixels-8-gb-256-gb-windows-11-pro.md": {
	id: "dell-latitude-5440-intel-core-i5-35-6-cm-1920-x-1080-pixels-8-gb-256-gb-windows-11-pro.md";
  slug: "dell-latitude-5440-intel-core-i5-35-6-cm-1920-x-1080-pixels-8-gb-256-gb-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-5520-i5-1145g7-15-fhd-grijs-qwerty-it.md": {
	id: "dell-latitude-5520-i5-1145g7-15-fhd-grijs-qwerty-it.md";
  slug: "dell-latitude-5520-i5-1145g7-15-fhd-grijs-qwerty-it";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-5530-i5-1245u-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-10-pro-grijs.md": {
	id: "dell-latitude-5530-i5-1245u-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-10-pro-grijs.md";
  slug: "dell-latitude-5530-i5-1245u-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-5540-intel-core-i5-39-6-cm-1920-x-1080-pixels-8-gb-256-gb-windows-11-pro.md": {
	id: "dell-latitude-5540-intel-core-i5-39-6-cm-1920-x-1080-pixels-8-gb-256-gb-windows-11-pro.md";
  slug: "dell-latitude-5540-intel-core-i5-39-6-cm-1920-x-1080-pixels-8-gb-256-gb-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-7290-core-i7-8th-gen-8gb-ram-256gb-ssd-12-5-laptop-2deha.md": {
	id: "dell-latitude-7290-core-i7-8th-gen-8gb-ram-256gb-ssd-12-5-laptop-2deha.md";
  slug: "dell-latitude-7290-core-i7-8th-gen-8gb-ram-256gb-ssd-12-5-laptop-2deha";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-7300-ddr4-sdram-notebook-33-8-cm-1920-x-1080-pixels-intel-8de-generatie-core-i5-8-gb-256-gb-ssd-wi-fi-5-windows-10-pro-zwart-zilver.md": {
	id: "dell-latitude-7300-ddr4-sdram-notebook-33-8-cm-1920-x-1080-pixels-intel-8de-generatie-core-i5-8-gb-256-gb-ssd-wi-fi-5-windows-10-pro-zwart-zilver.md";
  slug: "dell-latitude-7300-ddr4-sdram-notebook-33-8-cm-1920-x-1080-pixels-intel-8de-generatie-core-i5-8-gb-256-gb-ssd-wi-fi-5-windows-10-pro-zwart-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-7420-core-i5-1135g7-8gb-256gb-ssd-14-fhd-carbon-black-w10-pro-qwerty-it.md": {
	id: "dell-latitude-7420-core-i5-1135g7-8gb-256gb-ssd-14-fhd-carbon-black-w10-pro-qwerty-it.md";
  slug: "dell-latitude-7420-core-i5-1135g7-8gb-256gb-ssd-14-fhd-carbon-black-w10-pro-qwerty-it";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-7420-i7-1165g7-notebook-35-6-cm-full-hd-intel-core-i7-16-gb-lpddr4x-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zwart.md": {
	id: "dell-latitude-7420-i7-1165g7-notebook-35-6-cm-full-hd-intel-core-i7-16-gb-lpddr4x-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zwart.md";
  slug: "dell-latitude-7420-i7-1165g7-notebook-35-6-cm-full-hd-intel-core-i7-16-gb-lpddr4x-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-7420-laptop-14-inch.md": {
	id: "dell-latitude-7420-laptop-14-inch.md";
  slug: "dell-latitude-7420-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-7520-i5-1145g7-15-fhd-zwart-qwerty-nordic.md": {
	id: "dell-latitude-7520-i5-1145g7-15-fhd-zwart-qwerty-nordic.md";
  slug: "dell-latitude-7520-i5-1145g7-15-fhd-zwart-qwerty-nordic";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-7530-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-10-pro-zwart.md": {
	id: "dell-latitude-7530-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-10-pro-zwart.md";
  slug: "dell-latitude-7530-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-10-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-latitude-9420-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-lpddr4x-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-grijs.md": {
	id: "dell-latitude-9420-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-lpddr4x-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-grijs.md";
  slug: "dell-latitude-9420-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-lpddr4x-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-precision-3470-i7-1260p-mobiel-werkstation-35-6-cm-full-hd-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-quadro-t550-wi-fi-6e-windows-10-pro-grijs.md": {
	id: "dell-precision-3470-i7-1260p-mobiel-werkstation-35-6-cm-full-hd-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-quadro-t550-wi-fi-6e-windows-10-pro-grijs.md";
  slug: "dell-precision-3470-i7-1260p-mobiel-werkstation-35-6-cm-full-hd-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-quadro-t550-wi-fi-6e-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-precision-3561-i7-11850h-mobiel-werkstation-39-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-t600-wi-fi-6-windows-10-pro-grijs.md": {
	id: "dell-precision-3561-i7-11850h-mobiel-werkstation-39-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-t600-wi-fi-6-windows-10-pro-grijs.md";
  slug: "dell-precision-3561-i7-11850h-mobiel-werkstation-39-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-t600-wi-fi-6-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-precision-3570-i7-1255u-mobiel-werkstation-39-6-cm-full-hd-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-quadro-t550-wi-fi-6e-windows-10-pro-grijs.md": {
	id: "dell-precision-3570-i7-1255u-mobiel-werkstation-39-6-cm-full-hd-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-quadro-t550-wi-fi-6e-windows-10-pro-grijs.md";
  slug: "dell-precision-3570-i7-1255u-mobiel-werkstation-39-6-cm-full-hd-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-quadro-t550-wi-fi-6e-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-precision-3571-i7-12700h-mobiel-werkstation-39-6-cm-full-hd-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-t600-wi-fi-6e-windows-10-pro-grijs.md": {
	id: "dell-precision-3571-i7-12700h-mobiel-werkstation-39-6-cm-full-hd-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-t600-wi-fi-6e-windows-10-pro-grijs.md";
  slug: "dell-precision-3571-i7-12700h-mobiel-werkstation-39-6-cm-full-hd-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-t600-wi-fi-6e-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-precision-3580-mobiel-werkstation-39-6-cm-full-hd-intel-core-i7-i7-1360p-16-gb-ddr5-sdram-512-gb-ssd-nvidia-rtx-a500-wi-fi-6e-windows-11-pro-grijs.md": {
	id: "dell-precision-3580-mobiel-werkstation-39-6-cm-full-hd-intel-core-i7-i7-1360p-16-gb-ddr5-sdram-512-gb-ssd-nvidia-rtx-a500-wi-fi-6e-windows-11-pro-grijs.md";
  slug: "dell-precision-3580-mobiel-werkstation-39-6-cm-full-hd-intel-core-i7-i7-1360p-16-gb-ddr5-sdram-512-gb-ssd-nvidia-rtx-a500-wi-fi-6e-windows-11-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-precision-5570-i7-12700h-mobiel-werkstation-39-6-cm-full-hd-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-rtx-a1000-wi-fi-6e-windows-10-pro-grijs.md": {
	id: "dell-precision-5570-i7-12700h-mobiel-werkstation-39-6-cm-full-hd-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-rtx-a1000-wi-fi-6e-windows-10-pro-grijs.md";
  slug: "dell-precision-5570-i7-12700h-mobiel-werkstation-39-6-cm-full-hd-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-rtx-a1000-wi-fi-6e-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-precision-5760-i7-11800h-mobiel-werkstation-43-2-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-rtx-a2000-wi-fi-6-windows-10-pro-grijs.md": {
	id: "dell-precision-5760-i7-11800h-mobiel-werkstation-43-2-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-rtx-a2000-wi-fi-6-windows-10-pro-grijs.md";
  slug: "dell-precision-5760-i7-11800h-mobiel-werkstation-43-2-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-rtx-a2000-wi-fi-6-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-precision-7540-core-i9-9880h-32gb-ram-ddr4-1000gb-nvme-1920x1080-nvidia-t2000.md": {
	id: "dell-precision-7540-core-i9-9880h-32gb-ram-ddr4-1000gb-nvme-1920x1080-nvidia-t2000.md";
  slug: "dell-precision-7540-core-i9-9880h-32gb-ram-ddr4-1000gb-nvme-1920x1080-nvidia-t2000";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-precision-7770-i9-12950hx-mobiel-werkstation-43-9-cm-full-hd-intel-core-i9-32-gb-ddr5-sdram-1000-gb-ssd-nvidia-rtx-a4500-wi-fi-6e-windows-10-pro-grijs.md": {
	id: "dell-precision-7770-i9-12950hx-mobiel-werkstation-43-9-cm-full-hd-intel-core-i9-32-gb-ddr5-sdram-1000-gb-ssd-nvidia-rtx-a4500-wi-fi-6e-windows-10-pro-grijs.md";
  slug: "dell-precision-7770-i9-12950hx-mobiel-werkstation-43-9-cm-full-hd-intel-core-i9-32-gb-ddr5-sdram-1000-gb-ssd-nvidia-rtx-a4500-wi-fi-6e-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-precision-mobile-workstation-3550-laptop-15-6-full-hd-bij-60-hz-intel-core-i7-10510u-1-8-ghz-8-gb-ram-256-gb-ssd-nvme-quadro-p520-wi-fi-6-bluetooth-windows-10-pro-64-bits-zwart.md": {
	id: "dell-precision-mobile-workstation-3550-laptop-15-6-full-hd-bij-60-hz-intel-core-i7-10510u-1-8-ghz-8-gb-ram-256-gb-ssd-nvme-quadro-p520-wi-fi-6-bluetooth-windows-10-pro-64-bits-zwart.md";
  slug: "dell-precision-mobile-workstation-3550-laptop-15-6-full-hd-bij-60-hz-intel-core-i7-10510u-1-8-ghz-8-gb-ram-256-gb-ssd-nvme-quadro-p520-wi-fi-6-bluetooth-windows-10-pro-64-bits-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-3400-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-11-pro-zwart.md": {
	id: "dell-vostro-3400-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-11-pro-zwart.md";
  slug: "dell-vostro-3400-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-3420-i5-1235u-14-fhd-carbon-black-qwerty-pt.md": {
	id: "dell-vostro-3420-i5-1235u-14-fhd-carbon-black-qwerty-pt.md";
  slug: "dell-vostro-3420-i5-1235u-14-fhd-carbon-black-qwerty-pt";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-3500-core-i5-1135g7-8gb-512gb-ssd-15-fhd-black-w10-pro-qwerty-pt.md": {
	id: "dell-vostro-3500-core-i5-1135g7-8gb-512gb-ssd-15-fhd-black-w10-pro-qwerty-pt.md";
  slug: "dell-vostro-3500-core-i5-1135g7-8gb-512gb-ssd-15-fhd-black-w10-pro-qwerty-pt";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-3500-ddr4-sdram-notebook-39-6-cm-1920-x-1080-pixels-intel-11de-generatie-core-i5-8-gb-256-gb-ssd-wi-fi-5-windows-10-pro-zwart.md": {
	id: "dell-vostro-3500-ddr4-sdram-notebook-39-6-cm-1920-x-1080-pixels-intel-11de-generatie-core-i5-8-gb-256-gb-ssd-wi-fi-5-windows-10-pro-zwart.md";
  slug: "dell-vostro-3500-ddr4-sdram-notebook-39-6-cm-1920-x-1080-pixels-intel-11de-generatie-core-i5-8-gb-256-gb-ssd-wi-fi-5-windows-10-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-3500-i5-1135g7-15-fhd-zwart-qwerty-es.md": {
	id: "dell-vostro-3500-i5-1135g7-15-fhd-zwart-qwerty-es.md";
  slug: "dell-vostro-3500-i5-1135g7-15-fhd-zwart-qwerty-es";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-3500-i7-1165g7-15-fhd-zwart-qwerty-pt.md": {
	id: "dell-vostro-3500-i7-1165g7-15-fhd-zwart-qwerty-pt.md";
  slug: "dell-vostro-3500-i7-1165g7-15-fhd-zwart-qwerty-pt";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-3510-i5-1135g7-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-pro-zwart.md": {
	id: "dell-vostro-3510-i5-1135g7-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-pro-zwart.md";
  slug: "dell-vostro-3510-i5-1135g7-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-3510-i7-1165g7-15-fhd-zwart-qwerty-it.md": {
	id: "dell-vostro-3510-i7-1165g7-15-fhd-zwart-qwerty-it.md";
  slug: "dell-vostro-3510-i7-1165g7-15-fhd-zwart-qwerty-it";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-3510-notebook-intel-core-i5-1135g7-8gb-ddr4-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-wva-intel-iris-xe-graphics-lan-wlan-webcam-windows-10-pro-64-bit.md": {
	id: "dell-vostro-3510-notebook-intel-core-i5-1135g7-8gb-ddr4-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-wva-intel-iris-xe-graphics-lan-wlan-webcam-windows-10-pro-64-bit.md";
  slug: "dell-vostro-3510-notebook-intel-core-i5-1135g7-8gb-ddr4-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-wva-intel-iris-xe-graphics-lan-wlan-webcam-windows-10-pro-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-3515-amd-ryzen-5-3450u-15-fhd-zwart-qwerty-es.md": {
	id: "dell-vostro-3515-amd-ryzen-5-3450u-15-fhd-zwart-qwerty-es.md";
  slug: "dell-vostro-3515-amd-ryzen-5-3450u-15-fhd-zwart-qwerty-es";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-3515-amd-ryzen-5-3450u-15-fhd-zwart-qwerty-it.md": {
	id: "dell-vostro-3515-amd-ryzen-5-3450u-15-fhd-zwart-qwerty-it.md";
  slug: "dell-vostro-3515-amd-ryzen-5-3450u-15-fhd-zwart-qwerty-it";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-3520-k20v7.md": {
	id: "dell-vostro-3520-k20v7.md";
  slug: "dell-vostro-3520-k20v7";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-3525-5625u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-pro-grijs.md": {
	id: "dell-vostro-3525-5625u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-pro-grijs.md";
  slug: "dell-vostro-3525-5625u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-5310-core-i5-11320h-8gb-512gb-ssd-13-fhd-titan-gray-w10-pro-qwerty-it.md": {
	id: "dell-vostro-5310-core-i5-11320h-8gb-512gb-ssd-13-fhd-titan-gray-w10-pro-qwerty-it.md";
  slug: "dell-vostro-5310-core-i5-11320h-8gb-512gb-ssd-13-fhd-titan-gray-w10-pro-qwerty-it";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-5320-i5-1240p-13-fhd-grijs-qwerty-it.md": {
	id: "dell-vostro-5320-i5-1240p-13-fhd-grijs-qwerty-it.md";
  slug: "dell-vostro-5320-i5-1240p-13-fhd-grijs-qwerty-it";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-5320-i7-1260p-13-fhd-grijs-qwerty-it.md": {
	id: "dell-vostro-5320-i7-1260p-13-fhd-grijs-qwerty-it.md";
  slug: "dell-vostro-5320-i7-1260p-13-fhd-grijs-qwerty-it";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-5410-i5-11320h-14-fhd-grijs-qwerty-nordic.md": {
	id: "dell-vostro-5410-i5-11320h-14-fhd-grijs-qwerty-nordic.md";
  slug: "dell-vostro-5410-i5-11320h-14-fhd-grijs-qwerty-nordic";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-5415-amd-ryzen-5-5500u-8gb-256gb-ssd-radeon-graphics-14-fhd-titan-gray-w10-pro-qwerty-uk.md": {
	id: "dell-vostro-5415-amd-ryzen-5-5500u-8gb-256gb-ssd-radeon-graphics-14-fhd-titan-gray-w10-pro-qwerty-uk.md";
  slug: "dell-vostro-5415-amd-ryzen-5-5500u-8gb-256gb-ssd-radeon-graphics-14-fhd-titan-gray-w10-pro-qwerty-uk";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-5415-amd-ryzen-5-5500u-radeon-graphics-14-fhd-titan-gray-qwerty.md": {
	id: "dell-vostro-5415-amd-ryzen-5-5500u-radeon-graphics-14-fhd-titan-gray-qwerty.md";
  slug: "dell-vostro-5415-amd-ryzen-5-5500u-radeon-graphics-14-fhd-titan-gray-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-5502-core-i7-1165g7-8gb-512gb-ssd-geforce-mx330-15-fhd-gray-w10-pro-qwerty-it.md": {
	id: "dell-vostro-5502-core-i7-1165g7-8gb-512gb-ssd-geforce-mx330-15-fhd-gray-w10-pro-qwerty-it.md";
  slug: "dell-vostro-5502-core-i7-1165g7-8gb-512gb-ssd-geforce-mx330-15-fhd-gray-w10-pro-qwerty-it";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-5502-i5-1135g7-15-fhd-gray-qwerty-es.md": {
	id: "dell-vostro-5502-i5-1135g7-15-fhd-gray-qwerty-es.md";
  slug: "dell-vostro-5502-i5-1135g7-15-fhd-gray-qwerty-es";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-5515-amd-ryzen-5-5500u-radeon-graphics-15-fhd-titan-gray-qwerty.md": {
	id: "dell-vostro-5515-amd-ryzen-5-5500u-radeon-graphics-15-fhd-titan-gray-qwerty.md";
  slug: "dell-vostro-5515-amd-ryzen-5-5500u-radeon-graphics-15-fhd-titan-gray-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-vostro-5620-core-i5-1240p-8gb-256gb-ssd-16-fhd-titan-gray-w11-pro-qwerty-it.md": {
	id: "dell-vostro-5620-core-i5-1240p-8gb-256gb-ssd-16-fhd-titan-gray-w11-pro-qwerty-it.md";
  slug: "dell-vostro-5620-core-i5-1240p-8gb-256gb-ssd-16-fhd-titan-gray-w11-pro-qwerty-it";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dell-xps-13-9315-i7-1250u-notebook-34-cm-touchscreen-uhd-intel-core-i7-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-blauw.md": {
	id: "dell-xps-13-9315-i7-1250u-notebook-34-cm-touchscreen-uhd-intel-core-i7-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-blauw.md";
  slug: "dell-xps-13-9315-i7-1250u-notebook-34-cm-touchscreen-uhd-intel-core-i7-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-blauw";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dragonfly-13-5-inch-g4-notebook-pc-wolf-pro-security-edition-13-5-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-3k2k.md": {
	id: "dragonfly-13-5-inch-g4-notebook-pc-wolf-pro-security-edition-13-5-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-3k2k.md";
  slug: "dragonfly-13-5-inch-g4-notebook-pc-wolf-pro-security-edition-13-5-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-3k2k";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"dragonfly-13-5-inch-g4-notebook-pc-wolf-pro-security-edition-13-5-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-3k2k.md": {
	id: "dragonfly-13-5-inch-g4-notebook-pc-wolf-pro-security-edition-13-5-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-3k2k.md";
  slug: "dragonfly-13-5-inch-g4-notebook-pc-wolf-pro-security-edition-13-5-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-3k2k";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"e15-amdl-g3-t-r5-5500u-16gb-512gb-w11p-qwerty.md": {
	id: "e15-amdl-g3-t-r5-5500u-16gb-512gb-w11p-qwerty.md";
  slug: "e15-amdl-g3-t-r5-5500u-16gb-512gb-w11p-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"elite-x360-830-13-inch-g10-2-in-1-notebook-pc-wolf-pro-security-edition-13-3-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-wuxga.md": {
	id: "elite-x360-830-13-inch-g10-2-in-1-notebook-pc-wolf-pro-security-edition-13-3-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-wuxga.md";
  slug: "elite-x360-830-13-inch-g10-2-in-1-notebook-pc-wolf-pro-security-edition-13-3-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-wuxga";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"elitebook-640-14-inch-g10-notebook-pc-wolf-pro-security-edition-14-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-fhd.md": {
	id: "elitebook-640-14-inch-g10-notebook-pc-wolf-pro-security-edition-14-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-fhd.md";
  slug: "elitebook-640-14-inch-g10-notebook-pc-wolf-pro-security-edition-14-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-fhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"elitebook-650-15-6-inch-g10-15-6-i7-1355u-16gb-512gb-qwerty-w11-pro.md": {
	id: "elitebook-650-15-6-inch-g10-15-6-i7-1355u-16gb-512gb-qwerty-w11-pro.md";
  slug: "elitebook-650-15-6-inch-g10-15-6-i7-1355u-16gb-512gb-qwerty-w11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"elitebook-650-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-fhd.md": {
	id: "elitebook-650-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-fhd.md";
  slug: "elitebook-650-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-fhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"elitebook-650-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-fhd.md": {
	id: "elitebook-650-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-fhd.md";
  slug: "elitebook-650-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-fhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"elitebook-650-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-nvidia-geforce-rtx-2050-fhd.md": {
	id: "elitebook-650-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-nvidia-geforce-rtx-2050-fhd.md";
  slug: "elitebook-650-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-nvidia-geforce-rtx-2050-fhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"elitebook-830-13-inch-g10-notebook-pc-wolf-pro-security-edition-13-3-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-wuxga.md": {
	id: "elitebook-830-13-inch-g10-notebook-pc-wolf-pro-security-edition-13-3-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-wuxga.md";
  slug: "elitebook-830-13-inch-g10-notebook-pc-wolf-pro-security-edition-13-3-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-wuxga";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"elitebook-840-14-inch-g10-notebook-pc-wolf-pro-security-edition-14-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-wuxga.md": {
	id: "elitebook-840-14-inch-g10-notebook-pc-wolf-pro-security-edition-14-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-wuxga.md";
  slug: "elitebook-840-14-inch-g10-notebook-pc-wolf-pro-security-edition-14-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-wuxga";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"elitebook-840-14-inch-g10-notebook-pc-wolf-pro-security-edition-14-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-wuxga.md": {
	id: "elitebook-840-14-inch-g10-notebook-pc-wolf-pro-security-edition-14-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-wuxga.md";
  slug: "elitebook-840-14-inch-g10-notebook-pc-wolf-pro-security-edition-14-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-wuxga";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"elitebook-840-14-inch-g9-notebook-pc-wolf-pro-security-edition-14-windows-11-pro-intel-core-i7-32gb-ram-1tb-ssd-wuxga.md": {
	id: "elitebook-840-14-inch-g9-notebook-pc-wolf-pro-security-edition-14-windows-11-pro-intel-core-i7-32gb-ram-1tb-ssd-wuxga.md";
  slug: "elitebook-840-14-inch-g9-notebook-pc-wolf-pro-security-edition-14-windows-11-pro-intel-core-i7-32gb-ram-1tb-ssd-wuxga";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"elitebook-840-g8-notebook-pc-14-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-fhd.md": {
	id: "elitebook-840-g8-notebook-pc-14-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-fhd.md";
  slug: "elitebook-840-g8-notebook-pc-14-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-fhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"elitebook-860-16-inch-g10-notebook-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-wuxga.md": {
	id: "elitebook-860-16-inch-g10-notebook-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-wuxga.md";
  slug: "elitebook-860-16-inch-g10-notebook-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-wuxga";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"elitebook-860-16-inch-g10-notebook-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-wuxga.md": {
	id: "elitebook-860-16-inch-g10-notebook-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-wuxga.md";
  slug: "elitebook-860-16-inch-g10-notebook-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-wuxga";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"envy-laptop-17-cw0095nd-windows-11-home-17-3-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-3050-4k-uhd-natuurlijk-zilver.md": {
	id: "envy-laptop-17-cw0095nd-windows-11-home-17-3-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-3050-4k-uhd-natuurlijk-zilver.md";
  slug: "envy-laptop-17-cw0095nd-windows-11-home-17-3-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-3050-4k-uhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"envy-laptop-17-cw0620nd-windows-11-home-17-3-intel-core-i5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md": {
	id: "envy-laptop-17-cw0620nd-windows-11-home-17-3-intel-core-i5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md";
  slug: "envy-laptop-17-cw0620nd-windows-11-home-17-3-intel-core-i5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"envy-laptop-17-cw0675nd-windows-11-home-17-3-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-3050-fhd-natuurlijk-zilver.md": {
	id: "envy-laptop-17-cw0675nd-windows-11-home-17-3-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-3050-fhd-natuurlijk-zilver.md";
  slug: "envy-laptop-17-cw0675nd-windows-11-home-17-3-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-3050-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"envy-laptop-17-cw0695nd-windows-11-home-17-3-intel-core-i7-32gb-ram-1tb-ssd-nvidia-geforce-rtx-3050-4k-uhd-natuurlijk-zilver.md": {
	id: "envy-laptop-17-cw0695nd-windows-11-home-17-3-intel-core-i7-32gb-ram-1tb-ssd-nvidia-geforce-rtx-3050-4k-uhd-natuurlijk-zilver.md";
  slug: "envy-laptop-17-cw0695nd-windows-11-home-17-3-intel-core-i7-32gb-ram-1tb-ssd-nvidia-geforce-rtx-3050-4k-uhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"envy-x360-2-in-1-laptop-15-fe0320nd-windows-11-home-15-6-intel-core-i5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md": {
	id: "envy-x360-2-in-1-laptop-15-fe0320nd-windows-11-home-15-6-intel-core-i5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md";
  slug: "envy-x360-2-in-1-laptop-15-fe0320nd-windows-11-home-15-6-intel-core-i5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"envy-x360-2-in-1-laptop-15-fe0610nd-windows-11-home-15-6-touchscreen-intel-core-i5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md": {
	id: "envy-x360-2-in-1-laptop-15-fe0610nd-windows-11-home-15-6-touchscreen-intel-core-i5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md";
  slug: "envy-x360-2-in-1-laptop-15-fe0610nd-windows-11-home-15-6-touchscreen-intel-core-i5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"envy-x360-2-in-1-laptop-15-fe0660nd-windows-11-home-15-6-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-3050-fhd-natuurlijk-zilver.md": {
	id: "envy-x360-2-in-1-laptop-15-fe0660nd-windows-11-home-15-6-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-3050-fhd-natuurlijk-zilver.md";
  slug: "envy-x360-2-in-1-laptop-15-fe0660nd-windows-11-home-15-6-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-3050-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"envy-x360-2-in-1-laptop-15-fh0370nd-windows-11-home-15-6-touchscreen-amd-ryzen-5-16gb-ram-512gb-ssd-fhd-nightfall-black.md": {
	id: "envy-x360-2-in-1-laptop-15-fh0370nd-windows-11-home-15-6-touchscreen-amd-ryzen-5-16gb-ram-512gb-ssd-fhd-nightfall-black.md";
  slug: "envy-x360-2-in-1-laptop-15-fh0370nd-windows-11-home-15-6-touchscreen-amd-ryzen-5-16gb-ram-512gb-ssd-fhd-nightfall-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"erazer-beast-x40-md62505-nl.md": {
	id: "erazer-beast-x40-md62505-nl.md";
  slug: "erazer-beast-x40-md62505-nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"erazer-defender-p40-md62522-nl.md": {
	id: "erazer-defender-p40-md62522-nl.md";
  slug: "erazer-defender-p40-md62522-nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"erazer-defender-p50-md62587-nl-173-inch-intel-core-i7-16-gb-512-gb-geforce-rtx-4060-1796501.md": {
	id: "erazer-defender-p50-md62587-nl-173-inch-intel-core-i7-16-gb-512-gb-geforce-rtx-4060-1796501.md";
  slug: "erazer-defender-p50-md62587-nl-173-inch-intel-core-i7-16-gb-512-gb-geforce-rtx-4060-1796501";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"erazer-deputy-p50-md62519-nl-intel-core-i7-39-6-cm-2560-x-1440-pixels-16-gb-1024-gb-windows-11-home.md": {
	id: "erazer-deputy-p50-md62519-nl-intel-core-i7-39-6-cm-2560-x-1440-pixels-16-gb-1024-gb-windows-11-home.md";
  slug: "erazer-deputy-p50-md62519-nl-intel-core-i7-39-6-cm-2560-x-1440-pixels-16-gb-1024-gb-windows-11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"erazer-deputy-p60-md62588-nl-156-inch-intel-core-i7-16-gb-512-gb-geforce-rtx-4060-1796502.md": {
	id: "erazer-deputy-p60-md62588-nl-156-inch-intel-core-i7-16-gb-512-gb-geforce-rtx-4060-1796502.md";
  slug: "erazer-deputy-p60-md62588-nl-156-inch-intel-core-i7-16-gb-512-gb-geforce-rtx-4060-1796502";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-13-be2070nd-1761662.md": {
	id: "hp-13-be2070nd-1761662.md";
  slug: "hp-13-be2070nd-1761662";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-14-em0050nd-14-fhd-r5-7520u-8gb-512gb-w11.md": {
	id: "hp-14-em0050nd-14-fhd-r5-7520u-8gb-512gb-w11.md";
  slug: "hp-14-em0050nd-14-fhd-r5-7520u-8gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-14-em0050nd-14-inch-amd-ryzen-5-8-gb-512-gb-1761665.md": {
	id: "hp-14-em0050nd-14-inch-amd-ryzen-5-8-gb-512-gb-1761665.md";
  slug: "hp-14-em0050nd-14-inch-amd-ryzen-5-8-gb-512-gb-1761665";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-14-em0055nd-14-fhd-r5-7520u-16gb-512gb-w11.md": {
	id: "hp-14-em0055nd-14-fhd-r5-7520u-16gb-512gb-w11.md";
  slug: "hp-14-em0055nd-14-fhd-r5-7520u-16gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-14-em0770nd-laptop-14-inch.md": {
	id: "hp-14-em0770nd-laptop-14-inch.md";
  slug: "hp-14-em0770nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-14s-14-fhd-ips-i7-1195g7-16gb-ddr4-256gb-m-2-ssd-w11-home.md": {
	id: "hp-14s-14-fhd-ips-i7-1195g7-16gb-ddr4-256gb-m-2-ssd-w11-home.md";
  slug: "hp-14s-14-fhd-ips-i7-1195g7-16gb-ddr4-256gb-m-2-ssd-w11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-14s-dq4130nd-laptop-14-inch.md": {
	id: "hp-14s-dq4130nd-laptop-14-inch.md";
  slug: "hp-14s-dq4130nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-14s-dq4730nd-laptop-14-inch.md": {
	id: "hp-14s-dq4730nd-laptop-14-inch.md";
  slug: "hp-14s-dq4730nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-14s-dq4770nd-laptop-14-inch.md": {
	id: "hp-14s-dq4770nd-laptop-14-inch.md";
  slug: "hp-14s-dq4770nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-14s-dq5125nd-i5-1235u-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-home-zilver.md": {
	id: "hp-14s-dq5125nd-i5-1235u-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-home-zilver.md";
  slug: "hp-14s-dq5125nd-i5-1235u-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-14s-dq5130nd-14-windows-11-home-intel-core-i5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md": {
	id: "hp-14s-dq5130nd-14-windows-11-home-intel-core-i5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md";
  slug: "hp-14s-dq5130nd-14-windows-11-home-intel-core-i5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-14s-dq5515nd.md": {
	id: "hp-14s-dq5515nd.md";
  slug: "hp-14s-dq5515nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-14s-dq5750nd-laptop-14-inch.md": {
	id: "hp-14s-dq5750nd-laptop-14-inch.md";
  slug: "hp-14s-dq5750nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-14s-dq5760nd-laptop-14-inch.md": {
	id: "hp-14s-dq5760nd-laptop-14-inch.md";
  slug: "hp-14s-dq5760nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-14s-dq5935nd.md": {
	id: "hp-14s-dq5935nd.md";
  slug: "hp-14s-dq5935nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-14s-fq1717nd-laptop-14-inch.md": {
	id: "hp-14s-fq1717nd-laptop-14-inch.md";
  slug: "hp-14s-fq1717nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-14s-fq2225nd-5625u-notebook-35-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md": {
	id: "hp-14s-fq2225nd-5625u-notebook-35-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md";
  slug: "hp-14s-fq2225nd-5625u-notebook-35-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15-6-full-hd-amd-ryzen-7-5700u-512-gb-8-gb-ddr4-windows-11-pro-2-jaar-garantie.md": {
	id: "hp-15-6-full-hd-amd-ryzen-7-5700u-512-gb-8-gb-ddr4-windows-11-pro-2-jaar-garantie.md";
  slug: "hp-15-6-full-hd-amd-ryzen-7-5700u-512-gb-8-gb-ddr4-windows-11-pro-2-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15-db1200ny-15-6-full-hd-ryzen-7-256gb-m-2-ssd-1tb-hdd-8gb.md": {
	id: "hp-15-db1200ny-15-6-full-hd-ryzen-7-256gb-m-2-ssd-1tb-hdd-8gb.md";
  slug: "hp-15-db1200ny-15-6-full-hd-ryzen-7-256gb-m-2-ssd-1tb-hdd-8gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15-eh3075nd-15-fhd-r7-7730u-16gb-1tb-w11.md": {
	id: "hp-15-eh3075nd-15-fhd-r7-7730u-16gb-1tb-w11.md";
  slug: "hp-15-eh3075nd-15-fhd-r7-7730u-16gb-1tb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15-fc0050nd-15-fhd-r5-7520u-8gb-512gb-w11.md": {
	id: "hp-15-fc0050nd-15-fhd-r5-7520u-8gb-512gb-w11.md";
  slug: "hp-15-fc0050nd-15-fhd-r5-7520u-8gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15-fc0055nd-15-fhd-r5-7520u-16gb-512gb-w11.md": {
	id: "hp-15-fc0055nd-15-fhd-r5-7520u-16gb-512gb-w11.md";
  slug: "hp-15-fc0055nd-15-fhd-r5-7520u-16gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15-fc0055nd-156-inch-amd-ryzen-5-16-gb-512-gb-1761673.md": {
	id: "hp-15-fc0055nd-156-inch-amd-ryzen-5-16-gb-512-gb-1761673.md";
  slug: "hp-15-fc0055nd-156-inch-amd-ryzen-5-16-gb-512-gb-1761673";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15-fc0075nd-15-fhd-r7-7730u-16gb-1tb-w11.md": {
	id: "hp-15-fc0075nd-15-fhd-r7-7730u-16gb-1tb-w11.md";
  slug: "hp-15-fc0075nd-15-fhd-r7-7730u-16gb-1tb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15-fc0527nd-870l7ea-abh-qwerty.md": {
	id: "hp-15-fc0527nd-870l7ea-abh-qwerty.md";
  slug: "hp-15-fc0527nd-870l7ea-abh-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15-fc0755nd-laptop-15-6-inch.md": {
	id: "hp-15-fc0755nd-laptop-15-6-inch.md";
  slug: "hp-15-fc0755nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15-fc0770nd-laptop-15-6-inch.md": {
	id: "hp-15-fc0770nd-laptop-15-6-inch.md";
  slug: "hp-15-fc0770nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15-fc0826nd-156-inch-amd-ryzen-5-8-gb-512-gb-1758388.md": {
	id: "hp-15-fc0826nd-156-inch-amd-ryzen-5-8-gb-512-gb-1758388.md";
  slug: "hp-15-fc0826nd-156-inch-amd-ryzen-5-8-gb-512-gb-1758388";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-eq2112nb.md": {
	id: "hp-15s-eq2112nb.md";
  slug: "hp-15s-eq2112nb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-eq2255nd-laptop.md": {
	id: "hp-15s-eq2255nd-laptop.md";
  slug: "hp-15s-eq2255nd-laptop";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-eq2270nd-laptop-15-6-ips-full-hd-amd-ryzen-5-5500u-2-1-ghz-8-gb-ram-512-gb-ssd-nvme-amd-radeon-graphics-wi-fi-5-bluetooth-windows-10-home-in-s-mode-zilver.md": {
	id: "hp-15s-eq2270nd-laptop-15-6-ips-full-hd-amd-ryzen-5-5500u-2-1-ghz-8-gb-ram-512-gb-ssd-nvme-amd-radeon-graphics-wi-fi-5-bluetooth-windows-10-home-in-s-mode-zilver.md";
  slug: "hp-15s-eq2270nd-laptop-15-6-ips-full-hd-amd-ryzen-5-5500u-2-1-ghz-8-gb-ram-512-gb-ssd-nvme-amd-radeon-graphics-wi-fi-5-bluetooth-windows-10-home-in-s-mode-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-eq2295nd-5500u-notebook-39-6-cm-full-hd-amd-ryzen-5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-zilver.md": {
	id: "hp-15s-eq2295nd-5500u-notebook-39-6-cm-full-hd-amd-ryzen-5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-zilver.md";
  slug: "hp-15s-eq2295nd-5500u-notebook-39-6-cm-full-hd-amd-ryzen-5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-eq2950nd-5500u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-11-home-grijs.md": {
	id: "hp-15s-eq2950nd-5500u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-11-home-grijs.md";
  slug: "hp-15s-eq2950nd-5500u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-eq2970nd-5700u-notebook-39-6-cm-full-hd-amd-ryzen-7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md": {
	id: "hp-15s-eq2970nd-5700u-notebook-39-6-cm-full-hd-amd-ryzen-7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md";
  slug: "hp-15s-eq2970nd-5700u-notebook-39-6-cm-full-hd-amd-ryzen-7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-eq3280nd-5625u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md": {
	id: "hp-15s-eq3280nd-5625u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md";
  slug: "hp-15s-eq3280nd-5625u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-eq3300nd-1739385.md": {
	id: "hp-15s-eq3300nd-1739385.md";
  slug: "hp-15s-eq3300nd-1739385";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-eq3350nd-1739386.md": {
	id: "hp-15s-eq3350nd-1739386.md";
  slug: "hp-15s-eq3350nd-1739386";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-eq3350nd-5825u-notebook-39-6-cm-full-hd-amd-ryzen-7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-zilver.md": {
	id: "hp-15s-eq3350nd-5825u-notebook-39-6-cm-full-hd-amd-ryzen-7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-zilver.md";
  slug: "hp-15s-eq3350nd-5825u-notebook-39-6-cm-full-hd-amd-ryzen-7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-eq3400nd-5825u-notebook-39-6-cm-full-hd-amd-ryzen-7-16-gb-ddr4-sdram-1000-gb-ssd-wi-fi-6-windows-11-home-zilver.md": {
	id: "hp-15s-eq3400nd-5825u-notebook-39-6-cm-full-hd-amd-ryzen-7-16-gb-ddr4-sdram-1000-gb-ssd-wi-fi-6-windows-11-home-zilver.md";
  slug: "hp-15s-eq3400nd-5825u-notebook-39-6-cm-full-hd-amd-ryzen-7-16-gb-ddr4-sdram-1000-gb-ssd-wi-fi-6-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-eq3770nd-laptop-15-6-inch.md": {
	id: "hp-15s-eq3770nd-laptop-15-6-inch.md";
  slug: "hp-15s-eq3770nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq1045nd-ddr4-sdram-notebook-39-6-cm-1920-x-1080-pixels-intel-10de-generatie-core-i5-8-gb-256-gb-ssd-wi-fi-5-windows-10-home-zilver.md": {
	id: "hp-15s-fq1045nd-ddr4-sdram-notebook-39-6-cm-1920-x-1080-pixels-intel-10de-generatie-core-i5-8-gb-256-gb-ssd-wi-fi-5-windows-10-home-zilver.md";
  slug: "hp-15s-fq1045nd-ddr4-sdram-notebook-39-6-cm-1920-x-1080-pixels-intel-10de-generatie-core-i5-8-gb-256-gb-ssd-wi-fi-5-windows-10-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq2126nd-ddr4-sdram-notebook-39-6-cm-1920-x-1080-pixels-intel-11de-generatie-core-i5-8-gb-512-gb-ssd-wi-fi-5-windows-10-home-zilver.md": {
	id: "hp-15s-fq2126nd-ddr4-sdram-notebook-39-6-cm-1920-x-1080-pixels-intel-11de-generatie-core-i5-8-gb-512-gb-ssd-wi-fi-5-windows-10-home-zilver.md";
  slug: "hp-15s-fq2126nd-ddr4-sdram-notebook-39-6-cm-1920-x-1080-pixels-intel-11de-generatie-core-i5-8-gb-512-gb-ssd-wi-fi-5-windows-10-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq2403nd-i5-1135g7-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md": {
	id: "hp-15s-fq2403nd-i5-1135g7-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md";
  slug: "hp-15s-fq2403nd-i5-1135g7-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq4251nd-i5-1155g7-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-11-home-zilver.md": {
	id: "hp-15s-fq4251nd-i5-1155g7-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-11-home-zilver.md";
  slug: "hp-15s-fq4251nd-i5-1155g7-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq4253nd-i5-1155g7-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md": {
	id: "hp-15s-fq4253nd-i5-1155g7-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md";
  slug: "hp-15s-fq4253nd-i5-1155g7-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq4755nd-laptop-15-6-inch.md": {
	id: "hp-15s-fq4755nd-laptop-15-6-inch.md";
  slug: "hp-15s-fq4755nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq4757nd-laptop-15-6-inch.md": {
	id: "hp-15s-fq4757nd-laptop-15-6-inch.md";
  slug: "hp-15s-fq4757nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq5013nq-15-6-f-hd-i7-1255u-8gb-512gb-w11p-pale-gold.md": {
	id: "hp-15s-fq5013nq-15-6-f-hd-i7-1255u-8gb-512gb-w11p-pale-gold.md";
  slug: "hp-15s-fq5013nq-15-6-f-hd-i7-1255u-8gb-512gb-w11p-pale-gold";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq5390nd-1739392.md": {
	id: "hp-15s-fq5390nd-1739392.md";
  slug: "hp-15s-fq5390nd-1739392";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq5390nd-i7-1255u-notebook-39-6-cm-full-hd-intel-core-i7-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md": {
	id: "hp-15s-fq5390nd-i7-1255u-notebook-39-6-cm-full-hd-intel-core-i7-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md";
  slug: "hp-15s-fq5390nd-i7-1255u-notebook-39-6-cm-full-hd-intel-core-i7-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq5451nd-laptop-15-6-inch.md": {
	id: "hp-15s-fq5451nd-laptop-15-6-inch.md";
  slug: "hp-15s-fq5451nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq5530nd.md": {
	id: "hp-15s-fq5530nd.md";
  slug: "hp-15s-fq5530nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq5750nd-laptop-15-6-inch.md": {
	id: "hp-15s-fq5750nd-laptop-15-6-inch.md";
  slug: "hp-15s-fq5750nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq5765nd-laptop-15-6-inch.md": {
	id: "hp-15s-fq5765nd-laptop-15-6-inch.md";
  slug: "hp-15s-fq5765nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq5767nd-laptop-15-6-inch.md": {
	id: "hp-15s-fq5767nd-laptop-15-6-inch.md";
  slug: "hp-15s-fq5767nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq5775nd-laptop-15-6-inch.md": {
	id: "hp-15s-fq5775nd-laptop-15-6-inch.md";
  slug: "hp-15s-fq5775nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq5832nd-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-11-home-zilver.md": {
	id: "hp-15s-fq5832nd-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-11-home-zilver.md";
  slug: "hp-15s-fq5832nd-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq5956nd.md": {
	id: "hp-15s-fq5956nd.md";
  slug: "hp-15s-fq5956nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq5959nd.md": {
	id: "hp-15s-fq5959nd.md";
  slug: "hp-15s-fq5959nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-15s-fq5976nd.md": {
	id: "hp-15s-fq5976nd.md";
  slug: "hp-15s-fq5976nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-17-3-full-hd-ips-anti-glare-amd-ryzen-7-16gb-512gb-ssd-m-2-nvme-windows-11-home.md": {
	id: "hp-17-17-3-full-hd-ips-anti-glare-amd-ryzen-7-16gb-512gb-ssd-m-2-nvme-windows-11-home.md";
  slug: "hp-17-17-3-full-hd-ips-anti-glare-amd-ryzen-7-16gb-512gb-ssd-m-2-nvme-windows-11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-cn1750nd-laptop-17-3-inch.md": {
	id: "hp-17-cn1750nd-laptop-17-3-inch.md";
  slug: "hp-17-cn1750nd-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-cn2050nd-i5-1235u-8-512gb.md": {
	id: "hp-17-cn2050nd-i5-1235u-8-512gb.md";
  slug: "hp-17-cn2050nd-i5-1235u-8-512gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-cn2390nd-1739395.md": {
	id: "hp-17-cn2390nd-1739395.md";
  slug: "hp-17-cn2390nd-1739395";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-cn2750nd-laptop-17-3-inch.md": {
	id: "hp-17-cn2750nd-laptop-17-3-inch.md";
  slug: "hp-17-cn2750nd-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-cn2755nd-laptop-17-3-inch.md": {
	id: "hp-17-cn2755nd-laptop-17-3-inch.md";
  slug: "hp-17-cn2755nd-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-cn2760nd-laptop-17-3-inch.md": {
	id: "hp-17-cn2760nd-laptop-17-3-inch.md";
  slug: "hp-17-cn2760nd-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-cn2770nd-laptop-17-3-inch.md": {
	id: "hp-17-cn2770nd-laptop-17-3-inch.md";
  slug: "hp-17-cn2770nd-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-cn2936nd.md": {
	id: "hp-17-cn2936nd.md";
  slug: "hp-17-cn2936nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-cn2951nd.md": {
	id: "hp-17-cn2951nd.md";
  slug: "hp-17-cn2951nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-cp0104nw-17-3-f-hd-ryzen-7-5825u-8gb-512gb-w11.md": {
	id: "hp-17-cp0104nw-17-3-f-hd-ryzen-7-5825u-8gb-512gb-w11.md";
  slug: "hp-17-cp0104nw-17-3-f-hd-ryzen-7-5825u-8gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-cp0971nd.md": {
	id: "hp-17-cp0971nd.md";
  slug: "hp-17-cp0971nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-cp1275nd-5625u-notebook-43-9-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md": {
	id: "hp-17-cp1275nd-5625u-notebook-43-9-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md";
  slug: "hp-17-cp1275nd-5625u-notebook-43-9-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-cp1770nd-laptop-17-3-inch.md": {
	id: "hp-17-cp1770nd-laptop-17-3-inch.md";
  slug: "hp-17-cp1770nd-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-cp2050nd-17-fhd-r5-7520u-8gb-512gb-w11.md": {
	id: "hp-17-cp2050nd-17-fhd-r5-7520u-8gb-512gb-w11.md";
  slug: "hp-17-cp2050nd-17-fhd-r5-7520u-8gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-cp2055nd-windows-11-home-17-3-amd-ryzen-5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md": {
	id: "hp-17-cp2055nd-windows-11-home-17-3-amd-ryzen-5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md";
  slug: "hp-17-cp2055nd-windows-11-home-17-3-amd-ryzen-5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-cp2535nd-870l2ea-abh-qwerty.md": {
	id: "hp-17-cp2535nd-870l2ea-abh-qwerty.md";
  slug: "hp-17-cp2535nd-870l2ea-abh-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-cp2750nd-laptop-17-3-inch.md": {
	id: "hp-17-cp2750nd-laptop-17-3-inch.md";
  slug: "hp-17-cp2750nd-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-17-cp2755nd-laptop-17-3-inch.md": {
	id: "hp-17-cp2755nd-laptop-17-3-inch.md";
  slug: "hp-17-cp2755nd-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g10-i5-1335u-16gb-512gb-ssd-15-6-w11p.md": {
	id: "hp-250-g10-i5-1335u-16gb-512gb-ssd-15-6-w11p.md";
  slug: "hp-250-g10-i5-1335u-16gb-512gb-ssd-15-6-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g10-i5-1335u-16gb-512gb-ssd-15-6-windows-11-pro.md": {
	id: "hp-250-g10-i5-1335u-16gb-512gb-ssd-15-6-windows-11-pro.md";
  slug: "hp-250-g10-i5-1335u-16gb-512gb-ssd-15-6-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g10-zakelijke-laptop-15-6-fhd-i5-1335u-8gb-512gb-w11p-turbo-silver.md": {
	id: "hp-250-g10-zakelijke-laptop-15-6-fhd-i5-1335u-8gb-512gb-w11p-turbo-silver.md";
  slug: "hp-250-g10-zakelijke-laptop-15-6-fhd-i5-1335u-8gb-512gb-w11p-turbo-silver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g8-15-6-fhd-ips-intel-core-i5-8gb-ddr4-256gb-m-2-ssd-w11-pro.md": {
	id: "hp-250-g8-15-6-fhd-ips-intel-core-i5-8gb-ddr4-256gb-m-2-ssd-w11-pro.md";
  slug: "hp-250-g8-15-6-fhd-ips-intel-core-i5-8gb-ddr4-256gb-m-2-ssd-w11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g8-15-6-fhd-ips-intel-core-i5-8gb-ddr4-256gb-m-2-ssd-w11p-zwart.md": {
	id: "hp-250-g8-15-6-fhd-ips-intel-core-i5-8gb-ddr4-256gb-m-2-ssd-w11p-zwart.md";
  slug: "hp-250-g8-15-6-fhd-ips-intel-core-i5-8gb-ddr4-256gb-m-2-ssd-w11p-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g8-6-core-ryzen-5-15-6-zakelijke-laptop-notebook-amd-r5-5500u-1tb-ssd-16gb-ram-windows-11-pro.md": {
	id: "hp-250-g8-6-core-ryzen-5-15-6-zakelijke-laptop-notebook-amd-r5-5500u-1tb-ssd-16gb-ram-windows-11-pro.md";
  slug: "hp-250-g8-6-core-ryzen-5-15-6-zakelijke-laptop-notebook-amd-r5-5500u-1tb-ssd-16gb-ram-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g8-6-core-ryzen-5-15-6-zakelijke-laptop-notebook-amd-r5-5500u-256gb-ssd-16gb-ram-windows-11-pro.md": {
	id: "hp-250-g8-6-core-ryzen-5-15-6-zakelijke-laptop-notebook-amd-r5-5500u-256gb-ssd-16gb-ram-windows-11-pro.md";
  slug: "hp-250-g8-6-core-ryzen-5-15-6-zakelijke-laptop-notebook-amd-r5-5500u-256gb-ssd-16gb-ram-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g8-6-core-ryzen-5-15-6-zakelijke-laptop-notebook-amd-r5-5500u-2tb-ssd-16gb-ram-windows-11-pro.md": {
	id: "hp-250-g8-6-core-ryzen-5-15-6-zakelijke-laptop-notebook-amd-r5-5500u-2tb-ssd-16gb-ram-windows-11-pro.md";
  slug: "hp-250-g8-6-core-ryzen-5-15-6-zakelijke-laptop-notebook-amd-r5-5500u-2tb-ssd-16gb-ram-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g8-i5-1035g1-notebook-39-6-cm-full-hd-intel-core-i5-4-gb-ddr4-sdram-128-gb-ssd-wi-fi-6-windows-10-home-zwart.md": {
	id: "hp-250-g8-i5-1035g1-notebook-39-6-cm-full-hd-intel-core-i5-4-gb-ddr4-sdram-128-gb-ssd-wi-fi-6-windows-10-home-zwart.md";
  slug: "hp-250-g8-i5-1035g1-notebook-39-6-cm-full-hd-intel-core-i5-4-gb-ddr4-sdram-128-gb-ssd-wi-fi-6-windows-10-home-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g8-ryzen-5-6-core-laptop-15-6-f-hd-amd-r5-5500u-8gb-256gb-w11p.md": {
	id: "hp-250-g8-ryzen-5-6-core-laptop-15-6-f-hd-amd-r5-5500u-8gb-256gb-w11p.md";
  slug: "hp-250-g8-ryzen-5-6-core-laptop-15-6-f-hd-amd-r5-5500u-8gb-256gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g9-15-6-f-hd-i7-1255u-16gb-512gb-w11h.md": {
	id: "hp-250-g9-15-6-f-hd-i7-1255u-16gb-512gb-w11h.md";
  slug: "hp-250-g9-15-6-f-hd-i7-1255u-16gb-512gb-w11h";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g9-15-6-f-hd-i7-1255u-8gb-512gb-w11p.md": {
	id: "hp-250-g9-15-6-f-hd-i7-1255u-8gb-512gb-w11p.md";
  slug: "hp-250-g9-15-6-f-hd-i7-1255u-8gb-512gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g9-15-6-fhd-i7-1255u-16gb-ddr4-512gb-m2-ssd-windows-11-pro.md": {
	id: "hp-250-g9-15-6-fhd-i7-1255u-16gb-ddr4-512gb-m2-ssd-windows-11-pro.md";
  slug: "hp-250-g9-15-6-fhd-i7-1255u-16gb-ddr4-512gb-m2-ssd-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g9-15-6-fhp-i5-1235u-8gb-ddr4-256gb-m-2-ssd-windows-11-home.md": {
	id: "hp-250-g9-15-6-fhp-i5-1235u-8gb-ddr4-256gb-m-2-ssd-windows-11-home.md";
  slug: "hp-250-g9-15-6-fhp-i5-1235u-8gb-ddr4-256gb-m-2-ssd-windows-11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g9-15-6-full-hd-i7-1255u-8gb-512gb-ssd-windows-11-pro.md": {
	id: "hp-250-g9-15-6-full-hd-i7-1255u-8gb-512gb-ssd-windows-11-pro.md";
  slug: "hp-250-g9-15-6-full-hd-i7-1255u-8gb-512gb-ssd-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g9-i5-1235u-15-6-full-hd-intel-core-i5-16-gb-256-gb-ssd-w11-pro-donkergrijs-vingerafdruklezer-2jr-garantie.md": {
	id: "hp-250-g9-i5-1235u-15-6-full-hd-intel-core-i5-16-gb-256-gb-ssd-w11-pro-donkergrijs-vingerafdruklezer-2jr-garantie.md";
  slug: "hp-250-g9-i5-1235u-15-6-full-hd-intel-core-i5-16-gb-256-gb-ssd-w11-pro-donkergrijs-vingerafdruklezer-2jr-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g9-i5-1235u-16gb-512gb-ssd-w11-pro-15-6-fhd-silver.md": {
	id: "hp-250-g9-i5-1235u-16gb-512gb-ssd-w11-pro-15-6-fhd-silver.md";
  slug: "hp-250-g9-i5-1235u-16gb-512gb-ssd-w11-pro-15-6-fhd-silver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g9-i5-1235u-8gb-256gb-ssd-15-6-w11p.md": {
	id: "hp-250-g9-i5-1235u-8gb-256gb-ssd-15-6-w11p.md";
  slug: "hp-250-g9-i5-1235u-8gb-256gb-ssd-15-6-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g9-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-home-zwart.md": {
	id: "hp-250-g9-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-home-zwart.md";
  slug: "hp-250-g9-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-home-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g9-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-zwart.md": {
	id: "hp-250-g9-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-zwart.md";
  slug: "hp-250-g9-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g9-notebook-15-6-f-hd-i51235u-8gb-ram-256gb-w11p.md": {
	id: "hp-250-g9-notebook-15-6-f-hd-i51235u-8gb-ram-256gb-w11p.md";
  slug: "hp-250-g9-notebook-15-6-f-hd-i51235u-8gb-ram-256gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-250-g9-zakelijke-laptop-15-6-fhd-i5-1235u-8gb-512gb-w10p-dark-asteroid-silver.md": {
	id: "hp-250-g9-zakelijke-laptop-15-6-fhd-i5-1235u-8gb-512gb-w10p-dark-asteroid-silver.md";
  slug: "hp-250-g9-zakelijke-laptop-15-6-fhd-i5-1235u-8gb-512gb-w10p-dark-asteroid-silver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-255-g8-15-6-fhd-amd-ryzen-5-5500u-512gb-ssd-m-2-nvme-8gb-ram-windows-11-pro-zakelijk-student-laptop.md": {
	id: "hp-255-g8-15-6-fhd-amd-ryzen-5-5500u-512gb-ssd-m-2-nvme-8gb-ram-windows-11-pro-zakelijk-student-laptop.md";
  slug: "hp-255-g8-15-6-fhd-amd-ryzen-5-5500u-512gb-ssd-m-2-nvme-8gb-ram-windows-11-pro-zakelijk-student-laptop";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-255-g9-15-6-full-hd-ryzen-5-5625u-16gb-1tb-windows-11pro.md": {
	id: "hp-255-g9-15-6-full-hd-ryzen-5-5625u-16gb-1tb-windows-11pro.md";
  slug: "hp-255-g9-15-6-full-hd-ryzen-5-5625u-16gb-1tb-windows-11pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-255-g9-15-6-full-hd-ryzen-5-5625u-8gb-256gb-w11p.md": {
	id: "hp-255-g9-15-6-full-hd-ryzen-5-5625u-8gb-256gb-w11p.md";
  slug: "hp-255-g9-15-6-full-hd-ryzen-5-5625u-8gb-256gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-255-g9-15-6-fullhd-laptop-ryzen-5-5625u-8gb-512gb-radeon-rx-vega-7-windows-11-pro.md": {
	id: "hp-255-g9-15-6-fullhd-laptop-ryzen-5-5625u-8gb-512gb-radeon-rx-vega-7-windows-11-pro.md";
  slug: "hp-255-g9-15-6-fullhd-laptop-ryzen-5-5625u-8gb-512gb-radeon-rx-vega-7-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-440-14-inch-g9-notebook-35-6-cm-full-hd-intel-core-i7-1255u-16-gb-ram-512-gb-ssd-windows-11-pro-zilver.md": {
	id: "hp-440-14-inch-g9-notebook-35-6-cm-full-hd-intel-core-i7-1255u-16-gb-ram-512-gb-ssd-windows-11-pro-zilver.md";
  slug: "hp-440-14-inch-g9-notebook-35-6-cm-full-hd-intel-core-i7-1255u-16-gb-ram-512-gb-ssd-windows-11-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-470-g10-17-3-fhd-300n-ips-i5-1335u-16gb-512gb-ssd-w11p-back-lit-keyboard-finger-print-reader.md": {
	id: "hp-470-g10-17-3-fhd-300n-ips-i5-1335u-16gb-512gb-ssd-w11p-back-lit-keyboard-finger-print-reader.md";
  slug: "hp-470-g10-17-3-fhd-300n-ips-i5-1335u-16gb-512gb-ssd-w11p-back-lit-keyboard-finger-print-reader";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-470-g10-816b0ea.md": {
	id: "hp-470-g10-816b0ea.md";
  slug: "hp-470-g10-816b0ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-470-g10-i5-1335u-16gb-512gb-ssd-17-3-fhd-w11p-nl.md": {
	id: "hp-470-g10-i5-1335u-16gb-512gb-ssd-17-3-fhd-w11p-nl.md";
  slug: "hp-470-g10-i5-1335u-16gb-512gb-ssd-17-3-fhd-w11p-nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-470-g10-i7-1355u-16gb-512gb-ssd-17-3-windows-10-pro-verlicht-toetsenbord.md": {
	id: "hp-470-g10-i7-1355u-16gb-512gb-ssd-17-3-windows-10-pro-verlicht-toetsenbord.md";
  slug: "hp-470-g10-i7-1355u-16gb-512gb-ssd-17-3-windows-10-pro-verlicht-toetsenbord";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-470-g7-17-3-fhd-ag-i5-10210u-16gb-ddr4-512gb-ssd-w10-pro-verlicht-keyboard.md": {
	id: "hp-470-g7-17-3-fhd-ag-i5-10210u-16gb-ddr4-512gb-ssd-w10-pro-verlicht-keyboard.md";
  slug: "hp-470-g7-17-3-fhd-ag-i5-10210u-16gb-ddr4-512gb-ssd-w10-pro-verlicht-keyboard";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-470-g7-17-3-fhd-i7-10510u-radeon-530-2gb-8gb-ddr4-256gb-ssd-geen-dvd-brander-win-10-pro.md": {
	id: "hp-470-g7-17-3-fhd-i7-10510u-radeon-530-2gb-8gb-ddr4-256gb-ssd-geen-dvd-brander-win-10-pro.md";
  slug: "hp-470-g7-17-3-fhd-i7-10510u-radeon-530-2gb-8gb-ddr4-256gb-ssd-geen-dvd-brander-win-10-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-470-g7-17-3-fhd-ips-i7-10510u-radeon-530-2gb-16gb-ddr4-256gb-ssd-w10-pro.md": {
	id: "hp-470-g7-17-3-fhd-ips-i7-10510u-radeon-530-2gb-16gb-ddr4-256gb-ssd-w10-pro.md";
  slug: "hp-470-g7-17-3-fhd-ips-i7-10510u-radeon-530-2gb-16gb-ddr4-256gb-ssd-w10-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-470-g8-notebook-17-3-inch-intel-i5-256gb-windows-10-pro-zilver.md": {
	id: "hp-470-g8-notebook-17-3-inch-intel-i5-256gb-windows-10-pro-zilver.md";
  slug: "hp-470-g8-notebook-17-3-inch-intel-i5-256gb-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-470-g8-notebook-17-3-inch-intel-i7-16gb-512gb-windows-11-pro-zilver-verlicht-toetsenbord.md": {
	id: "hp-470-g8-notebook-17-3-inch-intel-i7-16gb-512gb-windows-11-pro-zilver-verlicht-toetsenbord.md";
  slug: "hp-470-g8-notebook-17-3-inch-intel-i7-16gb-512gb-windows-11-pro-zilver-verlicht-toetsenbord";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-470-g8-zakelijke-laptop-17-3-fhd-i5-1135g7-8gb-512gb-mx450-2gb-w10p-keyboard-verlichting.md": {
	id: "hp-470-g8-zakelijke-laptop-17-3-fhd-i5-1135g7-8gb-512gb-mx450-2gb-w10p-keyboard-verlichting.md";
  slug: "hp-470-g8-zakelijke-laptop-17-3-fhd-i5-1135g7-8gb-512gb-mx450-2gb-w10p-keyboard-verlichting";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-470-g8-zakelijke-laptop-17-3-fhd-i5-8gb-512gb-w10p-keyboard-verlichting.md": {
	id: "hp-470-g8-zakelijke-laptop-17-3-fhd-i5-8gb-512gb-w10p-keyboard-verlichting.md";
  slug: "hp-470-g8-zakelijke-laptop-17-3-fhd-i5-8gb-512gb-w10p-keyboard-verlichting";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-470-g9-fullhd-17-3-laptop-intel-core-i5-1235u-8gb-512gb-windows-10-pro.md": {
	id: "hp-470-g9-fullhd-17-3-laptop-intel-core-i5-1235u-8gb-512gb-windows-10-pro.md";
  slug: "hp-470-g9-fullhd-17-3-laptop-intel-core-i5-1235u-8gb-512gb-windows-10-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-470-g9-i5-1235u-notebook-43-9-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-zilver.md": {
	id: "hp-470-g9-i5-1235u-notebook-43-9-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-zilver.md";
  slug: "hp-470-g9-i5-1235u-notebook-43-9-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-470-g9-i7-1255u-16gb-512gb-ssd-17-3-fhd-w11p-verlicht-toetsenbord-2-jaar-garantie.md": {
	id: "hp-470-g9-i7-1255u-16gb-512gb-ssd-17-3-fhd-w11p-verlicht-toetsenbord-2-jaar-garantie.md";
  slug: "hp-470-g9-i7-1255u-16gb-512gb-ssd-17-3-fhd-w11p-verlicht-toetsenbord-2-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-470-g9-i7-1255u-16gb-geheugen-512gb-opslag-17-3-inch-windows-11-pro-verlicht-toetsenbord.md": {
	id: "hp-470-g9-i7-1255u-16gb-geheugen-512gb-opslag-17-3-inch-windows-11-pro-verlicht-toetsenbord.md";
  slug: "hp-470-g9-i7-1255u-16gb-geheugen-512gb-opslag-17-3-inch-windows-11-pro-verlicht-toetsenbord";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-470-g9-zakelijke-laptop-17-3-fhd-i5-1235u-16gb-512gb-w10p-keyboard-verlichting-2.md": {
	id: "hp-470-g9-zakelijke-laptop-17-3-fhd-i5-1235u-16gb-512gb-w10p-keyboard-verlichting-2.md";
  slug: "hp-470-g9-zakelijke-laptop-17-3-fhd-i5-1235u-16gb-512gb-w10p-keyboard-verlichting-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-470-g9-zakelijke-laptop-17-3-fhd-i5-1235u-16gb-512gb-w10p-keyboard-verlichting.md": {
	id: "hp-470-g9-zakelijke-laptop-17-3-fhd-i5-1235u-16gb-512gb-w10p-keyboard-verlichting.md";
  slug: "hp-470-g9-zakelijke-laptop-17-3-fhd-i5-1235u-16gb-512gb-w10p-keyboard-verlichting";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-dragonfly-folio-g3-i5-1235u-hybride-34-3-cm-touchscreen-wuxga-intel-core-i5-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-10-pro-zwart.md": {
	id: "hp-dragonfly-folio-g3-i5-1235u-hybride-34-3-cm-touchscreen-wuxga-intel-core-i5-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-10-pro-zwart.md";
  slug: "hp-dragonfly-folio-g3-i5-1235u-hybride-34-3-cm-touchscreen-wuxga-intel-core-i5-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-10-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-dragonfly-g4-819v6ea.md": {
	id: "hp-dragonfly-g4-819v6ea.md";
  slug: "hp-dragonfly-g4-819v6ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elite-dragonfly-g4-i7-1355u-notebook-34-3-cm-touchscreen-wuxga-intel-core-i7-32-gb-lpddr5-sdram-1-tb-ssd-wi-fi-6e-windows-11-pro-qwerty.md": {
	id: "hp-elite-dragonfly-g4-i7-1355u-notebook-34-3-cm-touchscreen-wuxga-intel-core-i7-32-gb-lpddr5-sdram-1-tb-ssd-wi-fi-6e-windows-11-pro-qwerty.md";
  slug: "hp-elite-dragonfly-g4-i7-1355u-notebook-34-3-cm-touchscreen-wuxga-intel-core-i7-32-gb-lpddr5-sdram-1-tb-ssd-wi-fi-6e-windows-11-pro-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-1040-g10-819y0ea.md": {
	id: "hp-elitebook-1040-g10-819y0ea.md";
  slug: "hp-elitebook-1040-g10-819y0ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-1040-g9-5z6c0ea-abh.md": {
	id: "hp-elitebook-1040-g9-5z6c0ea-abh.md";
  slug: "hp-elitebook-1040-g9-5z6c0ea-abh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-630-13-3-g10-laptop-33-8-cm-full-hd-intel-core-i7-i7-1355u-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zilver.md": {
	id: "hp-elitebook-630-13-3-g10-laptop-33-8-cm-full-hd-intel-core-i7-i7-1355u-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zilver.md";
  slug: "hp-elitebook-630-13-3-g10-laptop-33-8-cm-full-hd-intel-core-i7-i7-1355u-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-630-g10-816b4ea-133-inch-intel-core-i5-16-gb-512-gb-1769740.md": {
	id: "hp-elitebook-630-g10-816b4ea-133-inch-intel-core-i5-16-gb-512-gb-1769740.md";
  slug: "hp-elitebook-630-g10-816b4ea-133-inch-intel-core-i5-16-gb-512-gb-1769740";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-630-g10-85a95ea-133-inch-intel-core-i7-16-gb-512-gb-1769741.md": {
	id: "hp-elitebook-630-g10-85a95ea-133-inch-intel-core-i7-16-gb-512-gb-1769741.md";
  slug: "hp-elitebook-630-g10-85a95ea-133-inch-intel-core-i7-16-gb-512-gb-1769741";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-630-g10-85a95ea.md": {
	id: "hp-elitebook-630-g10-85a95ea.md";
  slug: "hp-elitebook-630-g10-85a95ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-630-g9-i7-1265u-16gb-256ssd-13inch.md": {
	id: "hp-elitebook-630-g9-i7-1265u-16gb-256ssd-13inch.md";
  slug: "hp-elitebook-630-g9-i7-1265u-16gb-256ssd-13inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-640-14-inch-g9-notebook-pc-laptop-zilver.md": {
	id: "hp-elitebook-640-14-inch-g9-notebook-pc-laptop-zilver.md";
  slug: "hp-elitebook-640-14-inch-g9-notebook-pc-laptop-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-640-g10-14-0-fullhd-laptop-intel-core-i5-1335u-16gb-512gb-ssd-windows-11-pro-2.md": {
	id: "hp-elitebook-640-g10-14-0-fullhd-laptop-intel-core-i5-1335u-16gb-512gb-ssd-windows-11-pro-2.md";
  slug: "hp-elitebook-640-g10-14-0-fullhd-laptop-intel-core-i5-1335u-16gb-512gb-ssd-windows-11-pro-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-640-g10-14-0-fullhd-laptop-intel-core-i5-1335u-16gb-512gb-ssd-windows-11-pro.md": {
	id: "hp-elitebook-640-g10-14-0-fullhd-laptop-intel-core-i5-1335u-16gb-512gb-ssd-windows-11-pro.md";
  slug: "hp-elitebook-640-g10-14-0-fullhd-laptop-intel-core-i5-1335u-16gb-512gb-ssd-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-640-g10-85a96ea-14-inch-intel-core-i7-16-gb-512-gb-1769743.md": {
	id: "hp-elitebook-640-g10-85a96ea-14-inch-intel-core-i7-16-gb-512-gb-1769743.md";
  slug: "hp-elitebook-640-g10-85a96ea-14-inch-intel-core-i7-16-gb-512-gb-1769743";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-640-g10-85a96ea.md": {
	id: "hp-elitebook-640-g10-85a96ea.md";
  slug: "hp-elitebook-640-g10-85a96ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-640-g10-85b85ea-14-inch-intel-core-i5-16-gb-512-gb-1769742.md": {
	id: "hp-elitebook-640-g10-85b85ea-14-inch-intel-core-i5-16-gb-512-gb-1769742.md";
  slug: "hp-elitebook-640-g10-85b85ea-14-inch-intel-core-i5-16-gb-512-gb-1769742";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-640-g10-85b85ea.md": {
	id: "hp-elitebook-640-g10-85b85ea.md";
  slug: "hp-elitebook-640-g10-85b85ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-640-g9-5y483ea.md": {
	id: "hp-elitebook-640-g9-5y483ea.md";
  slug: "hp-elitebook-640-g9-5y483ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-640-g9-81m83aa.md": {
	id: "hp-elitebook-640-g9-81m83aa.md";
  slug: "hp-elitebook-640-g9-81m83aa";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-640-g9-intel-core-i5-1235u-16gb-256gb-nvme-ssd-14-full-hd-verlicht-toetsenbord-vingerprint-scanner-windows-11-pro.md": {
	id: "hp-elitebook-640-g9-intel-core-i5-1235u-16gb-256gb-nvme-ssd-14-full-hd-verlicht-toetsenbord-vingerprint-scanner-windows-11-pro.md";
  slug: "hp-elitebook-640-g9-intel-core-i5-1235u-16gb-256gb-nvme-ssd-14-full-hd-verlicht-toetsenbord-vingerprint-scanner-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-640-g9-zakelijke-laptop-14-fhd-400-nits-i5-1235u-16gb-512gb-w11p-keyboard-verlichting-3jaar-nbd-garantie.md": {
	id: "hp-elitebook-640-g9-zakelijke-laptop-14-fhd-400-nits-i5-1235u-16gb-512gb-w11p-keyboard-verlichting-3jaar-nbd-garantie.md";
  slug: "hp-elitebook-640-g9-zakelijke-laptop-14-fhd-400-nits-i5-1235u-16gb-512gb-w11p-keyboard-verlichting-3jaar-nbd-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-645-g9-14-fhd-ryzel-7-5825u-16gb-512gb-ssd-w10-w11-pro-verlicht-keyboard-3-jaar-onsite.md": {
	id: "hp-elitebook-645-g9-14-fhd-ryzel-7-5825u-16gb-512gb-ssd-w10-w11-pro-verlicht-keyboard-3-jaar-onsite.md";
  slug: "hp-elitebook-645-g9-14-fhd-ryzel-7-5825u-16gb-512gb-ssd-w10-w11-pro-verlicht-keyboard-3-jaar-onsite";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-650-15-6-inch-g9-i7-1255-16gb-512gb-ssd.md": {
	id: "hp-elitebook-650-15-6-inch-g9-i7-1255-16gb-512gb-ssd.md";
  slug: "hp-elitebook-650-15-6-inch-g9-i7-1255-16gb-512gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-650-g10-85a97ea-156-inch-intel-core-i7-16-gb-512-gb-1769745.md": {
	id: "hp-elitebook-650-g10-85a97ea-156-inch-intel-core-i7-16-gb-512-gb-1769745.md";
  slug: "hp-elitebook-650-g10-85a97ea-156-inch-intel-core-i7-16-gb-512-gb-1769745";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-650-g10-85a97ea.md": {
	id: "hp-elitebook-650-g10-85a97ea.md";
  slug: "hp-elitebook-650-g10-85a97ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-650-g10-85b95ea.md": {
	id: "hp-elitebook-650-g10-85b95ea.md";
  slug: "hp-elitebook-650-g10-85b95ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-650-g9-15-6-fhd-i5-1235u-8gb-512gb-ssd-w10-pro-qwerty-nl.md": {
	id: "hp-elitebook-650-g9-15-6-fhd-i5-1235u-8gb-512gb-ssd-w10-pro-qwerty-nl.md";
  slug: "hp-elitebook-650-g9-15-6-fhd-i5-1235u-8gb-512gb-ssd-w10-pro-qwerty-nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-650-g9-15-6-fhd-i7-1255u-8gb-512gb-ssd-w11-pro-qwerty-nl.md": {
	id: "hp-elitebook-650-g9-15-6-fhd-i7-1255u-8gb-512gb-ssd-w11-pro-qwerty-nl.md";
  slug: "hp-elitebook-650-g9-15-6-fhd-i7-1255u-8gb-512gb-ssd-w11-pro-qwerty-nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-650-g9-5y489ea.md": {
	id: "hp-elitebook-650-g9-5y489ea.md";
  slug: "hp-elitebook-650-g9-5y489ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-650-g9-822g7aa.md": {
	id: "hp-elitebook-650-g9-822g7aa.md";
  slug: "hp-elitebook-650-g9-822g7aa";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-650-g9-notebook-15-6-fhd-i5-1235u-16gb-512gb-ssd-w11p-400-nits-3y-warranty-onsite.md": {
	id: "hp-elitebook-650-g9-notebook-15-6-fhd-i5-1235u-16gb-512gb-ssd-w11p-400-nits-3y-warranty-onsite.md";
  slug: "hp-elitebook-650-g9-notebook-15-6-fhd-i5-1235u-16gb-512gb-ssd-w11p-400-nits-3y-warranty-onsite";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-650-g9-notebook-i5-1245u-16gb-512ssd-15-6inch.md": {
	id: "hp-elitebook-650-g9-notebook-i5-1245u-16gb-512ssd-15-6inch.md";
  slug: "hp-elitebook-650-g9-notebook-i5-1245u-16gb-512ssd-15-6inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-655-g10-817n8ea.md": {
	id: "hp-elitebook-655-g10-817n8ea.md";
  slug: "hp-elitebook-655-g10-817n8ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-655-g9-r5-5625u-16gb-512gb-ssd-15-6-fhd-w11pro-verlicht-toetsenbord-5n472ea-abh.md": {
	id: "hp-elitebook-655-g9-r5-5625u-16gb-512gb-ssd-15-6-fhd-w11pro-verlicht-toetsenbord-5n472ea-abh.md";
  slug: "hp-elitebook-655-g9-r5-5625u-16gb-512gb-ssd-15-6-fhd-w11pro-verlicht-toetsenbord-5n472ea-abh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-830-13-inch-g9-notebook-pc.md": {
	id: "hp-elitebook-830-13-inch-g9-notebook-pc.md";
  slug: "hp-elitebook-830-13-inch-g9-notebook-pc";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-830-g10-6t2b7ea-133-inch-intel-core-i5-16-gb-512-gb-1769746.md": {
	id: "hp-elitebook-830-g10-6t2b7ea-133-inch-intel-core-i5-16-gb-512-gb-1769746.md";
  slug: "hp-elitebook-830-g10-6t2b7ea-133-inch-intel-core-i5-16-gb-512-gb-1769746";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-830-g10-6t2b7ea.md": {
	id: "hp-elitebook-830-g10-6t2b7ea.md";
  slug: "hp-elitebook-830-g10-6t2b7ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-830-g10-819u5ea-133-inch-intel-core-i7-16-gb-512-gb-1769747.md": {
	id: "hp-elitebook-830-g10-819u5ea-133-inch-intel-core-i7-16-gb-512-gb-1769747.md";
  slug: "hp-elitebook-830-g10-819u5ea-133-inch-intel-core-i7-16-gb-512-gb-1769747";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-830-g6-13-3-full-hd-i5-8250u-16gb-256gb-ssd-win-10-pro-hdmi.md": {
	id: "hp-elitebook-830-g6-13-3-full-hd-i5-8250u-16gb-256gb-ssd-win-10-pro-hdmi.md";
  slug: "hp-elitebook-830-g6-13-3-full-hd-i5-8250u-16gb-256gb-ssd-win-10-pro-hdmi";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-830-g6-i5-8365u-notebook-33-8-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver-2.md": {
	id: "hp-elitebook-830-g6-i5-8365u-notebook-33-8-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver-2.md";
  slug: "hp-elitebook-830-g6-i5-8365u-notebook-33-8-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-830-g6-i5-8365u-notebook-33-8-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver.md": {
	id: "hp-elitebook-830-g6-i5-8365u-notebook-33-8-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver.md";
  slug: "hp-elitebook-830-g6-i5-8365u-notebook-33-8-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-830-g8-i5-1135g7-8gb-256gb-ssd-13-3-fhd.md": {
	id: "hp-elitebook-830-g8-i5-1135g7-8gb-256gb-ssd-13-3-fhd.md";
  slug: "hp-elitebook-830-g8-i5-1135g7-8gb-256gb-ssd-13-3-fhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-830-g9-zakelijke-laptop-13-3-fhd-i7-1255u-16gb-1t-ssd-w10p-3-jaar-garantie-carepack.md": {
	id: "hp-elitebook-830-g9-zakelijke-laptop-13-3-fhd-i7-1255u-16gb-1t-ssd-w10p-3-jaar-garantie-carepack.md";
  slug: "hp-elitebook-830-g9-zakelijke-laptop-13-3-fhd-i7-1255u-16gb-1t-ssd-w10p-3-jaar-garantie-carepack";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-aero-g8-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver-2.md": {
	id: "hp-elitebook-840-aero-g8-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver-2.md";
  slug: "hp-elitebook-840-aero-g8-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-aero-g8-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver.md": {
	id: "hp-elitebook-840-aero-g8-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver.md";
  slug: "hp-elitebook-840-aero-g8-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g10-6t2b5ea-14-inch-intel-core-i5-16-gb-512-gb-1769748.md": {
	id: "hp-elitebook-840-g10-6t2b5ea-14-inch-intel-core-i5-16-gb-512-gb-1769748.md";
  slug: "hp-elitebook-840-g10-6t2b5ea-14-inch-intel-core-i5-16-gb-512-gb-1769748";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g10-6t2b5ea.md": {
	id: "hp-elitebook-840-g10-6t2b5ea.md";
  slug: "hp-elitebook-840-g10-6t2b5ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g6-14-full-hd-intel-core-i5-8265-16gb-ram-256gb-ssd-hdmi-windows-10-pro.md": {
	id: "hp-elitebook-840-g6-14-full-hd-intel-core-i5-8265-16gb-ram-256gb-ssd-hdmi-windows-10-pro.md";
  slug: "hp-elitebook-840-g6-14-full-hd-intel-core-i5-8265-16gb-ram-256gb-ssd-hdmi-windows-10-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g6-i5-8265u-8gb-256ssd-win10.md": {
	id: "hp-elitebook-840-g6-i5-8265u-8gb-256ssd-win10.md";
  slug: "hp-elitebook-840-g6-i5-8265u-8gb-256ssd-win10";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g7-14-fhd-ips-i5-10210u-16gb-512gb-ssd-win10-pro-1j6f7ea.md": {
	id: "hp-elitebook-840-g7-14-fhd-ips-i5-10210u-16gb-512gb-ssd-win10-pro-1j6f7ea.md";
  slug: "hp-elitebook-840-g7-14-fhd-ips-i5-10210u-16gb-512gb-ssd-win10-pro-1j6f7ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g7-14-i5-8gb-256gb.md": {
	id: "hp-elitebook-840-g7-14-i5-8gb-256gb.md";
  slug: "hp-elitebook-840-g7-14-i5-8gb-256gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g7-ddr4-sdram-notebook-35-6-cm-1920-x-1080-pixels-intel-10de-generatie-core-i7-8-gb-256-gb-ssd-wi-fi-6-windows-10-pro-zilver.md": {
	id: "hp-elitebook-840-g7-ddr4-sdram-notebook-35-6-cm-1920-x-1080-pixels-intel-10de-generatie-core-i7-8-gb-256-gb-ssd-wi-fi-6-windows-10-pro-zilver.md";
  slug: "hp-elitebook-840-g7-ddr4-sdram-notebook-35-6-cm-1920-x-1080-pixels-intel-10de-generatie-core-i7-8-gb-256-gb-ssd-wi-fi-6-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g8-14-fhd-i5-1135g7-16gb-512gb-w10p-keyboard-verlichting.md": {
	id: "hp-elitebook-840-g8-14-fhd-i5-1135g7-16gb-512gb-w10p-keyboard-verlichting.md";
  slug: "hp-elitebook-840-g8-14-fhd-i5-1135g7-16gb-512gb-w10p-keyboard-verlichting";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g8-14-i7-8gb-256gb.md": {
	id: "hp-elitebook-840-g8-14-i7-8gb-256gb.md";
  slug: "hp-elitebook-840-g8-14-i7-8gb-256gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g8-ddr4-sdram-notebook-35-6-cm-1920-x-1080-pixels-intel-11de-generatie-core-i5-8-gb-256-gb-ssd-wi-fi-6-windows-10-pro-zilver.md": {
	id: "hp-elitebook-840-g8-ddr4-sdram-notebook-35-6-cm-1920-x-1080-pixels-intel-11de-generatie-core-i5-8-gb-256-gb-ssd-wi-fi-6-windows-10-pro-zilver.md";
  slug: "hp-elitebook-840-g8-ddr4-sdram-notebook-35-6-cm-1920-x-1080-pixels-intel-11de-generatie-core-i5-8-gb-256-gb-ssd-wi-fi-6-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g8-i5-1135g7-8gb-256gb.md": {
	id: "hp-elitebook-840-g8-i5-1135g7-8gb-256gb.md";
  slug: "hp-elitebook-840-g8-i5-1135g7-8gb-256gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g8-i7-1165g7-notebook-35-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-10-pro-zilver.md": {
	id: "hp-elitebook-840-g8-i7-1165g7-notebook-35-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-10-pro-zilver.md";
  slug: "hp-elitebook-840-g8-i7-1165g7-notebook-35-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g8-laptop-14-inch-intel-i5-256gb-windows-10-pro-zilver.md": {
	id: "hp-elitebook-840-g8-laptop-14-inch-intel-i5-256gb-windows-10-pro-zilver.md";
  slug: "hp-elitebook-840-g8-laptop-14-inch-intel-i5-256gb-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g8-notebook-pc-14-windows-10-pro-intel-core-i5-16gb-ram-512gb-ssd-fhd.md": {
	id: "hp-elitebook-840-g8-notebook-pc-14-windows-10-pro-intel-core-i5-16gb-ram-512gb-ssd-fhd.md";
  slug: "hp-elitebook-840-g8-notebook-pc-14-windows-10-pro-intel-core-i5-16gb-ram-512gb-ssd-fhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g9-14-0-f-hd-i5-1235u-16gb-ram-512-gb-w10p.md": {
	id: "hp-elitebook-840-g9-14-0-f-hd-i5-1235u-16gb-ram-512-gb-w10p.md";
  slug: "hp-elitebook-840-g9-14-0-f-hd-i5-1235u-16gb-ram-512-gb-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g9-14-wuxga-i7-1255u-16gb-512gb-ssd-wi-fi-6e-w10pro-w11pro-verlicht-keyboard-3-jaar-onsite-hardware-support.md": {
	id: "hp-elitebook-840-g9-14-wuxga-i7-1255u-16gb-512gb-ssd-wi-fi-6e-w10pro-w11pro-verlicht-keyboard-3-jaar-onsite-hardware-support.md";
  slug: "hp-elitebook-840-g9-14-wuxga-i7-1255u-16gb-512gb-ssd-wi-fi-6e-w10pro-w11pro-verlicht-keyboard-3-jaar-onsite-hardware-support";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g9-zakelijke-laptop-14-fhd-400-nits-i5-1235u-16gb-512gb-w11p-keyboard-verlichting-3-jaar-nbd-garantie.md": {
	id: "hp-elitebook-840-g9-zakelijke-laptop-14-fhd-400-nits-i5-1235u-16gb-512gb-w11p-keyboard-verlichting-3-jaar-nbd-garantie.md";
  slug: "hp-elitebook-840-g9-zakelijke-laptop-14-fhd-400-nits-i5-1235u-16gb-512gb-w11p-keyboard-verlichting-3-jaar-nbd-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g9-zakelijke-laptop-14-fhd-i5-1235u-16gb-512gb-w10p-3-jaar-garantie-carepack.md": {
	id: "hp-elitebook-840-g9-zakelijke-laptop-14-fhd-i5-1235u-16gb-512gb-w10p-3-jaar-garantie-carepack.md";
  slug: "hp-elitebook-840-g9-zakelijke-laptop-14-fhd-i5-1235u-16gb-512gb-w10p-3-jaar-garantie-carepack";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g9-zakelijke-laptop-14-fhd-i7-1255u-16gb-512gb-w10p.md": {
	id: "hp-elitebook-840-g9-zakelijke-laptop-14-fhd-i7-1255u-16gb-512gb-w10p.md";
  slug: "hp-elitebook-840-g9-zakelijke-laptop-14-fhd-i7-1255u-16gb-512gb-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-840-g9.md": {
	id: "hp-elitebook-840-g9.md";
  slug: "hp-elitebook-840-g9";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-845-g7-notebook-14.md": {
	id: "hp-elitebook-845-g7-notebook-14.md";
  slug: "hp-elitebook-845-g7-notebook-14";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-845-g8-14-amd-ryzen-5-pro-5650u-16gb-ddr4ram-256gb-nvme-ssd-amd-radeon-graphics-windows-10-pro.md": {
	id: "hp-elitebook-845-g8-14-amd-ryzen-5-pro-5650u-16gb-ddr4ram-256gb-nvme-ssd-amd-radeon-graphics-windows-10-pro.md";
  slug: "hp-elitebook-845-g8-14-amd-ryzen-5-pro-5650u-16gb-ddr4ram-256gb-nvme-ssd-amd-radeon-graphics-windows-10-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-845-g8-5650u-notebook-35-6-cm-full-hd-amd-ryzen-5-pro-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-10-pro-zilver.md": {
	id: "hp-elitebook-845-g8-5650u-notebook-35-6-cm-full-hd-amd-ryzen-5-pro-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-10-pro-zilver.md";
  slug: "hp-elitebook-845-g8-5650u-notebook-35-6-cm-full-hd-amd-ryzen-5-pro-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-845-g9-zakelijke-laptop-14-fhd-400-nits-r7-6850u-16gb-512gb-w11p-keyboard-verlichting-3-jaar-garantie.md": {
	id: "hp-elitebook-845-g9-zakelijke-laptop-14-fhd-400-nits-r7-6850u-16gb-512gb-w11p-keyboard-verlichting-3-jaar-garantie.md";
  slug: "hp-elitebook-845-g9-zakelijke-laptop-14-fhd-400-nits-r7-6850u-16gb-512gb-w11p-keyboard-verlichting-3-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-850-g7-ddr4-sdram-notebook-39-6-cm-1920-x-1080-pixels-intel-10de-generatie-core-i5-8-gb-256-gb-ssd-wi-fi-6-windows-10-pro-zilver.md": {
	id: "hp-elitebook-850-g7-ddr4-sdram-notebook-39-6-cm-1920-x-1080-pixels-intel-10de-generatie-core-i5-8-gb-256-gb-ssd-wi-fi-6-windows-10-pro-zilver.md";
  slug: "hp-elitebook-850-g7-ddr4-sdram-notebook-39-6-cm-1920-x-1080-pixels-intel-10de-generatie-core-i5-8-gb-256-gb-ssd-wi-fi-6-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-850-g8-15-fhd-i5-1145g7-8gb-512gb-w11-pro.md": {
	id: "hp-elitebook-850-g8-15-fhd-i5-1145g7-8gb-512gb-w11-pro.md";
  slug: "hp-elitebook-850-g8-15-fhd-i5-1145g7-8gb-512gb-w11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-850-g8-i5-1135g7-15-6-fhd-sure-view-1000-nits-ir-camera-8gb-256gb-pcie-nvme-tlc-ssd-w10-pro-backlit-wlan-bt-fp-sensor-3y-nbd-onsite-qwerty.md": {
	id: "hp-elitebook-850-g8-i5-1135g7-15-6-fhd-sure-view-1000-nits-ir-camera-8gb-256gb-pcie-nvme-tlc-ssd-w10-pro-backlit-wlan-bt-fp-sensor-3y-nbd-onsite-qwerty.md";
  slug: "hp-elitebook-850-g8-i5-1135g7-15-6-fhd-sure-view-1000-nits-ir-camera-8gb-256gb-pcie-nvme-tlc-ssd-w10-pro-backlit-wlan-bt-fp-sensor-3y-nbd-onsite-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-850-g8-i5-1135g7-8gb-256gb-ssd-15-6-fhd-w10-pro-verlicht-toetsenbord-4g-lte.md": {
	id: "hp-elitebook-850-g8-i5-1135g7-8gb-256gb-ssd-15-6-fhd-w10-pro-verlicht-toetsenbord-4g-lte.md";
  slug: "hp-elitebook-850-g8-i5-1135g7-8gb-256gb-ssd-15-6-fhd-w10-pro-verlicht-toetsenbord-4g-lte";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-850-g8-notebook-pc-intel-core-i5-1135g7-8gb-256gb-ssd-15-6-fhd-w10-pro-verlicht-toetsenbord.md": {
	id: "hp-elitebook-850-g8-notebook-pc-intel-core-i5-1135g7-8gb-256gb-ssd-15-6-fhd-w10-pro-verlicht-toetsenbord.md";
  slug: "hp-elitebook-850-g8-notebook-pc-intel-core-i5-1135g7-8gb-256gb-ssd-15-6-fhd-w10-pro-verlicht-toetsenbord";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-850-g8-zakelijke-laptop-15-6-fhd-i7-1165g7-16gb-512gb-w10p.md": {
	id: "hp-elitebook-850-g8-zakelijke-laptop-15-6-fhd-i7-1165g7-16gb-512gb-w10p.md";
  slug: "hp-elitebook-850-g8-zakelijke-laptop-15-6-fhd-i7-1165g7-16gb-512gb-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-860-16-inch-g9-notebook-pc.md": {
	id: "hp-elitebook-860-16-inch-g9-notebook-pc.md";
  slug: "hp-elitebook-860-16-inch-g9-notebook-pc";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-860-g10-6t2b0ea-16-inch-intel-core-i5-16-gb-512-gb-1769750.md": {
	id: "hp-elitebook-860-g10-6t2b0ea-16-inch-intel-core-i5-16-gb-512-gb-1769750.md";
  slug: "hp-elitebook-860-g10-6t2b0ea-16-inch-intel-core-i5-16-gb-512-gb-1769750";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-860-g10-6t2b0ea.md": {
	id: "hp-elitebook-860-g10-6t2b0ea.md";
  slug: "hp-elitebook-860-g10-6t2b0ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-860-g10-6t2b2ea-16-inch-intel-core-i7-16-gb-512-gb-1769751.md": {
	id: "hp-elitebook-860-g10-6t2b2ea-16-inch-intel-core-i7-16-gb-512-gb-1769751.md";
  slug: "hp-elitebook-860-g10-6t2b2ea-16-inch-intel-core-i7-16-gb-512-gb-1769751";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-860-g10-6t2b2ea.md": {
	id: "hp-elitebook-860-g10-6t2b2ea.md";
  slug: "hp-elitebook-860-g10-6t2b2ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-860-g9-16-i7-1255u-16gb-512gb-ssd-w10pro-w11pro-verlicht-keyboard-3-jaar-onsite.md": {
	id: "hp-elitebook-860-g9-16-i7-1255u-16gb-512gb-ssd-w10pro-w11pro-verlicht-keyboard-3-jaar-onsite.md";
  slug: "hp-elitebook-860-g9-16-i7-1255u-16gb-512gb-ssd-w10pro-w11pro-verlicht-keyboard-3-jaar-onsite";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-860-g9-16-wuxga-i5-1235u-16gb-256gb-ssd-windows-11-pro-wifi-verlicht-keyboard.md": {
	id: "hp-elitebook-860-g9-16-wuxga-i5-1235u-16gb-256gb-ssd-windows-11-pro-wifi-verlicht-keyboard.md";
  slug: "hp-elitebook-860-g9-16-wuxga-i5-1235u-16gb-256gb-ssd-windows-11-pro-wifi-verlicht-keyboard";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-860-g9-5z6b6ea.md": {
	id: "hp-elitebook-860-g9-5z6b6ea.md";
  slug: "hp-elitebook-860-g9-5z6b6ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-860-g9-i7-1260p-notebook-40-6-cm-wuxga-intel-core-i7-32-gb-ddr5-sdram-1000-gb-ssd-wi-fi-6e-windows-10-pro-zilver.md": {
	id: "hp-elitebook-860-g9-i7-1260p-notebook-40-6-cm-wuxga-intel-core-i7-32-gb-ddr5-sdram-1000-gb-ssd-wi-fi-6e-windows-10-pro-zilver.md";
  slug: "hp-elitebook-860-g9-i7-1260p-notebook-40-6-cm-wuxga-intel-core-i7-32-gb-ddr5-sdram-1000-gb-ssd-wi-fi-6e-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-860-g9-zakelijke-laptop-16-fhd-i7-1255u-16gb-512gb-w11p-keyboard-verlichting-3jaar-nbd-garantie.md": {
	id: "hp-elitebook-860-g9-zakelijke-laptop-16-fhd-i7-1255u-16gb-512gb-w11p-keyboard-verlichting-3jaar-nbd-garantie.md";
  slug: "hp-elitebook-860-g9-zakelijke-laptop-16-fhd-i7-1255u-16gb-512gb-w11p-keyboard-verlichting-3jaar-nbd-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-865-g9-zakelijke-laptop-16-fhd-400-nits-r7-6850u-16gb-512gb-w11p-keyboard-verlichting-3-jaar-garantie.md": {
	id: "hp-elitebook-865-g9-zakelijke-laptop-16-fhd-400-nits-r7-6850u-16gb-512gb-w11p-keyboard-verlichting-3-jaar-garantie.md";
  slug: "hp-elitebook-865-g9-zakelijke-laptop-16-fhd-400-nits-r7-6850u-16gb-512gb-w11p-keyboard-verlichting-3-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-computadora-portatil-850-g5-notebook-zilver-39-6-cm-1920-x-1080-pixels-intel-8de-generatie-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-pro.md": {
	id: "hp-elitebook-computadora-portatil-850-g5-notebook-zilver-39-6-cm-1920-x-1080-pixels-intel-8de-generatie-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-pro.md";
  slug: "hp-elitebook-computadora-portatil-850-g5-notebook-zilver-39-6-cm-1920-x-1080-pixels-intel-8de-generatie-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-x360-1040-g8-zakelijke-laptop-14-fhd-touchscreen-i7-1165g7-16gb-512gb-w10p-keyboard-verlichting.md": {
	id: "hp-elitebook-x360-1040-g8-zakelijke-laptop-14-fhd-touchscreen-i7-1165g7-16gb-512gb-w10p-keyboard-verlichting.md";
  slug: "hp-elitebook-x360-1040-g8-zakelijke-laptop-14-fhd-touchscreen-i7-1165g7-16gb-512gb-w10p-keyboard-verlichting";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-x360-830-g8-i5-1135g7-hybride-33-8-cm-touchscreen-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver.md": {
	id: "hp-elitebook-x360-830-g8-i5-1135g7-hybride-33-8-cm-touchscreen-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver.md";
  slug: "hp-elitebook-x360-830-g8-i5-1135g7-hybride-33-8-cm-touchscreen-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-elitebook-x360-elite-x360-830-13-inch-g9-2-in-1-notebook-pc.md": {
	id: "hp-elitebook-x360-elite-x360-830-13-inch-g9-2-in-1-notebook-pc.md";
  slug: "hp-elitebook-x360-elite-x360-830-13-inch-g9-2-in-1-notebook-pc";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-15-fe0865nd-156-inch-intel-core-i7-16-gb-1-tb-1758393.md": {
	id: "hp-envy-15-fe0865nd-156-inch-intel-core-i7-16-gb-1-tb-1758393.md";
  slug: "hp-envy-15-fe0865nd-156-inch-intel-core-i7-16-gb-1-tb-1758393";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-16-h0250nd-1739398.md": {
	id: "hp-envy-16-h0250nd-1739398.md";
  slug: "hp-envy-16-h0250nd-1739398";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-16-h0250nd.md": {
	id: "hp-envy-16-h0250nd.md";
  slug: "hp-envy-16-h0250nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-16-h0375nd-i9-12900h-notebook-40-6-cm-touchscreen-uhd-intel-core-i9-32-gb-ddr5-sdram-2000-gb-ssd-nvidia-geforce-rtx-3060-wi-fi-6e-windows-11-home-zilver.md": {
	id: "hp-envy-16-h0375nd-i9-12900h-notebook-40-6-cm-touchscreen-uhd-intel-core-i9-32-gb-ddr5-sdram-2000-gb-ssd-nvidia-geforce-rtx-3060-wi-fi-6e-windows-11-home-zilver.md";
  slug: "hp-envy-16-h0375nd-i9-12900h-notebook-40-6-cm-touchscreen-uhd-intel-core-i9-32-gb-ddr5-sdram-2000-gb-ssd-nvidia-geforce-rtx-3060-wi-fi-6e-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-16-h0585nd-qwerty.md": {
	id: "hp-envy-16-h0585nd-qwerty.md";
  slug: "hp-envy-16-h0585nd-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-16-h0770nd-creator-laptop-16-inch.md": {
	id: "hp-envy-16-h0770nd-creator-laptop-16-inch.md";
  slug: "hp-envy-16-h0770nd-creator-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-16-h1025nd-16-inch-intel-core-i7-16-gb-1-tb-1761679.md": {
	id: "hp-envy-16-h1025nd-16-inch-intel-core-i7-16-gb-1-tb-1761679.md";
  slug: "hp-envy-16-h1025nd-16-inch-intel-core-i7-16-gb-1-tb-1761679";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-16-h1770nd-creator-laptop-16-inch.md": {
	id: "hp-envy-16-h1770nd-creator-laptop-16-inch.md";
  slug: "hp-envy-16-h1770nd-creator-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-16-h1775nd-creator-laptop-16-inch.md": {
	id: "hp-envy-16-h1775nd-creator-laptop-16-inch.md";
  slug: "hp-envy-16-h1775nd-creator-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-16-h1791nd-creator-laptop-16-inch.md": {
	id: "hp-envy-16-h1791nd-creator-laptop-16-inch.md";
  slug: "hp-envy-16-h1791nd-creator-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-16-h1885nd-16-inch-intel-core-i7-16-gb-1-tb-1758395.md": {
	id: "hp-envy-16-h1885nd-16-inch-intel-core-i7-16-gb-1-tb-1758395.md";
  slug: "hp-envy-16-h1885nd-16-inch-intel-core-i7-16-gb-1-tb-1758395";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-16-h1970nd.md": {
	id: "hp-envy-16-h1970nd.md";
  slug: "hp-envy-16-h1970nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-17-cr0295nd-notebook-i7-1255u-4k-core-i7-1255u-16gb-1000gb-ssd-geforce-rtx-2050-wi-fi-6e-windows-11-home-zilver.md": {
	id: "hp-envy-17-cr0295nd-notebook-i7-1255u-4k-core-i7-1255u-16gb-1000gb-ssd-geforce-rtx-2050-wi-fi-6e-windows-11-home-zilver.md";
  slug: "hp-envy-17-cr0295nd-notebook-i7-1255u-4k-core-i7-1255u-16gb-1000gb-ssd-geforce-rtx-2050-wi-fi-6e-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-17-cr0770nd-laptop-17-3-inch.md": {
	id: "hp-envy-17-cr0770nd-laptop-17-3-inch.md";
  slug: "hp-envy-17-cr0770nd-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-17-cw0030nd-17-fhd-i7-13700h-16gb-1tb-w11.md": {
	id: "hp-envy-17-cw0030nd-17-fhd-i7-13700h-16gb-1tb-w11.md";
  slug: "hp-envy-17-cw0030nd-17-fhd-i7-13700h-16gb-1tb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-17-cw0075nd-17-fhd-i7-16gb-1tb-3050-w11.md": {
	id: "hp-envy-17-cw0075nd-17-fhd-i7-16gb-1tb-3050-w11.md";
  slug: "hp-envy-17-cw0075nd-17-fhd-i7-16gb-1tb-3050-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-17-cw0075nd-173-inch-intel-core-i7-16-gb-1-tb-1758380.md": {
	id: "hp-envy-17-cw0075nd-173-inch-intel-core-i7-16-gb-1-tb-1758380.md";
  slug: "hp-envy-17-cw0075nd-173-inch-intel-core-i7-16-gb-1-tb-1758380";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-17-cw0095nd-173-inch-intel-core-i7-16-gb-1-tb-1761697.md": {
	id: "hp-envy-17-cw0095nd-173-inch-intel-core-i7-16-gb-1-tb-1761697.md";
  slug: "hp-envy-17-cw0095nd-173-inch-intel-core-i7-16-gb-1-tb-1761697";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-17-cw0375nd-laptop-17-3-full-hd-intel-core-i7-1355u-nvidia-geforce-rtx-3050-16-gb-ddr4-1-tb-ssd-windows-11-tsb-us-international-qwerty.md": {
	id: "hp-envy-17-cw0375nd-laptop-17-3-full-hd-intel-core-i7-1355u-nvidia-geforce-rtx-3050-16-gb-ddr4-1-tb-ssd-windows-11-tsb-us-international-qwerty.md";
  slug: "hp-envy-17-cw0375nd-laptop-17-3-full-hd-intel-core-i7-1355u-nvidia-geforce-rtx-3050-16-gb-ddr4-1-tb-ssd-windows-11-tsb-us-international-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-17-cw0750nd-laptop-17-3-inch.md": {
	id: "hp-envy-17-cw0750nd-laptop-17-3-inch.md";
  slug: "hp-envy-17-cw0750nd-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-17-cw0770nd-laptop-17-3-inch.md": {
	id: "hp-envy-17-cw0770nd-laptop-17-3-inch.md";
  slug: "hp-envy-17-cw0770nd-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-17-cw0775nd-creator-laptop-17-3-inch.md": {
	id: "hp-envy-17-cw0775nd-creator-laptop-17-3-inch.md";
  slug: "hp-envy-17-cw0775nd-creator-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-17-cw0777nd-creator-laptop-17-3-inch.md": {
	id: "hp-envy-17-cw0777nd-creator-laptop-17-3-inch.md";
  slug: "hp-envy-17-cw0777nd-creator-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-17-cw0995nd.md": {
	id: "hp-envy-17-cw0995nd.md";
  slug: "hp-envy-17-cw0995nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-laptop-16-h1035nd-windows-11-home-16-touchscreen-intel-core-i7-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4060-2-8k-natuurlijk-zilver.md": {
	id: "hp-envy-laptop-16-h1035nd-windows-11-home-16-touchscreen-intel-core-i7-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4060-2-8k-natuurlijk-zilver.md";
  slug: "hp-envy-laptop-16-h1035nd-windows-11-home-16-touchscreen-intel-core-i7-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4060-2-8k-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-laptop-16-h1090nd-windows-11-home-16-touchscreen-intel-core-i9-32gb-ram-2tb-ssd-nvidia-geforce-rtx-4060-2-8k-natuurlijk-zilver.md": {
	id: "hp-envy-laptop-16-h1090nd-windows-11-home-16-touchscreen-intel-core-i9-32gb-ram-2tb-ssd-nvidia-geforce-rtx-4060-2-8k-natuurlijk-zilver.md";
  slug: "hp-envy-laptop-16-h1090nd-windows-11-home-16-touchscreen-intel-core-i9-32gb-ram-2tb-ssd-nvidia-geforce-rtx-4060-2-8k-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-laptop-17-cr0230nd-17-3-windows-11-home-intel-core-i7-16gb-ram-1tb-ssd-fhd-natuurlijk-zilver.md": {
	id: "hp-envy-laptop-17-cr0230nd-17-3-windows-11-home-intel-core-i7-16gb-ram-1tb-ssd-fhd-natuurlijk-zilver.md";
  slug: "hp-envy-laptop-17-cr0230nd-17-3-windows-11-home-intel-core-i7-16gb-ram-1tb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-oled-16-h1975nd.md": {
	id: "hp-envy-oled-16-h1975nd.md";
  slug: "hp-envy-oled-16-h1975nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-13-bf0255nd-i5-1230u-hybride-33-8-cm-touchscreen-wuxga-intel-core-i5-16-gb-lpddr4x-sdram-512-gb-ssd-wi-fi-6e-windows-11-home-blauw.md": {
	id: "hp-envy-x360-13-bf0255nd-i5-1230u-hybride-33-8-cm-touchscreen-wuxga-intel-core-i5-16-gb-lpddr4x-sdram-512-gb-ssd-wi-fi-6e-windows-11-home-blauw.md";
  slug: "hp-envy-x360-13-bf0255nd-i5-1230u-hybride-33-8-cm-touchscreen-wuxga-intel-core-i5-16-gb-lpddr4x-sdram-512-gb-ssd-wi-fi-6e-windows-11-home-blauw";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-13-bf0350nd-i7-1250u-hybride-33-8-cm-touchscreen-2-8k-intel-core-i7-16-gb-lpddr4x-sdram-1000-gb-ssd-wi-fi-6e-windows-11-home-zilver.md": {
	id: "hp-envy-x360-13-bf0350nd-i7-1250u-hybride-33-8-cm-touchscreen-2-8k-intel-core-i7-16-gb-lpddr4x-sdram-1000-gb-ssd-wi-fi-6e-windows-11-home-zilver.md";
  slug: "hp-envy-x360-13-bf0350nd-i7-1250u-hybride-33-8-cm-touchscreen-2-8k-intel-core-i7-16-gb-lpddr4x-sdram-1000-gb-ssd-wi-fi-6e-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-13-bf0356nd-laptop-i5-1230u-iris-xe-graphics-16-gb-512-gb-ssd-touch.md": {
	id: "hp-envy-x360-13-bf0356nd-laptop-i5-1230u-iris-xe-graphics-16-gb-512-gb-ssd-touch.md";
  slug: "hp-envy-x360-13-bf0356nd-laptop-i5-1230u-iris-xe-graphics-16-gb-512-gb-ssd-touch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-13-bf0365nd-laptop-13-3-2-8k-oled-touchscreen-intel-core-i7-1250u-iris-xe-graphics-16-gb-ddr4-1-tb-ssd-windows-11-tsb-us-international-qwerty.md": {
	id: "hp-envy-x360-13-bf0365nd-laptop-13-3-2-8k-oled-touchscreen-intel-core-i7-1250u-iris-xe-graphics-16-gb-ddr4-1-tb-ssd-windows-11-tsb-us-international-qwerty.md";
  slug: "hp-envy-x360-13-bf0365nd-laptop-13-3-2-8k-oled-touchscreen-intel-core-i7-1250u-iris-xe-graphics-16-gb-ddr4-1-tb-ssd-windows-11-tsb-us-international-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-13-bf0365nd-laptop-i7-1250u-iris-xe-graphics-16-gb-1-tb-ssd-touch.md": {
	id: "hp-envy-x360-13-bf0365nd-laptop-i7-1250u-iris-xe-graphics-16-gb-1-tb-ssd-touch.md";
  slug: "hp-envy-x360-13-bf0365nd-laptop-i7-1250u-iris-xe-graphics-16-gb-1-tb-ssd-touch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-13-bf0770nd-laptop-13-3-inch.md": {
	id: "hp-envy-x360-13-bf0770nd-laptop-13-3-inch.md";
  slug: "hp-envy-x360-13-bf0770nd-laptop-13-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-13-bf0955nd-i5-1230u-hybride-33-8-cm-touchscreen-2-8k-intel-core-i5-16-gb-lpddr4x-sdram-512-gb-ssd-wi-fi-6e-windows-11-home-zilver.md": {
	id: "hp-envy-x360-13-bf0955nd-i5-1230u-hybride-33-8-cm-touchscreen-2-8k-intel-core-i5-16-gb-lpddr4x-sdram-512-gb-ssd-wi-fi-6e-windows-11-home-zilver.md";
  slug: "hp-envy-x360-13-bf0955nd-i5-1230u-hybride-33-8-cm-touchscreen-2-8k-intel-core-i5-16-gb-lpddr4x-sdram-512-gb-ssd-wi-fi-6e-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-13-bf0974nd.md": {
	id: "hp-envy-x360-13-bf0974nd.md";
  slug: "hp-envy-x360-13-bf0974nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-15-ew0175nd-i7-1255u-hybride-39-6-cm-touchscreen-quad-hd-intel-core-i7-16-gb-ddr4-sdram-1000-gb-ssd-nvidia-geforce-rtx-2050-wi-fi-6e-windows-11-home-zilver.md": {
	id: "hp-envy-x360-15-ew0175nd-i7-1255u-hybride-39-6-cm-touchscreen-quad-hd-intel-core-i7-16-gb-ddr4-sdram-1000-gb-ssd-nvidia-geforce-rtx-2050-wi-fi-6e-windows-11-home-zilver.md";
  slug: "hp-envy-x360-15-ew0175nd-i7-1255u-hybride-39-6-cm-touchscreen-quad-hd-intel-core-i7-16-gb-ddr4-sdram-1000-gb-ssd-nvidia-geforce-rtx-2050-wi-fi-6e-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-15-ew0650nd-i7-1255u-hybride-39-6-cm-touchscreen-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-rtx-2050-wi-fi-6e-windows-11-home-zilver.md": {
	id: "hp-envy-x360-15-ew0650nd-i7-1255u-hybride-39-6-cm-touchscreen-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-rtx-2050-wi-fi-6e-windows-11-home-zilver.md";
  slug: "hp-envy-x360-15-ew0650nd-i7-1255u-hybride-39-6-cm-touchscreen-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-rtx-2050-wi-fi-6e-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-15-ew0977nd-i7-1255u-hybride-39-6-cm-touchscreen-quad-hd-intel-core-i7-16-gb-ddr4-sdram-1000-gb-ssd-nvidia-geforce-rtx-2050-wi-fi-6e-windows-11-home-zilver.md": {
	id: "hp-envy-x360-15-ew0977nd-i7-1255u-hybride-39-6-cm-touchscreen-quad-hd-intel-core-i7-16-gb-ddr4-sdram-1000-gb-ssd-nvidia-geforce-rtx-2050-wi-fi-6e-windows-11-home-zilver.md";
  slug: "hp-envy-x360-15-ew0977nd-i7-1255u-hybride-39-6-cm-touchscreen-quad-hd-intel-core-i7-16-gb-ddr4-sdram-1000-gb-ssd-nvidia-geforce-rtx-2050-wi-fi-6e-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-15-fe0020nd-15-oled-touch-i5-1335u-16gb-512gb-w11.md": {
	id: "hp-envy-x360-15-fe0020nd-15-oled-touch-i5-1335u-16gb-512gb-w11.md";
  slug: "hp-envy-x360-15-fe0020nd-15-oled-touch-i5-1335u-16gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-15-fe0020nd-156-inch-intel-core-i5-16-gb-512-gb-1761675.md": {
	id: "hp-envy-x360-15-fe0020nd-156-inch-intel-core-i5-16-gb-512-gb-1761675.md";
  slug: "hp-envy-x360-15-fe0020nd-156-inch-intel-core-i5-16-gb-512-gb-1761675";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-15-fe0040nd-15-fhd-i7-1355u-16gb-1tb-w11.md": {
	id: "hp-envy-x360-15-fe0040nd-15-fhd-i7-1355u-16gb-1tb-w11.md";
  slug: "hp-envy-x360-15-fe0040nd-15-fhd-i7-1355u-16gb-1tb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-15-fe0060nd-15-oled-touch-i7-1355u-16gb-1tb-3050-w11.md": {
	id: "hp-envy-x360-15-fe0060nd-15-oled-touch-i7-1355u-16gb-1tb-3050-w11.md";
  slug: "hp-envy-x360-15-fe0060nd-15-oled-touch-i7-1355u-16gb-1tb-3050-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-15-fe0340nd-laptop-i7-1355u-iris-xe-graphics-16-gb-1-tb-ssd-touch.md": {
	id: "hp-envy-x360-15-fe0340nd-laptop-i7-1355u-iris-xe-graphics-16-gb-1-tb-ssd-touch.md";
  slug: "hp-envy-x360-15-fe0340nd-laptop-i7-1355u-iris-xe-graphics-16-gb-1-tb-ssd-touch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-15-fe0520nd.md": {
	id: "hp-envy-x360-15-fe0520nd.md";
  slug: "hp-envy-x360-15-fe0520nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-15-fe0751nd-2-in-1-laptop-15-6-inch.md": {
	id: "hp-envy-x360-15-fe0751nd-2-in-1-laptop-15-6-inch.md";
  slug: "hp-envy-x360-15-fe0751nd-2-in-1-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-15-fe0770nd-2-in-1-laptop-15-6-inch.md": {
	id: "hp-envy-x360-15-fe0770nd-2-in-1-laptop-15-6-inch.md";
  slug: "hp-envy-x360-15-fe0770nd-2-in-1-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-15-fe0775nd-2-in-1-creator-laptop-15-6-inch.md": {
	id: "hp-envy-x360-15-fe0775nd-2-in-1-creator-laptop-15-6-inch.md";
  slug: "hp-envy-x360-15-fe0775nd-2-in-1-creator-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-15-fe0953nd.md": {
	id: "hp-envy-x360-15-fe0953nd.md";
  slug: "hp-envy-x360-15-fe0953nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-15-fe0971nd.md": {
	id: "hp-envy-x360-15-fe0971nd.md";
  slug: "hp-envy-x360-15-fe0971nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-15-fe0972nd.md": {
	id: "hp-envy-x360-15-fe0972nd.md";
  slug: "hp-envy-x360-15-fe0972nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-15-fh0070nd-15-fhd-oled-r5-7530u-16gb-512gb-w11.md": {
	id: "hp-envy-x360-15-fh0070nd-15-fhd-oled-r5-7530u-16gb-512gb-w11.md";
  slug: "hp-envy-x360-15-fh0070nd-15-fhd-oled-r5-7530u-16gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-15-fh0070nd-156-inch-amd-ryzen-5-16-gb-512-gb-1758379.md": {
	id: "hp-envy-x360-15-fh0070nd-156-inch-amd-ryzen-5-16-gb-512-gb-1758379.md";
  slug: "hp-envy-x360-15-fh0070nd-156-inch-amd-ryzen-5-16-gb-512-gb-1758379";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-15-fh0750nd-2-in-1-laptop-15-6-inch.md": {
	id: "hp-envy-x360-15-fh0750nd-2-in-1-laptop-15-6-inch.md";
  slug: "hp-envy-x360-15-fh0750nd-2-in-1-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-2-in-1-15-6-touchscreen-oled-fhd-i7-1355u-16gb-ddr5-1tb-m-2-ssd-toetsenbord-verlichting-w11-home.md": {
	id: "hp-envy-x360-2-in-1-15-6-touchscreen-oled-fhd-i7-1355u-16gb-ddr5-1tb-m-2-ssd-toetsenbord-verlichting-w11-home.md";
  slug: "hp-envy-x360-2-in-1-15-6-touchscreen-oled-fhd-i7-1355u-16gb-ddr5-1tb-m-2-ssd-toetsenbord-verlichting-w11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-oled-13-bf0971nd.md": {
	id: "hp-envy-x360-oled-13-bf0971nd.md";
  slug: "hp-envy-x360-oled-13-bf0971nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-envy-x360-oled-15-fh0973nd.md": {
	id: "hp-envy-x360-oled-15-fh0973nd.md";
  slug: "hp-envy-x360-oled-15-fh0973nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-14s-dq5959nd.md": {
	id: "hp-laptop-14s-dq5959nd.md";
  slug: "hp-laptop-14s-dq5959nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-14s-fq1952nd.md": {
	id: "hp-laptop-14s-fq1952nd.md";
  slug: "hp-laptop-14s-fq1952nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-14s-fq1955nd.md": {
	id: "hp-laptop-14s-fq1955nd.md";
  slug: "hp-laptop-14s-fq1955nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-14s-fq1972nd.md": {
	id: "hp-laptop-14s-fq1972nd.md";
  slug: "hp-laptop-14s-fq1972nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-14s-fq2325nd-14-windows-11-home-amd-ryzen-7-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md": {
	id: "hp-laptop-14s-fq2325nd-14-windows-11-home-amd-ryzen-7-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md";
  slug: "hp-laptop-14s-fq2325nd-14-windows-11-home-amd-ryzen-7-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-15-eh1432nd.md": {
	id: "hp-laptop-15-eh1432nd.md";
  slug: "hp-laptop-15-eh1432nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-15-fc0375nd-laptop-15-6-full-hd-amd-ryzen-7-7730u-radeon-graphics-16-gb-ddr4-1-tb-ssd-windows-11-tsb-us-international-qwerty.md": {
	id: "hp-laptop-15-fc0375nd-laptop-15-6-full-hd-amd-ryzen-7-7730u-radeon-graphics-16-gb-ddr4-1-tb-ssd-windows-11-tsb-us-international-qwerty.md";
  slug: "hp-laptop-15-fc0375nd-laptop-15-6-full-hd-amd-ryzen-7-7730u-radeon-graphics-16-gb-ddr4-1-tb-ssd-windows-11-tsb-us-international-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-15s-eq2952nd.md": {
	id: "hp-laptop-15s-eq2952nd.md";
  slug: "hp-laptop-15s-eq2952nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-15s-eq2956nd.md": {
	id: "hp-laptop-15s-eq2956nd.md";
  slug: "hp-laptop-15s-eq2956nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-15s-eq2971nd.md": {
	id: "hp-laptop-15s-eq2971nd.md";
  slug: "hp-laptop-15s-eq2971nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-15s-fq4955nd.md": {
	id: "hp-laptop-15s-fq4955nd.md";
  slug: "hp-laptop-15s-fq4955nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-15s-fq4959nd.md": {
	id: "hp-laptop-15s-fq4959nd.md";
  slug: "hp-laptop-15s-fq4959nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-15s-fq4975nd.md": {
	id: "hp-laptop-15s-fq4975nd.md";
  slug: "hp-laptop-15s-fq4975nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-15s-fq5040nd.md": {
	id: "hp-laptop-15s-fq5040nd.md";
  slug: "hp-laptop-15s-fq5040nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-15s-fq5045nd.md": {
	id: "hp-laptop-15s-fq5045nd.md";
  slug: "hp-laptop-15s-fq5045nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-17-cn1050nd-windows-11-home-17-3-intel-core-i5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md": {
	id: "hp-laptop-17-cn1050nd-windows-11-home-17-3-intel-core-i5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md";
  slug: "hp-laptop-17-cn1050nd-windows-11-home-17-3-intel-core-i5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-17-cn2055nd.md": {
	id: "hp-laptop-17-cn2055nd.md";
  slug: "hp-laptop-17-cn2055nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-17-cn2090nd.md": {
	id: "hp-laptop-17-cn2090nd.md";
  slug: "hp-laptop-17-cn2090nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-17-cn2255nd.md": {
	id: "hp-laptop-17-cn2255nd.md";
  slug: "hp-laptop-17-cn2255nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-17-cp2051nd-windows-11-home-17-3-amd-ryzen-5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md": {
	id: "hp-laptop-17-cp2051nd-windows-11-home-17-3-amd-ryzen-5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md";
  slug: "hp-laptop-17-cp2051nd-windows-11-home-17-3-amd-ryzen-5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-17-cp2955nd.md": {
	id: "hp-laptop-17-cp2955nd.md";
  slug: "hp-laptop-17-cp2955nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-laptop-17-cp3975nd.md": {
	id: "hp-laptop-17-cp3975nd.md";
  slug: "hp-laptop-17-cp3975nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-nb-13-be2075nd-13-qhd-r7-7535u-16gb-512gb-w11.md": {
	id: "hp-nb-13-be2075nd-13-qhd-r7-7535u-16gb-512gb-w11.md";
  slug: "hp-nb-13-be2075nd-13-qhd-r7-7535u-16gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-notebook-14-ek0090nd-14-fhd-touch-i7-1255u-16gb-512gb-w11.md": {
	id: "hp-notebook-14-ek0090nd-14-fhd-touch-i7-1255u-16gb-512gb-w11.md";
  slug: "hp-notebook-14-ek0090nd-14-fhd-touch-i7-1255u-16gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-notebook-16-h1025nd-16-qhd-touch-i7-13700h-16gb-1tb-a370m-w11.md": {
	id: "hp-notebook-16-h1025nd-16-qhd-touch-i7-13700h-16gb-1tb-a370m-w11.md";
  slug: "hp-notebook-16-h1025nd-16-qhd-touch-i7-13700h-16gb-1tb-a370m-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-notebook-17-cp3075nd-17-fhd-r7-7730u-16gb-1tb-w11.md": {
	id: "hp-notebook-17-cp3075nd-17-fhd-r7-7730u-16gb-1tb-w11.md";
  slug: "hp-notebook-17-cp3075nd-17-fhd-r7-7730u-16gb-1tb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-omen-16-u0380nd-qwerty.md": {
	id: "hp-omen-16-u0380nd-qwerty.md";
  slug: "hp-omen-16-u0380nd-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-omen-16-wd0973nd.md": {
	id: "hp-omen-16-wd0973nd.md";
  slug: "hp-omen-16-wd0973nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-omen-16-wd0975nd.md": {
	id: "hp-omen-16-wd0975nd.md";
  slug: "hp-omen-16-wd0975nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-omen-16-wf0095nd-2.md": {
	id: "hp-omen-16-wf0095nd-2.md";
  slug: "hp-omen-16-wf0095nd-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-omen-16-wf0095nd.md": {
	id: "hp-omen-16-wf0095nd.md";
  slug: "hp-omen-16-wf0095nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-omen-16-wf0970nd.md": {
	id: "hp-omen-16-wf0970nd.md";
  slug: "hp-omen-16-wf0970nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-omen-16-wf0975nd.md": {
	id: "hp-omen-16-wf0975nd.md";
  slug: "hp-omen-16-wf0975nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-omen-16-wf0977nd.md": {
	id: "hp-omen-16-wf0977nd.md";
  slug: "hp-omen-16-wf0977nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-omen-16-xf0977nd.md": {
	id: "hp-omen-16-xf0977nd.md";
  slug: "hp-omen-16-xf0977nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-omen-17-ck2980nd.md": {
	id: "hp-omen-17-ck2980nd.md";
  slug: "hp-omen-17-ck2980nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-omen-17-ck2990nd.md": {
	id: "hp-omen-17-ck2990nd.md";
  slug: "hp-omen-17-ck2990nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-omen-17-cm2960nd.md": {
	id: "hp-omen-17-cm2960nd.md";
  slug: "hp-omen-17-cm2960nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-omen-17-cm2970nd.md": {
	id: "hp-omen-17-cm2970nd.md";
  slug: "hp-omen-17-cm2970nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-omen-transcend-16-u0970nd.md": {
	id: "hp-omen-transcend-16-u0970nd.md";
  slug: "hp-omen-transcend-16-u0970nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-omen-transcend-16-u0971nd.md": {
	id: "hp-omen-transcend-16-u0971nd.md";
  slug: "hp-omen-transcend-16-u0971nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-omen-transcend-16-u0977nd.md": {
	id: "hp-omen-transcend-16-u0977nd.md";
  slug: "hp-omen-transcend-16-u0977nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-omen-transcend-16-u0979nd.md": {
	id: "hp-omen-transcend-16-u0979nd.md";
  slug: "hp-omen-transcend-16-u0979nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-dv1900nd.md": {
	id: "hp-pavilion-14-dv1900nd.md";
  slug: "hp-pavilion-14-dv1900nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-dv1905nd.md": {
	id: "hp-pavilion-14-dv1905nd.md";
  slug: "hp-pavilion-14-dv1905nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-dv2046nd-14-fhd-i5-1235u-16gb-512gb-w11.md": {
	id: "hp-pavilion-14-dv2046nd-14-fhd-i5-1235u-16gb-512gb-w11.md";
  slug: "hp-pavilion-14-dv2046nd-14-fhd-i5-1235u-16gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-dv2346nd-833k9ea-laptop-i5-1235u-intel-iris-xe-16-gb-512-gb-ssd.md": {
	id: "hp-pavilion-14-dv2346nd-833k9ea-laptop-i5-1235u-intel-iris-xe-16-gb-512-gb-ssd.md";
  slug: "hp-pavilion-14-dv2346nd-833k9ea-laptop-i5-1235u-intel-iris-xe-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-dv2347nd-833l0ea-laptop-i5-1235u-intel-iris-xe-8-gb-512-gb-ssd.md": {
	id: "hp-pavilion-14-dv2347nd-833l0ea-laptop-i5-1235u-intel-iris-xe-8-gb-512-gb-ssd.md";
  slug: "hp-pavilion-14-dv2347nd-833l0ea-laptop-i5-1235u-intel-iris-xe-8-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-dv2750nd-laptop-14-inch.md": {
	id: "hp-pavilion-14-dv2750nd-laptop-14-inch.md";
  slug: "hp-pavilion-14-dv2750nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-dv2755nd-laptop-14-inch.md": {
	id: "hp-pavilion-14-dv2755nd-laptop-14-inch.md";
  slug: "hp-pavilion-14-dv2755nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-dv2771nd-laptop-14-inch.md": {
	id: "hp-pavilion-14-dv2771nd-laptop-14-inch.md";
  slug: "hp-pavilion-14-dv2771nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-dv2950nd.md": {
	id: "hp-pavilion-14-dv2950nd.md";
  slug: "hp-pavilion-14-dv2950nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-dv2955nd.md": {
	id: "hp-pavilion-14-dv2955nd.md";
  slug: "hp-pavilion-14-dv2955nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-ec0555nd-laptop-14-inch.md": {
	id: "hp-pavilion-14-ec0555nd-laptop-14-inch.md";
  slug: "hp-pavilion-14-ec0555nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-ec1002nd-14-inch-amd-ryzen-7-16-gb-512-gb-1769503.md": {
	id: "hp-pavilion-14-ec1002nd-14-inch-amd-ryzen-7-16-gb-512-gb-1769503.md";
  slug: "hp-pavilion-14-ec1002nd-14-inch-amd-ryzen-7-16-gb-512-gb-1769503";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-ec1004nd-14-inch-amd-ryzen-5-16-gb-512-gb-1769504.md": {
	id: "hp-pavilion-14-ec1004nd-14-inch-amd-ryzen-5-16-gb-512-gb-1769504.md";
  slug: "hp-pavilion-14-ec1004nd-14-inch-amd-ryzen-5-16-gb-512-gb-1769504";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-ec1055nd.md": {
	id: "hp-pavilion-14-ec1055nd.md";
  slug: "hp-pavilion-14-ec1055nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-ec1350nd-5625u-notebook-35-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md": {
	id: "hp-pavilion-14-ec1350nd-5625u-notebook-35-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md";
  slug: "hp-pavilion-14-ec1350nd-5625u-notebook-35-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-ec1356nd-833w6ea-laptop-ryzen-5-5625u-radeon-graphics-16-gb-512-gb-ssd.md": {
	id: "hp-pavilion-14-ec1356nd-833w6ea-laptop-ryzen-5-5625u-radeon-graphics-16-gb-512-gb-ssd.md";
  slug: "hp-pavilion-14-ec1356nd-833w6ea-laptop-ryzen-5-5625u-radeon-graphics-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-ec1420nd-1739336.md": {
	id: "hp-pavilion-14-ec1420nd-1739336.md";
  slug: "hp-pavilion-14-ec1420nd-1739336";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-ec1420nd-5825u-notebook-35-6-cm-full-hd-amd-ryzen-7-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md": {
	id: "hp-pavilion-14-ec1420nd-5825u-notebook-35-6-cm-full-hd-amd-ryzen-7-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md";
  slug: "hp-pavilion-14-ec1420nd-5825u-notebook-35-6-cm-full-hd-amd-ryzen-7-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-ec1425nd-14-full-hd-amd-ryzen-7-8-gb-ddr4-512-gb-ssd-wi-fi-5-802-11ac-w11-home-blauw.md": {
	id: "hp-pavilion-14-ec1425nd-14-full-hd-amd-ryzen-7-8-gb-ddr4-512-gb-ssd-wi-fi-5-802-11ac-w11-home-blauw.md";
  slug: "hp-pavilion-14-ec1425nd-14-full-hd-amd-ryzen-7-8-gb-ddr4-512-gb-ssd-wi-fi-5-802-11ac-w11-home-blauw";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-ec1480nd-5825u-notebook-35-6-cm-full-hd-amd-ryzen-7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-zilver.md": {
	id: "hp-pavilion-14-ec1480nd-5825u-notebook-35-6-cm-full-hd-amd-ryzen-7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-zilver.md";
  slug: "hp-pavilion-14-ec1480nd-5825u-notebook-35-6-cm-full-hd-amd-ryzen-7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-ec1635nd-5625u-notebook-35-6-cm-full-hd-amd-ryzen-5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zwart.md": {
	id: "hp-pavilion-14-ec1635nd-5625u-notebook-35-6-cm-full-hd-amd-ryzen-5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zwart.md";
  slug: "hp-pavilion-14-ec1635nd-5625u-notebook-35-6-cm-full-hd-amd-ryzen-5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-ec1751nd-laptop-14-inch.md": {
	id: "hp-pavilion-14-ec1751nd-laptop-14-inch.md";
  slug: "hp-pavilion-14-ec1751nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-ec1755nd-laptop-14-inch.md": {
	id: "hp-pavilion-14-ec1755nd-laptop-14-inch.md";
  slug: "hp-pavilion-14-ec1755nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-ec1770nd-laptop-14-inch.md": {
	id: "hp-pavilion-14-ec1770nd-laptop-14-inch.md";
  slug: "hp-pavilion-14-ec1770nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-ec1775nd-laptop-14-inch.md": {
	id: "hp-pavilion-14-ec1775nd-laptop-14-inch.md";
  slug: "hp-pavilion-14-ec1775nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-ec1870nd-1746674.md": {
	id: "hp-pavilion-14-ec1870nd-1746674.md";
  slug: "hp-pavilion-14-ec1870nd-1746674";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-eh1591nd-intel-core-i7-16-gb-512-gb-1758386.md": {
	id: "hp-pavilion-14-eh1591nd-intel-core-i7-16-gb-512-gb-1758386.md";
  slug: "hp-pavilion-14-eh1591nd-intel-core-i7-16-gb-512-gb-1758386";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-14-eh1592nd.md": {
	id: "hp-pavilion-14-eh1592nd.md";
  slug: "hp-pavilion-14-eh1592nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15''-laptop.md": {
	id: "hp-pavilion-15''-laptop.md";
  slug: "hp-pavilion-15-laptop";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg1325nd-laptop-15-6-inch.md": {
	id: "hp-pavilion-15-eg1325nd-laptop-15-6-inch.md";
  slug: "hp-pavilion-15-eg1325nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg1970nd.md": {
	id: "hp-pavilion-15-eg1970nd.md";
  slug: "hp-pavilion-15-eg1970nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2080nd-15-fhd-i7-1255u-16gb-512gb-w11.md": {
	id: "hp-pavilion-15-eg2080nd-15-fhd-i7-1255u-16gb-512gb-w11.md";
  slug: "hp-pavilion-15-eg2080nd-15-fhd-i7-1255u-16gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2350nd-1739445.md": {
	id: "hp-pavilion-15-eg2350nd-1739445.md";
  slug: "hp-pavilion-15-eg2350nd-1739445";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2350nd-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-zilver.md": {
	id: "hp-pavilion-15-eg2350nd-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-zilver.md";
  slug: "hp-pavilion-15-eg2350nd-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2355nd-1739446.md": {
	id: "hp-pavilion-15-eg2355nd-1739446.md";
  slug: "hp-pavilion-15-eg2355nd-1739446";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2355nd-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-blauw.md": {
	id: "hp-pavilion-15-eg2355nd-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-blauw.md";
  slug: "hp-pavilion-15-eg2355nd-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-blauw";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2365nd-laptop-15-6-full-hd-intel-core-i5-1235u-iris-xe-graphics-16-gb-ddr4-512-gb-ssd-windows-11-tsb-us-international-qwerty.md": {
	id: "hp-pavilion-15-eg2365nd-laptop-15-6-full-hd-intel-core-i5-1235u-iris-xe-graphics-16-gb-ddr4-512-gb-ssd-windows-11-tsb-us-international-qwerty.md";
  slug: "hp-pavilion-15-eg2365nd-laptop-15-6-full-hd-intel-core-i5-1235u-iris-xe-graphics-16-gb-ddr4-512-gb-ssd-windows-11-tsb-us-international-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2370nd-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-zilver.md": {
	id: "hp-pavilion-15-eg2370nd-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-zilver.md";
  slug: "hp-pavilion-15-eg2370nd-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2375nd-1739448.md": {
	id: "hp-pavilion-15-eg2375nd-1739448.md";
  slug: "hp-pavilion-15-eg2375nd-1739448";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2375nd-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-blauw.md": {
	id: "hp-pavilion-15-eg2375nd-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-blauw.md";
  slug: "hp-pavilion-15-eg2375nd-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-blauw";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2380nd-laptop-15-6-full-hd-intel-core-i7-1255u-iris-xe-graphics-16-gb-ddr4-512-gb-ssd-windows-11-tsb-us-international-qwerty.md": {
	id: "hp-pavilion-15-eg2380nd-laptop-15-6-full-hd-intel-core-i7-1255u-iris-xe-graphics-16-gb-ddr4-512-gb-ssd-windows-11-tsb-us-international-qwerty.md";
  slug: "hp-pavilion-15-eg2380nd-laptop-15-6-full-hd-intel-core-i7-1255u-iris-xe-graphics-16-gb-ddr4-512-gb-ssd-windows-11-tsb-us-international-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2380nd-laptop-i7-1255u-iris-xe-graphics-16-gb-512-gb-ssd.md": {
	id: "hp-pavilion-15-eg2380nd-laptop-i7-1255u-iris-xe-graphics-16-gb-512-gb-ssd.md";
  slug: "hp-pavilion-15-eg2380nd-laptop-i7-1255u-iris-xe-graphics-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2390nd-laptop-15-6-full-hd-intel-core-i7-1255u-nvidia-geforce-mx550-16-gb-ddr4-1-tb-ssd-windows-11-tsb-us-international-qwerty.md": {
	id: "hp-pavilion-15-eg2390nd-laptop-15-6-full-hd-intel-core-i7-1255u-nvidia-geforce-mx550-16-gb-ddr4-1-tb-ssd-windows-11-tsb-us-international-qwerty.md";
  slug: "hp-pavilion-15-eg2390nd-laptop-15-6-full-hd-intel-core-i7-1255u-nvidia-geforce-mx550-16-gb-ddr4-1-tb-ssd-windows-11-tsb-us-international-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2655nd-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-mx550-wi-fi-6-windows-11-home-in-s-mode-zilver.md": {
	id: "hp-pavilion-15-eg2655nd-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-mx550-wi-fi-6-windows-11-home-in-s-mode-zilver.md";
  slug: "hp-pavilion-15-eg2655nd-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-mx550-wi-fi-6-windows-11-home-in-s-mode-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2751nd-laptop-15-6-inch.md": {
	id: "hp-pavilion-15-eg2751nd-laptop-15-6-inch.md";
  slug: "hp-pavilion-15-eg2751nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2752nd-laptop-15-6-inch.md": {
	id: "hp-pavilion-15-eg2752nd-laptop-15-6-inch.md";
  slug: "hp-pavilion-15-eg2752nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2757nd-laptop-15-6-inch.md": {
	id: "hp-pavilion-15-eg2757nd-laptop-15-6-inch.md";
  slug: "hp-pavilion-15-eg2757nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2770nd-laptop-15-6-inch.md": {
	id: "hp-pavilion-15-eg2770nd-laptop-15-6-inch.md";
  slug: "hp-pavilion-15-eg2770nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2772nd-laptop-15-6-inch.md": {
	id: "hp-pavilion-15-eg2772nd-laptop-15-6-inch.md";
  slug: "hp-pavilion-15-eg2772nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2852nd-156-inch-intel-core-i7-16-gb-1-tb-1758392.md": {
	id: "hp-pavilion-15-eg2852nd-156-inch-intel-core-i7-16-gb-1-tb-1758392.md";
  slug: "hp-pavilion-15-eg2852nd-156-inch-intel-core-i7-16-gb-1-tb-1758392";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2951nd-microsoft-office-365.md": {
	id: "hp-pavilion-15-eg2951nd-microsoft-office-365.md";
  slug: "hp-pavilion-15-eg2951nd-microsoft-office-365";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2959nd.md": {
	id: "hp-pavilion-15-eg2959nd.md";
  slug: "hp-pavilion-15-eg2959nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2972nd.md": {
	id: "hp-pavilion-15-eg2972nd.md";
  slug: "hp-pavilion-15-eg2972nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg2980nd.md": {
	id: "hp-pavilion-15-eg2980nd.md";
  slug: "hp-pavilion-15-eg2980nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg3070nd-156-inch-intel-core-i5-16-gb-512-gb-1772206.md": {
	id: "hp-pavilion-15-eg3070nd-156-inch-intel-core-i5-16-gb-512-gb-1772206.md";
  slug: "hp-pavilion-15-eg3070nd-156-inch-intel-core-i5-16-gb-512-gb-1772206";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg3070nd-8y7m5ea-laptop-core-i5-1335u-iris-xe-graphics-16-gb-512-gb-ssd.md": {
	id: "hp-pavilion-15-eg3070nd-8y7m5ea-laptop-core-i5-1335u-iris-xe-graphics-16-gb-512-gb-ssd.md";
  slug: "hp-pavilion-15-eg3070nd-8y7m5ea-laptop-core-i5-1335u-iris-xe-graphics-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eg3080nd-156-inch-intel-core-i7-16-gb-1-tb-1772207.md": {
	id: "hp-pavilion-15-eg3080nd-156-inch-intel-core-i7-16-gb-1-tb-1772207.md";
  slug: "hp-pavilion-15-eg3080nd-156-inch-intel-core-i7-16-gb-1-tb-1772207";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh1042nb.md": {
	id: "hp-pavilion-15-eh1042nb.md";
  slug: "hp-pavilion-15-eh1042nb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh1115nw-srebrny.md": {
	id: "hp-pavilion-15-eh1115nw-srebrny.md";
  slug: "hp-pavilion-15-eh1115nw-srebrny";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh1440nd-laptop-15-6-inch.md": {
	id: "hp-pavilion-15-eh1440nd-laptop-15-6-inch.md";
  slug: "hp-pavilion-15-eh1440nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh2450nd-5625u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-home-zilver.md": {
	id: "hp-pavilion-15-eh2450nd-5625u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-home-zilver.md";
  slug: "hp-pavilion-15-eh2450nd-5625u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh2450nd-laptop-15-6-inch.md": {
	id: "hp-pavilion-15-eh2450nd-laptop-15-6-inch.md";
  slug: "hp-pavilion-15-eh2450nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh2550nd-5625u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-zilver.md": {
	id: "hp-pavilion-15-eh2550nd-5625u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-zilver.md";
  slug: "hp-pavilion-15-eh2550nd-5625u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh2650nd-laptop-15-6-inch.md": {
	id: "hp-pavilion-15-eh2650nd-laptop-15-6-inch.md";
  slug: "hp-pavilion-15-eh2650nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh2655nd-laptop-15-6-inch.md": {
	id: "hp-pavilion-15-eh2655nd-laptop-15-6-inch.md";
  slug: "hp-pavilion-15-eh2655nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh2770nd-laptop-15-6-inch.md": {
	id: "hp-pavilion-15-eh2770nd-laptop-15-6-inch.md";
  slug: "hp-pavilion-15-eh2770nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh2865nd-5825u-notebook-39-6-cm-full-hd-amd-ryzen-7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md": {
	id: "hp-pavilion-15-eh2865nd-5825u-notebook-39-6-cm-full-hd-amd-ryzen-7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md";
  slug: "hp-pavilion-15-eh2865nd-5825u-notebook-39-6-cm-full-hd-amd-ryzen-7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh3045nd-15-fhd-r5-5735u-8gb-512gb-w11.md": {
	id: "hp-pavilion-15-eh3045nd-15-fhd-r5-5735u-8gb-512gb-w11.md";
  slug: "hp-pavilion-15-eh3045nd-15-fhd-r5-5735u-8gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh3045nd-156-inch-amd-ryzen-5-8-gb-512-gb-1761670.md": {
	id: "hp-pavilion-15-eh3045nd-156-inch-amd-ryzen-5-8-gb-512-gb-1761670.md";
  slug: "hp-pavilion-15-eh3045nd-156-inch-amd-ryzen-5-8-gb-512-gb-1761670";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh3051nd-15-fhd-r5-7530u-16gb-512gb-w11.md": {
	id: "hp-pavilion-15-eh3051nd-15-fhd-r5-7530u-16gb-512gb-w11.md";
  slug: "hp-pavilion-15-eh3051nd-15-fhd-r5-7530u-16gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh3070nd.md": {
	id: "hp-pavilion-15-eh3070nd.md";
  slug: "hp-pavilion-15-eh3070nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh3375nd-laptop-ryzen-7-7730u-radeon-graphics-16-gb-1-tb-ssd.md": {
	id: "hp-pavilion-15-eh3375nd-laptop-ryzen-7-7730u-radeon-graphics-16-gb-1-tb-ssd.md";
  slug: "hp-pavilion-15-eh3375nd-laptop-ryzen-7-7730u-radeon-graphics-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh3555nd-870l6ea-abh-qwerty.md": {
	id: "hp-pavilion-15-eh3555nd-870l6ea-abh-qwerty.md";
  slug: "hp-pavilion-15-eh3555nd-870l6ea-abh-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh3751nd-laptop-15-6-inch.md": {
	id: "hp-pavilion-15-eh3751nd-laptop-15-6-inch.md";
  slug: "hp-pavilion-15-eh3751nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh3755nd-laptop-15-6-inch.md": {
	id: "hp-pavilion-15-eh3755nd-laptop-15-6-inch.md";
  slug: "hp-pavilion-15-eh3755nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh3771nd-laptop-15-6-inch.md": {
	id: "hp-pavilion-15-eh3771nd-laptop-15-6-inch.md";
  slug: "hp-pavilion-15-eh3771nd-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh3843nd-156-inch-amd-ryzen-7-16-gb-512-gb-1758391.md": {
	id: "hp-pavilion-15-eh3843nd-156-inch-amd-ryzen-7-16-gb-512-gb-1758391.md";
  slug: "hp-pavilion-15-eh3843nd-156-inch-amd-ryzen-7-16-gb-512-gb-1758391";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh384nd-amd-ryzen-5-16-gb-512-gb-1758390.md": {
	id: "hp-pavilion-15-eh384nd-amd-ryzen-5-16-gb-512-gb-1758390.md";
  slug: "hp-pavilion-15-eh384nd-amd-ryzen-5-16-gb-512-gb-1758390";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh3950nd.md": {
	id: "hp-pavilion-15-eh3950nd.md";
  slug: "hp-pavilion-15-eh3950nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-eh3955nd.md": {
	id: "hp-pavilion-15-eh3955nd.md";
  slug: "hp-pavilion-15-eh3955nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-15-er1060nd-15-fhd-touch-i5-1235u-16gb-512gb-w11.md": {
	id: "hp-pavilion-15-er1060nd-15-fhd-touch-i5-1235u-16gb-512gb-w11.md";
  slug: "hp-pavilion-15-er1060nd-15-fhd-touch-i5-1235u-16gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-aero-13-be2070nd-13-fhd-r5-7535u-8gb-512gb-w11.md": {
	id: "hp-pavilion-aero-13-be2070nd-13-fhd-r5-7535u-8gb-512gb-w11.md";
  slug: "hp-pavilion-aero-13-be2070nd-13-fhd-r5-7535u-8gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-aero-13-be2075nd-133-inch-amd-ryzen-5-16-gb-512-gb-1761663.md": {
	id: "hp-pavilion-aero-13-be2075nd-133-inch-amd-ryzen-5-16-gb-512-gb-1761663.md";
  slug: "hp-pavilion-aero-13-be2075nd-133-inch-amd-ryzen-5-16-gb-512-gb-1761663";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-aero-13-be2370nd-laptop-13-3-wuxga-amd-ryzen-5-7535u-radeon-graphics-8-gb-lpddr5-512-gb-ssd-windows-11-tsb-us-international-qwerty.md": {
	id: "hp-pavilion-aero-13-be2370nd-laptop-13-3-wuxga-amd-ryzen-5-7535u-radeon-graphics-8-gb-lpddr5-512-gb-ssd-windows-11-tsb-us-international-qwerty.md";
  slug: "hp-pavilion-aero-13-be2370nd-laptop-13-3-wuxga-amd-ryzen-5-7535u-radeon-graphics-8-gb-lpddr5-512-gb-ssd-windows-11-tsb-us-international-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-aero-13-be2370nd-laptop-ryzen-5-7535u-radeon-graphics-8-gb-512-gb-ssd.md": {
	id: "hp-pavilion-aero-13-be2370nd-laptop-ryzen-5-7535u-radeon-graphics-8-gb-512-gb-ssd.md";
  slug: "hp-pavilion-aero-13-be2370nd-laptop-ryzen-5-7535u-radeon-graphics-8-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-aero-13-be2950nd.md": {
	id: "hp-pavilion-aero-13-be2950nd.md";
  slug: "hp-pavilion-aero-13-be2950nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-aero-13-be2971nd.md": {
	id: "hp-pavilion-aero-13-be2971nd.md";
  slug: "hp-pavilion-aero-13-be2971nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-laptop-14-dv2521nd-870k5ea-abh-qwerty.md": {
	id: "hp-pavilion-laptop-14-dv2521nd-870k5ea-abh-qwerty.md";
  slug: "hp-pavilion-laptop-14-dv2521nd-870k5ea-abh-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-laptop-15-eh1907nd.md": {
	id: "hp-pavilion-laptop-15-eh1907nd.md";
  slug: "hp-pavilion-laptop-15-eh1907nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-laptop-15-eh3550nd-870l5ea-abh-qwerty.md": {
	id: "hp-pavilion-laptop-15-eh3550nd-870l5ea-abh-qwerty.md";
  slug: "hp-pavilion-laptop-15-eh3550nd-870l5ea-abh-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-eh0080nd-i5-1240p-notebook-35-6-cm-2-2k-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-home-zilver.md": {
	id: "hp-pavilion-plus-14-eh0080nd-i5-1240p-notebook-35-6-cm-2-2k-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-home-zilver.md";
  slug: "hp-pavilion-plus-14-eh0080nd-i5-1240p-notebook-35-6-cm-2-2k-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-eh0155nd-i7-12700h-notebook-35-6-cm-2-8k-intel-core-i7-16-gb-ddr4-sdram-1000-gb-ssd-wi-fi-6e-windows-11-home-blauw.md": {
	id: "hp-pavilion-plus-14-eh0155nd-i7-12700h-notebook-35-6-cm-2-8k-intel-core-i7-16-gb-ddr4-sdram-1000-gb-ssd-wi-fi-6e-windows-11-home-blauw.md";
  slug: "hp-pavilion-plus-14-eh0155nd-i7-12700h-notebook-35-6-cm-2-8k-intel-core-i7-16-gb-ddr4-sdram-1000-gb-ssd-wi-fi-6e-windows-11-home-blauw";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-eh0770nd-laptop-14-inch.md": {
	id: "hp-pavilion-plus-14-eh0770nd-laptop-14-inch.md";
  slug: "hp-pavilion-plus-14-eh0770nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-eh1080nd-14-i5-1340p-16gb-512gb.md": {
	id: "hp-pavilion-plus-14-eh1080nd-14-i5-1340p-16gb-512gb.md";
  slug: "hp-pavilion-plus-14-eh1080nd-14-i5-1340p-16gb-512gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-eh1090nd-14-inch-intel-core-i7-16-gb-512-gb-1769359.md": {
	id: "hp-pavilion-plus-14-eh1090nd-14-inch-intel-core-i7-16-gb-512-gb-1769359.md";
  slug: "hp-pavilion-plus-14-eh1090nd-14-inch-intel-core-i7-16-gb-512-gb-1769359";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-eh1090nd-14-oled-i7-13700h-16gb-512gb.md": {
	id: "hp-pavilion-plus-14-eh1090nd-14-oled-i7-13700h-16gb-512gb.md";
  slug: "hp-pavilion-plus-14-eh1090nd-14-oled-i7-13700h-16gb-512gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-eh1580nd-839s2ea-abh-qwerty.md": {
	id: "hp-pavilion-plus-14-eh1580nd-839s2ea-abh-qwerty.md";
  slug: "hp-pavilion-plus-14-eh1580nd-839s2ea-abh-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-eh1693nd-14-2-2k-ips-100-srgb-i5-1335u-geforce-mx550-16gb-ddr4-1000gb-ssd-toetsenbordverlichting-win-11-home.md": {
	id: "hp-pavilion-plus-14-eh1693nd-14-2-2k-ips-100-srgb-i5-1335u-geforce-mx550-16gb-ddr4-1000gb-ssd-toetsenbordverlichting-win-11-home.md";
  slug: "hp-pavilion-plus-14-eh1693nd-14-2-2k-ips-100-srgb-i5-1335u-geforce-mx550-16gb-ddr4-1000gb-ssd-toetsenbordverlichting-win-11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-eh1750nd-laptop-14-inch.md": {
	id: "hp-pavilion-plus-14-eh1750nd-laptop-14-inch.md";
  slug: "hp-pavilion-plus-14-eh1750nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-eh1770nd-laptop-14-inch.md": {
	id: "hp-pavilion-plus-14-eh1770nd-laptop-14-inch.md";
  slug: "hp-pavilion-plus-14-eh1770nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-eh1775nd-creator-laptop-14-inch.md": {
	id: "hp-pavilion-plus-14-eh1775nd-creator-laptop-14-inch.md";
  slug: "hp-pavilion-plus-14-eh1775nd-creator-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-eh1980nd.md": {
	id: "hp-pavilion-plus-14-eh1980nd.md";
  slug: "hp-pavilion-plus-14-eh1980nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-ew0025nd.md": {
	id: "hp-pavilion-plus-14-ew0025nd.md";
  slug: "hp-pavilion-plus-14-ew0025nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-ew0035nd-8y7l9ea-laptop-i5-1335u-iris-xe-graphics-16-gb-1-tb-ssd.md": {
	id: "hp-pavilion-plus-14-ew0035nd-8y7l9ea-laptop-i5-1335u-iris-xe-graphics-16-gb-1-tb-ssd.md";
  slug: "hp-pavilion-plus-14-ew0035nd-8y7l9ea-laptop-i5-1335u-iris-xe-graphics-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-ew0725nd-laptop-14-inch.md": {
	id: "hp-pavilion-plus-14-ew0725nd-laptop-14-inch.md";
  slug: "hp-pavilion-plus-14-ew0725nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-ew0735nd-laptop-14-inch.md": {
	id: "hp-pavilion-plus-14-ew0735nd-laptop-14-inch.md";
  slug: "hp-pavilion-plus-14-ew0735nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-ey0025nd-8y7m1ea-laptop-ryzen-7-7840u-radeon-780m-16-gb-512-gb-ssd.md": {
	id: "hp-pavilion-plus-14-ey0025nd-8y7m1ea-laptop-ryzen-7-7840u-radeon-780m-16-gb-512-gb-ssd.md";
  slug: "hp-pavilion-plus-14-ey0025nd-8y7m1ea-laptop-ryzen-7-7840u-radeon-780m-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-ey0026nd-8y7m2ea-laptop-ryzen-7-7840u-radeon-780m-16-gb-512-gb-ssd.md": {
	id: "hp-pavilion-plus-14-ey0026nd-8y7m2ea-laptop-ryzen-7-7840u-radeon-780m-16-gb-512-gb-ssd.md";
  slug: "hp-pavilion-plus-14-ey0026nd-8y7m2ea-laptop-ryzen-7-7840u-radeon-780m-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-ey0710nd-laptop-14-inch.md": {
	id: "hp-pavilion-plus-14-ey0710nd-laptop-14-inch.md";
  slug: "hp-pavilion-plus-14-ey0710nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-ey0725nd-laptop-14-inch.md": {
	id: "hp-pavilion-plus-14-ey0725nd-laptop-14-inch.md";
  slug: "hp-pavilion-plus-14-ey0725nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-ey0726nd-laptop-14-inch.md": {
	id: "hp-pavilion-plus-14-ey0726nd-laptop-14-inch.md";
  slug: "hp-pavilion-plus-14-ey0726nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-ey0950nd.md": {
	id: "hp-pavilion-plus-14-ey0950nd.md";
  slug: "hp-pavilion-plus-14-ey0950nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-14-ey0970nd.md": {
	id: "hp-pavilion-plus-14-ey0970nd.md";
  slug: "hp-pavilion-plus-14-ey0970nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-16-ab0070nd-90n51ea-laptop-core-i7-13700h-rtx-3050-16-gb-1-tb-ssd.md": {
	id: "hp-pavilion-plus-16-ab0070nd-90n51ea-laptop-core-i7-13700h-rtx-3050-16-gb-1-tb-ssd.md";
  slug: "hp-pavilion-plus-16-ab0070nd-90n51ea-laptop-core-i7-13700h-rtx-3050-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-16-ab0760nd-laptop-14-inch.md": {
	id: "hp-pavilion-plus-16-ab0760nd-laptop-14-inch.md";
  slug: "hp-pavilion-plus-16-ab0760nd-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-laptop-14-eh1091nd-windows-11-home-14-intel-core-i7-16gb-ram-512gb-ssd-2-8k-spaceblauw.md": {
	id: "hp-pavilion-plus-laptop-14-eh1091nd-windows-11-home-14-intel-core-i7-16gb-ram-512gb-ssd-2-8k-spaceblauw.md";
  slug: "hp-pavilion-plus-laptop-14-eh1091nd-windows-11-home-14-intel-core-i7-16gb-ram-512gb-ssd-2-8k-spaceblauw";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-laptop-16-ab0770nd-creator-laptop-16-inch.md": {
	id: "hp-pavilion-plus-laptop-16-ab0770nd-creator-laptop-16-inch.md";
  slug: "hp-pavilion-plus-laptop-16-ab0770nd-creator-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-plus-oled-14-ew0970nd.md": {
	id: "hp-pavilion-plus-oled-14-ew0970nd.md";
  slug: "hp-pavilion-plus-oled-14-ew0970nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-14-ek0090nd-14-inch-intel-core-i7-16-gb-512gb-1758377.md": {
	id: "hp-pavilion-x360-14-ek0090nd-14-inch-intel-core-i7-16-gb-512gb-1758377.md";
  slug: "hp-pavilion-x360-14-ek0090nd-14-inch-intel-core-i7-16-gb-512gb-1758377";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-14-ek0250nd-1739461.md": {
	id: "hp-pavilion-x360-14-ek0250nd-1739461.md";
  slug: "hp-pavilion-x360-14-ek0250nd-1739461";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-14-ek0350nd-laptop-i5-1235u-iris-xe-graphics-8-gb-512-gb-ssd-touch.md": {
	id: "hp-pavilion-x360-14-ek0350nd-laptop-i5-1235u-iris-xe-graphics-8-gb-512-gb-ssd-touch.md";
  slug: "hp-pavilion-x360-14-ek0350nd-laptop-i5-1235u-iris-xe-graphics-8-gb-512-gb-ssd-touch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-14-ek0390nd-laptop-i7-1255u-iris-xe-graphics-16-gb-512-gb-ssd-touch.md": {
	id: "hp-pavilion-x360-14-ek0390nd-laptop-i7-1255u-iris-xe-graphics-16-gb-512-gb-ssd-touch.md";
  slug: "hp-pavilion-x360-14-ek0390nd-laptop-i7-1255u-iris-xe-graphics-16-gb-512-gb-ssd-touch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-14-ek0602nd-14-full-hd-touch-ips-glare-intel-core-i5-12e-gen-8gb-ddr4-256gb-m-2-nvme-ssd-verlicht-toetsenbord-windows-11-home.md": {
	id: "hp-pavilion-x360-14-ek0602nd-14-full-hd-touch-ips-glare-intel-core-i5-12e-gen-8gb-ddr4-256gb-m-2-nvme-ssd-verlicht-toetsenbord-windows-11-home.md";
  slug: "hp-pavilion-x360-14-ek0602nd-14-full-hd-touch-ips-glare-intel-core-i5-12e-gen-8gb-ddr4-256gb-m-2-nvme-ssd-verlicht-toetsenbord-windows-11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-14-ek0751nd-2-in-1-laptop-14-inch.md": {
	id: "hp-pavilion-x360-14-ek0751nd-2-in-1-laptop-14-inch.md";
  slug: "hp-pavilion-x360-14-ek0751nd-2-in-1-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-14-ek0770nd-2-in-1-laptop-14-inch.md": {
	id: "hp-pavilion-x360-14-ek0770nd-2-in-1-laptop-14-inch.md";
  slug: "hp-pavilion-x360-14-ek0770nd-2-in-1-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-14-ek0771nd-2-in-1-laptop-14-inch.md": {
	id: "hp-pavilion-x360-14-ek0771nd-2-in-1-laptop-14-inch.md";
  slug: "hp-pavilion-x360-14-ek0771nd-2-in-1-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-14-ek0775nd-2-in-1-laptop-14-inch.md": {
	id: "hp-pavilion-x360-14-ek0775nd-2-in-1-laptop-14-inch.md";
  slug: "hp-pavilion-x360-14-ek0775nd-2-in-1-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-14-ek0956nd.md": {
	id: "hp-pavilion-x360-14-ek0956nd.md";
  slug: "hp-pavilion-x360-14-ek0956nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-14-ek0957nd.md": {
	id: "hp-pavilion-x360-14-ek0957nd.md";
  slug: "hp-pavilion-x360-14-ek0957nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-15-er1060nd-156-inch-intel-core-i5-16-gb-512-gb-1758378.md": {
	id: "hp-pavilion-x360-15-er1060nd-156-inch-intel-core-i5-16-gb-512-gb-1758378.md";
  slug: "hp-pavilion-x360-15-er1060nd-156-inch-intel-core-i5-16-gb-512-gb-1758378";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-15-er1250nd-i5-1235u-hybride-39-6-cm-touchscreen-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md": {
	id: "hp-pavilion-x360-15-er1250nd-i5-1235u-hybride-39-6-cm-touchscreen-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver.md";
  slug: "hp-pavilion-x360-15-er1250nd-i5-1235u-hybride-39-6-cm-touchscreen-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-15-er1350nd-laptop-15-6-full-hd-touchscreen-intel-core-i5-1235u-iris-xe-graphics-8-gb-ddr4-512-gb-ssd-windows-11-tsb-us-international-qwerty.md": {
	id: "hp-pavilion-x360-15-er1350nd-laptop-15-6-full-hd-touchscreen-intel-core-i5-1235u-iris-xe-graphics-8-gb-ddr4-512-gb-ssd-windows-11-tsb-us-international-qwerty.md";
  slug: "hp-pavilion-x360-15-er1350nd-laptop-15-6-full-hd-touchscreen-intel-core-i5-1235u-iris-xe-graphics-8-gb-ddr4-512-gb-ssd-windows-11-tsb-us-international-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-15-er1350nd-laptop-i5-1235u-iris-xe-graphics-8-gb-512-gb-ssd-touch.md": {
	id: "hp-pavilion-x360-15-er1350nd-laptop-i5-1235u-iris-xe-graphics-8-gb-512-gb-ssd-touch.md";
  slug: "hp-pavilion-x360-15-er1350nd-laptop-i5-1235u-iris-xe-graphics-8-gb-512-gb-ssd-touch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-15-er1360nd-laptop-i5-1235u-iris-xe-graphics-16-gb-512-gb-ssd-touch.md": {
	id: "hp-pavilion-x360-15-er1360nd-laptop-i5-1235u-iris-xe-graphics-16-gb-512-gb-ssd-touch.md";
  slug: "hp-pavilion-x360-15-er1360nd-laptop-i5-1235u-iris-xe-graphics-16-gb-512-gb-ssd-touch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-15-er1660nd-15-6-touchscreen-fhd-ips-i5-1235u-16gb-ddr4-512gb-m-2-ssd-toetsenbordverlichting-vingerafdrukscanner-w11-home.md": {
	id: "hp-pavilion-x360-15-er1660nd-15-6-touchscreen-fhd-ips-i5-1235u-16gb-ddr4-512gb-m-2-ssd-toetsenbordverlichting-vingerafdrukscanner-w11-home.md";
  slug: "hp-pavilion-x360-15-er1660nd-15-6-touchscreen-fhd-ips-i5-1235u-16gb-ddr4-512gb-m-2-ssd-toetsenbordverlichting-vingerafdrukscanner-w11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-15-er1750nd-2-in-1-laptop-15-6-inch.md": {
	id: "hp-pavilion-x360-15-er1750nd-2-in-1-laptop-15-6-inch.md";
  slug: "hp-pavilion-x360-15-er1750nd-2-in-1-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-15-er1952nd.md": {
	id: "hp-pavilion-x360-15-er1952nd.md";
  slug: "hp-pavilion-x360-15-er1952nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pavilion-x360-2-in-1-laptop-14-ek0250nd.md": {
	id: "hp-pavilion-x360-2-in-1-laptop-14-ek0250nd.md";
  slug: "hp-pavilion-x360-2-in-1-laptop-14-ek0250nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pb450g9-i7-1255u-16gb-512-15-6in-w11p.md": {
	id: "hp-pb450g9-i7-1255u-16gb-512-15-6in-w11p.md";
  slug: "hp-pb450g9-i7-1255u-16gb-512-15-6in-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-pro-x2-612-g2.md": {
	id: "hp-pro-x2-612-g2.md";
  slug: "hp-pro-x2-612-g2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-430-g7-13-3-fhd-i5-10210u-8gb-256gb-w10p.md": {
	id: "hp-probook-430-g7-13-3-fhd-i5-10210u-8gb-256gb-w10p.md";
  slug: "hp-probook-430-g7-13-3-fhd-i5-10210u-8gb-256gb-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-430-g7-notebook-33-8-cm-1920-x-1080-pixels-intel-10de-generatie-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-10-pro-zilver.md": {
	id: "hp-probook-430-g7-notebook-33-8-cm-1920-x-1080-pixels-intel-10de-generatie-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-10-pro-zilver.md";
  slug: "hp-probook-430-g7-notebook-33-8-cm-1920-x-1080-pixels-intel-10de-generatie-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-440-g10-816h7ea-14-inch-intel-core-i5-8-gb-256-gb-1769753.md": {
	id: "hp-probook-440-g10-816h7ea-14-inch-intel-core-i5-8-gb-256-gb-1769753.md";
  slug: "hp-probook-440-g10-816h7ea-14-inch-intel-core-i5-8-gb-256-gb-1769753";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-440-g10-816h8ea-14-inch-intel-core-i5-16-gb-512-gb-1769752.md": {
	id: "hp-probook-440-g10-816h8ea-14-inch-intel-core-i5-16-gb-512-gb-1769752.md";
  slug: "hp-probook-440-g10-816h8ea-14-inch-intel-core-i5-16-gb-512-gb-1769752";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-440-g10-816h8ea.md": {
	id: "hp-probook-440-g10-816h8ea.md";
  slug: "hp-probook-440-g10-816h8ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-440-g10-i7-1355u-16gb-512gb-ssd-14-fhd-w11p-5-jaar-garantie-verl-keyb.md": {
	id: "hp-probook-440-g10-i7-1355u-16gb-512gb-ssd-14-fhd-w11p-5-jaar-garantie-verl-keyb.md";
  slug: "hp-probook-440-g10-i7-1355u-16gb-512gb-ssd-14-fhd-w11p-5-jaar-garantie-verl-keyb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-440-g10-zakelijke-laptop-14-fhd-i5-1335u-16gb-512gb-w11p-keyboard-verlichting-5-jaar-garantie.md": {
	id: "hp-probook-440-g10-zakelijke-laptop-14-fhd-i5-1335u-16gb-512gb-w11p-keyboard-verlichting-5-jaar-garantie.md";
  slug: "hp-probook-440-g10-zakelijke-laptop-14-fhd-i5-1335u-16gb-512gb-w11p-keyboard-verlichting-5-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-440-g10-zakelijke-laptop-14-fhd-i5-1335u-8gb-512gb-w11p-keyboard-verlichting-3-jaar-garantie.md": {
	id: "hp-probook-440-g10-zakelijke-laptop-14-fhd-i5-1335u-8gb-512gb-w11p-keyboard-verlichting-3-jaar-garantie.md";
  slug: "hp-probook-440-g10-zakelijke-laptop-14-fhd-i5-1335u-8gb-512gb-w11p-keyboard-verlichting-3-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-440-g10-zakelijke-laptop-14-fhd-i7-1355u-16gb-512gb-w11p-keyboard-verlichting-5-jaar-garantie.md": {
	id: "hp-probook-440-g10-zakelijke-laptop-14-fhd-i7-1355u-16gb-512gb-w11p-keyboard-verlichting-5-jaar-garantie.md";
  slug: "hp-probook-440-g10-zakelijke-laptop-14-fhd-i7-1355u-16gb-512gb-w11p-keyboard-verlichting-5-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-440-g9-i5-1235u-16gb-512gb-ssd-14-fhd-w10p-verl-keyb-3y-garantie.md": {
	id: "hp-probook-440-g9-i5-1235u-16gb-512gb-ssd-14-fhd-w10p-verl-keyb-3y-garantie.md";
  slug: "hp-probook-440-g9-i5-1235u-16gb-512gb-ssd-14-fhd-w10p-verl-keyb-3y-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-440-g9-zakelijke-laptop-14-fhd-i7-1255u-16gb-512gb-w10p-keyboard-verlichting.md": {
	id: "hp-probook-440-g9-zakelijke-laptop-14-fhd-i7-1255u-16gb-512gb-w10p-keyboard-verlichting.md";
  slug: "hp-probook-440-g9-zakelijke-laptop-14-fhd-i7-1255u-16gb-512gb-w10p-keyboard-verlichting";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-445-14-inch-g9-notebook-pc.md": {
	id: "hp-probook-445-14-inch-g9-notebook-pc.md";
  slug: "hp-probook-445-14-inch-g9-notebook-pc";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-445-g10-853f5es-abh.md": {
	id: "hp-probook-445-g10-853f5es-abh.md";
  slug: "hp-probook-445-g10-853f5es-abh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-445-g10-853g3es-abh-qwerty.md": {
	id: "hp-probook-445-g10-853g3es-abh-qwerty.md";
  slug: "hp-probook-445-g10-853g3es-abh-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-445-g10-85c71ea.md": {
	id: "hp-probook-445-g10-85c71ea.md";
  slug: "hp-probook-445-g10-85c71ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-15-6-g9-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-10-pro-zilver.md": {
	id: "hp-probook-450-15-6-g9-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-10-pro-zilver.md";
  slug: "hp-probook-450-15-6-g9-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-15-6-inch-g9-notebook-pc-2.md": {
	id: "hp-probook-450-15-6-inch-g9-notebook-pc-2.md";
  slug: "hp-probook-450-15-6-inch-g9-notebook-pc-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-15-6-inch-g9-notebook-pc-3.md": {
	id: "hp-probook-450-15-6-inch-g9-notebook-pc-3.md";
  slug: "hp-probook-450-15-6-inch-g9-notebook-pc-3";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-15-6-inch-g9-notebook-pc-i5-1235u-8gb-256gb-ssd-w10pro-2.md": {
	id: "hp-probook-450-15-6-inch-g9-notebook-pc-i5-1235u-8gb-256gb-ssd-w10pro-2.md";
  slug: "hp-probook-450-15-6-inch-g9-notebook-pc-i5-1235u-8gb-256gb-ssd-w10pro-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-15-6-inch-g9-notebook-pc-i5-1235u-8gb-256gb-ssd-w10pro.md": {
	id: "hp-probook-450-15-6-inch-g9-notebook-pc-i5-1235u-8gb-256gb-ssd-w10pro.md";
  slug: "hp-probook-450-15-6-inch-g9-notebook-pc-i5-1235u-8gb-256gb-ssd-w10pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-15-6-inch-g9-notebook-pc.md": {
	id: "hp-probook-450-15-6-inch-g9-notebook-pc.md";
  slug: "hp-probook-450-15-6-inch-g9-notebook-pc";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g10-816h4ea-156-inch-intel-core-i5-8-gb-256-gb-1769755.md": {
	id: "hp-probook-450-g10-816h4ea-156-inch-intel-core-i5-8-gb-256-gb-1769755.md";
  slug: "hp-probook-450-g10-816h4ea-156-inch-intel-core-i5-8-gb-256-gb-1769755";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g10-816h4ea.md": {
	id: "hp-probook-450-g10-816h4ea.md";
  slug: "hp-probook-450-g10-816h4ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g10-85b81ea-156-inch-intel-core-i5-16-gb-512-gb-1769754.md": {
	id: "hp-probook-450-g10-85b81ea-156-inch-intel-core-i5-16-gb-512-gb-1769754.md";
  slug: "hp-probook-450-g10-85b81ea-156-inch-intel-core-i5-16-gb-512-gb-1769754";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g10-85b81ea.md": {
	id: "hp-probook-450-g10-85b81ea.md";
  slug: "hp-probook-450-g10-85b81ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g10-85b82ea-156-inch-intel-core-i7-16-gb-512-gb-1769756.md": {
	id: "hp-probook-450-g10-85b82ea-156-inch-intel-core-i7-16-gb-512-gb-1769756.md";
  slug: "hp-probook-450-g10-85b82ea-156-inch-intel-core-i7-16-gb-512-gb-1769756";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g10-85b82ea.md": {
	id: "hp-probook-450-g10-85b82ea.md";
  slug: "hp-probook-450-g10-85b82ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g10-i5-1335u-16gb-512gb-ssd-15-6-fhd-w10p-3y-gar-verl-keyb-nl.md": {
	id: "hp-probook-450-g10-i5-1335u-16gb-512gb-ssd-15-6-fhd-w10p-3y-gar-verl-keyb-nl.md";
  slug: "hp-probook-450-g10-i5-1335u-16gb-512gb-ssd-15-6-fhd-w10p-3y-gar-verl-keyb-nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g10-i5-1335u-16gb-512gb-ssd-15-6-fhd-w11p-3y-gar-verl-keyb-nl.md": {
	id: "hp-probook-450-g10-i5-1335u-16gb-512gb-ssd-15-6-fhd-w11p-3y-gar-verl-keyb-nl.md";
  slug: "hp-probook-450-g10-i5-1335u-16gb-512gb-ssd-15-6-fhd-w11p-3y-gar-verl-keyb-nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g10-i7-1355u-16gb-512gb-ssd-15-6-fhd-w11p-3y-gar-verl-keyb-nl.md": {
	id: "hp-probook-450-g10-i7-1355u-16gb-512gb-ssd-15-6-fhd-w11p-3y-gar-verl-keyb-nl.md";
  slug: "hp-probook-450-g10-i7-1355u-16gb-512gb-ssd-15-6-fhd-w11p-3y-gar-verl-keyb-nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g10-zakelijke-laptop-15-6-fhd-i5-1335u-16gb-512gb-w10p-keyboard-verlichting-3-jaar-garantie.md": {
	id: "hp-probook-450-g10-zakelijke-laptop-15-6-fhd-i5-1335u-16gb-512gb-w10p-keyboard-verlichting-3-jaar-garantie.md";
  slug: "hp-probook-450-g10-zakelijke-laptop-15-6-fhd-i5-1335u-16gb-512gb-w10p-keyboard-verlichting-3-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g10-zakelijke-laptop-15-6-fhd-i5-1335u-16gb-512gb-w11p-keyboard-verlichting-3-jaar-garantie.md": {
	id: "hp-probook-450-g10-zakelijke-laptop-15-6-fhd-i5-1335u-16gb-512gb-w11p-keyboard-verlichting-3-jaar-garantie.md";
  slug: "hp-probook-450-g10-zakelijke-laptop-15-6-fhd-i5-1335u-16gb-512gb-w11p-keyboard-verlichting-3-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g10-zakelijke-laptop-15-6-fhd-i5-1335u-8gb-512gb-w11p-keyboard-verlichting-3-jaar-garantie.md": {
	id: "hp-probook-450-g10-zakelijke-laptop-15-6-fhd-i5-1335u-8gb-512gb-w11p-keyboard-verlichting-3-jaar-garantie.md";
  slug: "hp-probook-450-g10-zakelijke-laptop-15-6-fhd-i5-1335u-8gb-512gb-w11p-keyboard-verlichting-3-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g10-zakelijke-laptop-15-6-fhd-i7-1355u-16gb-1tb-rtx2050-w11p-keyboard-verlichting-3-jaar-garantie.md": {
	id: "hp-probook-450-g10-zakelijke-laptop-15-6-fhd-i7-1355u-16gb-1tb-rtx2050-w11p-keyboard-verlichting-3-jaar-garantie.md";
  slug: "hp-probook-450-g10-zakelijke-laptop-15-6-fhd-i7-1355u-16gb-1tb-rtx2050-w11p-keyboard-verlichting-3-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g10-zakelijke-laptop-15-6-fhd-i7-1355u-16gb-512gb-w11p-keyboard-verlichting-3-jaar-garantie.md": {
	id: "hp-probook-450-g10-zakelijke-laptop-15-6-fhd-i7-1355u-16gb-512gb-w11p-keyboard-verlichting-3-jaar-garantie.md";
  slug: "hp-probook-450-g10-zakelijke-laptop-15-6-fhd-i7-1355u-16gb-512gb-w11p-keyboard-verlichting-3-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g8-15-6-1920x1080-256gb-zilver-intel-core-i7-8-gb-windows-10-pro.md": {
	id: "hp-probook-450-g8-15-6-1920x1080-256gb-zilver-intel-core-i7-8-gb-windows-10-pro.md";
  slug: "hp-probook-450-g8-15-6-1920x1080-256gb-zilver-intel-core-i7-8-gb-windows-10-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g8-15-6-fhd-i5-1135g7-8gb-256gb-w10p-toetsenbord-verlichting.md": {
	id: "hp-probook-450-g8-15-6-fhd-i5-1135g7-8gb-256gb-w10p-toetsenbord-verlichting.md";
  slug: "hp-probook-450-g8-15-6-fhd-i5-1135g7-8gb-256gb-w10p-toetsenbord-verlichting";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g8-15-6-fhd-i51135g7-8gb-256gb-ssd-w10pro.md": {
	id: "hp-probook-450-g8-15-6-fhd-i51135g7-8gb-256gb-ssd-w10pro.md";
  slug: "hp-probook-450-g8-15-6-fhd-i51135g7-8gb-256gb-ssd-w10pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g8-15-6-fhd-i7-1165g7-8gb-512gb-w10p-keyboard-verlichting.md": {
	id: "hp-probook-450-g8-15-6-fhd-i7-1165g7-8gb-512gb-w10p-keyboard-verlichting.md";
  slug: "hp-probook-450-g8-15-6-fhd-i7-1165g7-8gb-512gb-w10p-keyboard-verlichting";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g8-15-6-fhd-ips-i5-8gb-ddr4-512gb-m-2-ssd-verlicht-toetsenbord-win-11-pro-ready.md": {
	id: "hp-probook-450-g8-15-6-fhd-ips-i5-8gb-ddr4-512gb-m-2-ssd-verlicht-toetsenbord-win-11-pro-ready.md";
  slug: "hp-probook-450-g8-15-6-fhd-ips-i5-8gb-ddr4-512gb-m-2-ssd-verlicht-toetsenbord-win-11-pro-ready";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g8-4b2z4ea-laptop-256gb-ssd-intel-i5-windows-10-pro.md": {
	id: "hp-probook-450-g8-4b2z4ea-laptop-256gb-ssd-intel-i5-windows-10-pro.md";
  slug: "hp-probook-450-g8-4b2z4ea-laptop-256gb-ssd-intel-i5-windows-10-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g8-core-i5-1135g7-8gb-512gb-ssd-15-6-fhd-win-10-pro.md": {
	id: "hp-probook-450-g8-core-i5-1135g7-8gb-512gb-ssd-15-6-fhd-win-10-pro.md";
  slug: "hp-probook-450-g8-core-i5-1135g7-8gb-512gb-ssd-15-6-fhd-win-10-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g8-i7-1165g7-notebook-39-6-cm-full-hd-intel-core-i7-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver.md": {
	id: "hp-probook-450-g8-i7-1165g7-notebook-39-6-cm-full-hd-intel-core-i7-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver.md";
  slug: "hp-probook-450-g8-i7-1165g7-notebook-39-6-cm-full-hd-intel-core-i7-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g8-zakelijke-laptop-15-6-fhd-i5-1135g7-8gb-1tb-w10p-keyboard-verlichting.md": {
	id: "hp-probook-450-g8-zakelijke-laptop-15-6-fhd-i5-1135g7-8gb-1tb-w10p-keyboard-verlichting.md";
  slug: "hp-probook-450-g8-zakelijke-laptop-15-6-fhd-i5-1135g7-8gb-1tb-w10p-keyboard-verlichting";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g8-zakelijke-laptop-15-6-fhd-i5-1135g7-8gb-512gb-w10p-toetsenbord-verlichting.md": {
	id: "hp-probook-450-g8-zakelijke-laptop-15-6-fhd-i5-1135g7-8gb-512gb-w10p-toetsenbord-verlichting.md";
  slug: "hp-probook-450-g8-zakelijke-laptop-15-6-fhd-i5-1135g7-8gb-512gb-w10p-toetsenbord-verlichting";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g8-zakelijke-laptop-15-6-fhd-i7-1165g7-16gb-512gb-w10p-keyboard-verlichting-3-jaar-carepack.md": {
	id: "hp-probook-450-g8-zakelijke-laptop-15-6-fhd-i7-1165g7-16gb-512gb-w10p-keyboard-verlichting-3-jaar-carepack.md";
  slug: "hp-probook-450-g8-zakelijke-laptop-15-6-fhd-i7-1165g7-16gb-512gb-w10p-keyboard-verlichting-3-jaar-carepack";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-15-6-f-hd-i5-1235u-8gb-256gb-w10p.md": {
	id: "hp-probook-450-g9-15-6-f-hd-i5-1235u-8gb-256gb-w10p.md";
  slug: "hp-probook-450-g9-15-6-f-hd-i5-1235u-8gb-256gb-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-15-6-f-hd-i5-1235u-8gb-512gb-w10p.md": {
	id: "hp-probook-450-g9-15-6-f-hd-i5-1235u-8gb-512gb-w10p.md";
  slug: "hp-probook-450-g9-15-6-f-hd-i5-1235u-8gb-512gb-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-15-6-f-hd-i7-1255u-16gb-512gb-w10p.md": {
	id: "hp-probook-450-g9-15-6-f-hd-i7-1255u-16gb-512gb-w10p.md";
  slug: "hp-probook-450-g9-15-6-f-hd-i7-1255u-16gb-512gb-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-15-6-fhd-i7-1255u-8gb-256gb-ssd-w10p-w11p-ir-camera-400-nits-5y414ea-abh.md": {
	id: "hp-probook-450-g9-15-6-fhd-i7-1255u-8gb-256gb-ssd-w10p-w11p-ir-camera-400-nits-5y414ea-abh.md";
  slug: "hp-probook-450-g9-15-6-fhd-i7-1255u-8gb-256gb-ssd-w10p-w11p-ir-camera-400-nits-5y414ea-abh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-15-6-fhd-ips-i7-1255u-32gb-ddr4-512gb-m-2-ssd-w11-pro-ready-toetsenbordverlichting.md": {
	id: "hp-probook-450-g9-15-6-fhd-ips-i7-1255u-32gb-ddr4-512gb-m-2-ssd-w11-pro-ready-toetsenbordverlichting.md";
  slug: "hp-probook-450-g9-15-6-fhd-ips-i7-1255u-32gb-ddr4-512gb-m-2-ssd-w11-pro-ready-toetsenbordverlichting";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-15-6-hd-i5-1235u-8gb-256gb-w10p.md": {
	id: "hp-probook-450-g9-15-6-hd-i5-1235u-8gb-256gb-w10p.md";
  slug: "hp-probook-450-g9-15-6-hd-i5-1235u-8gb-256gb-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-15-6-hd-i5-1235u-8gb-512gb-w10p.md": {
	id: "hp-probook-450-g9-15-6-hd-i5-1235u-8gb-512gb-w10p.md";
  slug: "hp-probook-450-g9-15-6-hd-i5-1235u-8gb-512gb-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-15-6-i5-1235u-8gb-512gb-ssd-intel-iris-xe-qwerty-zilver.md": {
	id: "hp-probook-450-g9-15-6-i5-1235u-8gb-512gb-ssd-intel-iris-xe-qwerty-zilver.md";
  slug: "hp-probook-450-g9-15-6-i5-1235u-8gb-512gb-ssd-intel-iris-xe-qwerty-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-15-6-i5-1235u-8gb-512gb-ssd-intel-iris-xe-w10p-qwerty.md": {
	id: "hp-probook-450-g9-15-6-i5-1235u-8gb-512gb-ssd-intel-iris-xe-w10p-qwerty.md";
  slug: "hp-probook-450-g9-15-6-i5-1235u-8gb-512gb-ssd-intel-iris-xe-w10p-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-39-6-cm-intel-core-i5-1235u-silver.md": {
	id: "hp-probook-450-g9-39-6-cm-intel-core-i5-1235u-silver.md";
  slug: "hp-probook-450-g9-39-6-cm-intel-core-i5-1235u-silver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-i5-1235u-8gb-512gb-ssd-15-6-fhd-mx570-w11pro.md": {
	id: "hp-probook-450-g9-i5-1235u-8gb-512gb-ssd-15-6-fhd-mx570-w11pro.md";
  slug: "hp-probook-450-g9-i5-1235u-8gb-512gb-ssd-15-6-fhd-mx570-w11pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-i5-1235u-8gb-512gb-ssd-15-6-w10p-2y-garantie-nl.md": {
	id: "hp-probook-450-g9-i5-1235u-8gb-512gb-ssd-15-6-w10p-2y-garantie-nl.md";
  slug: "hp-probook-450-g9-i5-1235u-8gb-512gb-ssd-15-6-w10p-2y-garantie-nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-i5-1235u-8gb-512gb-ssd-15-6-w11p-verlicht-keyboard.md": {
	id: "hp-probook-450-g9-i5-1235u-8gb-512gb-ssd-15-6-w11p-verlicht-keyboard.md";
  slug: "hp-probook-450-g9-i5-1235u-8gb-512gb-ssd-15-6-w11p-verlicht-keyboard";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-i5-1235u-8gb-8gb-512gb-ssd-15-6-w10p.md": {
	id: "hp-probook-450-g9-i5-1235u-8gb-8gb-512gb-ssd-15-6-w10p.md";
  slug: "hp-probook-450-g9-i5-1235u-8gb-8gb-512gb-ssd-15-6-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-i7-1255u-16gb-512gb-ssd-15-6-fhd-w10pro-incl-verlicht-toetsenbord.md": {
	id: "hp-probook-450-g9-i7-1255u-16gb-512gb-ssd-15-6-fhd-w10pro-incl-verlicht-toetsenbord.md";
  slug: "hp-probook-450-g9-i7-1255u-16gb-512gb-ssd-15-6-fhd-w10pro-incl-verlicht-toetsenbord";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-i7-1255u-16gb-512gb-ssd-15-6-fhd-w10pro-nl-2-jaar-nbd-garantie.md": {
	id: "hp-probook-450-g9-i7-1255u-16gb-512gb-ssd-15-6-fhd-w10pro-nl-2-jaar-nbd-garantie.md";
  slug: "hp-probook-450-g9-i7-1255u-16gb-512gb-ssd-15-6-fhd-w10pro-nl-2-jaar-nbd-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-i7-1255u-16gb-512gb-ssd-15-6-fhd-w10pro-verlicht-toetsenbord-3-jaar-garantie.md": {
	id: "hp-probook-450-g9-i7-1255u-16gb-512gb-ssd-15-6-fhd-w10pro-verlicht-toetsenbord-3-jaar-garantie.md";
  slug: "hp-probook-450-g9-i7-1255u-16gb-512gb-ssd-15-6-fhd-w10pro-verlicht-toetsenbord-3-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-i7-1255u-16gb-512gb-ssd-15-6-fhd-w11pro.md": {
	id: "hp-probook-450-g9-i7-1255u-16gb-512gb-ssd-15-6-fhd-w11pro.md";
  slug: "hp-probook-450-g9-i7-1255u-16gb-512gb-ssd-15-6-fhd-w11pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-i7-1255u-notebook-39-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zilver.md": {
	id: "hp-probook-450-g9-i7-1255u-notebook-39-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zilver.md";
  slug: "hp-probook-450-g9-i7-1255u-notebook-39-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-notebook-full-hd-intel-core-i5-1235u-8gb-256gb-ssd-wi-fi-6e-windows-10-pro-zilver.md": {
	id: "hp-probook-450-g9-notebook-full-hd-intel-core-i5-1235u-8gb-256gb-ssd-wi-fi-6e-windows-10-pro-zilver.md";
  slug: "hp-probook-450-g9-notebook-full-hd-intel-core-i5-1235u-8gb-256gb-ssd-wi-fi-6e-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-notebook-laptop.md": {
	id: "hp-probook-450-g9-notebook-laptop.md";
  slug: "hp-probook-450-g9-notebook-laptop";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-zakelijke-laptop-15-6-fhd-250-nits-i5-1235u-16gb-512gb-w10p-keyboard-verlichting-3-jaar-garantie.md": {
	id: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-250-nits-i5-1235u-16gb-512gb-w10p-keyboard-verlichting-3-jaar-garantie.md";
  slug: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-250-nits-i5-1235u-16gb-512gb-w10p-keyboard-verlichting-3-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-16gb-1tb-w10p-keyboard-verlichting.md": {
	id: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-16gb-1tb-w10p-keyboard-verlichting.md";
  slug: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-16gb-1tb-w10p-keyboard-verlichting";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-16gb-512gb-w10p-keyboard-verlichting-3-jaar-garantie.md": {
	id: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-16gb-512gb-w10p-keyboard-verlichting-3-jaar-garantie.md";
  slug: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-16gb-512gb-w10p-keyboard-verlichting-3-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-16gb-512gb-w10p.md": {
	id: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-16gb-512gb-w10p.md";
  slug: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-16gb-512gb-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-8-8gb-512gb-mx570-2gb-w10p-keyboard-verlichting-2-jaar-nbd-garantie.md": {
	id: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-8-8gb-512gb-mx570-2gb-w10p-keyboard-verlichting-2-jaar-nbd-garantie.md";
  slug: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-8-8gb-512gb-mx570-2gb-w10p-keyboard-verlichting-2-jaar-nbd-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-8-8gb-512gb-w10p-keyboard-verlichting-3-jaar-garantie.md": {
	id: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-8-8gb-512gb-w10p-keyboard-verlichting-3-jaar-garantie.md";
  slug: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-8-8gb-512gb-w10p-keyboard-verlichting-3-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-8gb-512gb-w10p-keyboard-verlichting-2-jaar-garantie.md": {
	id: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-8gb-512gb-w10p-keyboard-verlichting-2-jaar-garantie.md";
  slug: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-8gb-512gb-w10p-keyboard-verlichting-2-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-8gb-512gb-w10p-keyboard-verlichting-3-jaar-garantie.md": {
	id: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-8gb-512gb-w10p-keyboard-verlichting-3-jaar-garantie.md";
  slug: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i5-1235u-8gb-512gb-w10p-keyboard-verlichting-3-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i7-1255u-16gb-1tb-mx570-2gb-w10p-keyboard-verlichting-3-jaar-garantie.md": {
	id: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i7-1255u-16gb-1tb-mx570-2gb-w10p-keyboard-verlichting-3-jaar-garantie.md";
  slug: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i7-1255u-16gb-1tb-mx570-2gb-w10p-keyboard-verlichting-3-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i7-1255u-16gb-512gb-mx570-2gb-w10p-keyboard-verlichting-2-jaar-nbd-garantie.md": {
	id: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i7-1255u-16gb-512gb-mx570-2gb-w10p-keyboard-verlichting-2-jaar-nbd-garantie.md";
  slug: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i7-1255u-16gb-512gb-mx570-2gb-w10p-keyboard-verlichting-2-jaar-nbd-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i7-1255u-16gb-512gb-mx570-2gb-w11p-keyboard-verlichting-2-jaar-nbd-garantie.md": {
	id: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i7-1255u-16gb-512gb-mx570-2gb-w11p-keyboard-verlichting-2-jaar-nbd-garantie.md";
  slug: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i7-1255u-16gb-512gb-mx570-2gb-w11p-keyboard-verlichting-2-jaar-nbd-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i7-1255u-8-8gb-512gb-mx570-2gb-w10p-keyboard-verlichting-3-jaar-garantie.md": {
	id: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i7-1255u-8-8gb-512gb-mx570-2gb-w10p-keyboard-verlichting-3-jaar-garantie.md";
  slug: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i7-1255u-8-8gb-512gb-mx570-2gb-w10p-keyboard-verlichting-3-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i7-1255u-8gb-512gb-mx570-2gb-w10p.md": {
	id: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i7-1255u-8gb-512gb-mx570-2gb-w10p.md";
  slug: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i7-1255u-8gb-512gb-mx570-2gb-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i7-1255u-8gb-512gb-w10p-keyboard-verlichting-3-jaar-garantie.md": {
	id: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i7-1255u-8gb-512gb-w10p-keyboard-verlichting-3-jaar-garantie.md";
  slug: "hp-probook-450-g9-zakelijke-laptop-15-6-fhd-i7-1255u-8gb-512gb-w10p-keyboard-verlichting-3-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-455-15-6-inch-g9-notebook-pc.md": {
	id: "hp-probook-455-15-6-inch-g9-notebook-pc.md";
  slug: "hp-probook-455-15-6-inch-g9-notebook-pc";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-455-g10-816j1ea.md": {
	id: "hp-probook-455-g10-816j1ea.md";
  slug: "hp-probook-455-g10-816j1ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-455-g10-853g0es-abh.md": {
	id: "hp-probook-455-g10-853g0es-abh.md";
  slug: "hp-probook-455-g10-853g0es-abh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-455-g10-853g1es-abh.md": {
	id: "hp-probook-455-g10-853g1es-abh.md";
  slug: "hp-probook-455-g10-853g1es-abh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-455-g10-853g4es-abh.md": {
	id: "hp-probook-455-g10-853g4es-abh.md";
  slug: "hp-probook-455-g10-853g4es-abh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-455-g10-853g6es-abh.md": {
	id: "hp-probook-455-g10-853g6es-abh.md";
  slug: "hp-probook-455-g10-853g6es-abh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-455-g8-business-laptop-15-6-fhd-ryzen-5-5600u-8gb-256gb-keyboard-lighting-hexa-core-400cd-m.md": {
	id: "hp-probook-455-g8-business-laptop-15-6-fhd-ryzen-5-5600u-8gb-256gb-keyboard-lighting-hexa-core-400cd-m.md";
  slug: "hp-probook-455-g8-business-laptop-15-6-fhd-ryzen-5-5600u-8gb-256gb-keyboard-lighting-hexa-core-400cd-m";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-455-g9-15-6-f-hd-ryzen-7-5825u-8gb-512gb-w10p.md": {
	id: "hp-probook-455-g9-15-6-f-hd-ryzen-7-5825u-8gb-512gb-w10p.md";
  slug: "hp-probook-455-g9-15-6-f-hd-ryzen-7-5825u-8gb-512gb-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-455-g9-7j1c5aa.md": {
	id: "hp-probook-455-g9-7j1c5aa.md";
  slug: "hp-probook-455-g9-7j1c5aa";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-455-g9-ryzen-7-5825u-16gb-512gb-ssd-15-6-fhd-w11pro-ir-camera.md": {
	id: "hp-probook-455-g9-ryzen-7-5825u-16gb-512gb-ssd-15-6-fhd-w11pro-ir-camera.md";
  slug: "hp-probook-455-g9-ryzen-7-5825u-16gb-512gb-ssd-15-6-fhd-w11pro-ir-camera";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-470-g7-notebook-zilver-17-3-i5-8gb-ddr4-256gb-ssd-amd-radeon-530-windows-10-pro.md": {
	id: "hp-probook-470-g7-notebook-zilver-17-3-i5-8gb-ddr4-256gb-ssd-amd-radeon-530-windows-10-pro.md";
  slug: "hp-probook-470-g7-notebook-zilver-17-3-i5-8gb-ddr4-256gb-ssd-amd-radeon-530-windows-10-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-470-g8-17-3-f-hd-i5-1135g7-8gb-256gb-w10p.md": {
	id: "hp-probook-470-g8-17-3-f-hd-i5-1135g7-8gb-256gb-w10p.md";
  slug: "hp-probook-470-g8-17-3-f-hd-i5-1135g7-8gb-256gb-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-635-aero-g8-5650u-notebook-33-8-cm-full-hd-amd-ryzen-5-pro-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-pro-zilver.md": {
	id: "hp-probook-635-aero-g8-5650u-notebook-33-8-cm-full-hd-amd-ryzen-5-pro-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-pro-zilver.md";
  slug: "hp-probook-635-aero-g8-5650u-notebook-33-8-cm-full-hd-amd-ryzen-5-pro-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-640-g8-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver.md": {
	id: "hp-probook-640-g8-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver.md";
  slug: "hp-probook-640-g8-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-640-g8-laptop-14-inch.md": {
	id: "hp-probook-640-g8-laptop-14-inch.md";
  slug: "hp-probook-640-g8-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-650-g8-i5-1135g7-8gb-256gb-ssd-15-6-fhd-w10p-wlan-bt-cam-fpr-hdmi.md": {
	id: "hp-probook-650-g8-i5-1135g7-8gb-256gb-ssd-15-6-fhd-w10p-wlan-bt-cam-fpr-hdmi.md";
  slug: "hp-probook-650-g8-i5-1135g7-8gb-256gb-ssd-15-6-fhd-w10p-wlan-bt-cam-fpr-hdmi";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-650-g8-notebook-pc-wolf-pro-security-edition.md": {
	id: "hp-probook-650-g8-notebook-pc-wolf-pro-security-edition.md";
  slug: "hp-probook-650-g8-notebook-pc-wolf-pro-security-edition";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-x360-435-g8-5600u-hybride-33-8-cm-touchscreen-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zilver.md": {
	id: "hp-probook-x360-435-g8-5600u-hybride-33-8-cm-touchscreen-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zilver.md";
  slug: "hp-probook-x360-435-g8-5600u-hybride-33-8-cm-touchscreen-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-probook-zakelijke-laptop-450-g9-15-6-fhd-400-nits-i5-1235u-16gb-512gb-w11p-keyboard-verlichting-2jaar-nbd-garantie.md": {
	id: "hp-probook-zakelijke-laptop-450-g9-15-6-fhd-400-nits-i5-1235u-16gb-512gb-w11p-keyboard-verlichting-2jaar-nbd-garantie.md";
  slug: "hp-probook-zakelijke-laptop-450-g9-15-6-fhd-400-nits-i5-1235u-16gb-512gb-w11p-keyboard-verlichting-2jaar-nbd-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-14-ef2130nd-135-inch-intel-core-i7-16-gb-512-gb-iris-xe-graphics-1753608.md": {
	id: "hp-spectre-14-ef2130nd-135-inch-intel-core-i7-16-gb-512-gb-iris-xe-graphics-1753608.md";
  slug: "hp-spectre-14-ef2130nd-135-inch-intel-core-i7-16-gb-512-gb-iris-xe-graphics-1753608";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-16-f2120nd-160-inch-intel-core-i7-16gb-1tb-intel-iris-xe-graphics-1753610.md": {
	id: "hp-spectre-16-f2120nd-160-inch-intel-core-i7-16gb-1tb-intel-iris-xe-graphics-1753610.md";
  slug: "hp-spectre-16-f2120nd-160-inch-intel-core-i7-16gb-1tb-intel-iris-xe-graphics-1753610";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-16-f2180nd-16-inch-intel-core-i7-32-gb-1-tb-intel-arc-a370m-1753611.md": {
	id: "hp-spectre-16-f2180nd-16-inch-intel-core-i7-32-gb-1-tb-intel-arc-a370m-1753611.md";
  slug: "hp-spectre-16-f2180nd-16-inch-intel-core-i7-32-gb-1-tb-intel-arc-a370m-1753611";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-x360-14-ea1787nd-2-in-1-laptop-13-5-inch.md": {
	id: "hp-spectre-x360-14-ea1787nd-2-in-1-laptop-13-5-inch.md";
  slug: "hp-spectre-x360-14-ea1787nd-2-in-1-laptop-13-5-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-x360-14-ef0355nd-2-in-1-laptop-13-5-inch.md": {
	id: "hp-spectre-x360-14-ef0355nd-2-in-1-laptop-13-5-inch.md";
  slug: "hp-spectre-x360-14-ef0355nd-2-in-1-laptop-13-5-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-x360-14-ef0450nd-2-in-1-laptop-13-5-inch.md": {
	id: "hp-spectre-x360-14-ef0450nd-2-in-1-laptop-13-5-inch.md";
  slug: "hp-spectre-x360-14-ef0450nd-2-in-1-laptop-13-5-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-x360-14-ef2100nd-13-fhd-touch-i5-1335u-16gb-512gb-w11.md": {
	id: "hp-spectre-x360-14-ef2100nd-13-fhd-touch-i5-1335u-16gb-512gb-w11.md";
  slug: "hp-spectre-x360-14-ef2100nd-13-fhd-touch-i5-1335u-16gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-x360-14-ef2700nd-2-in-1-laptop-13-5-inch.md": {
	id: "hp-spectre-x360-14-ef2700nd-2-in-1-laptop-13-5-inch.md";
  slug: "hp-spectre-x360-14-ef2700nd-2-in-1-laptop-13-5-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-x360-14-ef2770nd-2-in-1-laptop-13-5-inch.md": {
	id: "hp-spectre-x360-14-ef2770nd-2-in-1-laptop-13-5-inch.md";
  slug: "hp-spectre-x360-14-ef2770nd-2-in-1-laptop-13-5-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-x360-14-ef2950nd.md": {
	id: "hp-spectre-x360-14-ef2950nd.md";
  slug: "hp-spectre-x360-14-ef2950nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-x360-16-f1775nd-2-in-1-laptop-16-inch.md": {
	id: "hp-spectre-x360-16-f1775nd-2-in-1-laptop-16-inch.md";
  slug: "hp-spectre-x360-16-f1775nd-2-in-1-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-x360-16-f1970nd.md": {
	id: "hp-spectre-x360-16-f1970nd.md";
  slug: "hp-spectre-x360-16-f1970nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-x360-16-f1975nd-i7-1260p-hybride-40-6-cm-touchscreen-3k-intel-core-i7-16-gb-ddr4-sdram-1000-gb-ssd-intel-arc-a370m-wi-fi-6e-windows-11-home-zwart.md": {
	id: "hp-spectre-x360-16-f1975nd-i7-1260p-hybride-40-6-cm-touchscreen-3k-intel-core-i7-16-gb-ddr4-sdram-1000-gb-ssd-intel-arc-a370m-wi-fi-6e-windows-11-home-zwart.md";
  slug: "hp-spectre-x360-16-f1975nd-i7-1260p-hybride-40-6-cm-touchscreen-3k-intel-core-i7-16-gb-ddr4-sdram-1000-gb-ssd-intel-arc-a370m-wi-fi-6e-windows-11-home-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-x360-16-f2180nd-40-6-cm-touchscreen-uhd-intel-core-i7-32-gb-ddr4-sdram-1000-gb-ssd-intel-arc-a370m.md": {
	id: "hp-spectre-x360-16-f2180nd-40-6-cm-touchscreen-uhd-intel-core-i7-32-gb-ddr4-sdram-1000-gb-ssd-intel-arc-a370m.md";
  slug: "hp-spectre-x360-16-f2180nd-40-6-cm-touchscreen-uhd-intel-core-i7-32-gb-ddr4-sdram-1000-gb-ssd-intel-arc-a370m";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-x360-16-f2770nd-2-in-1-laptop-16-inch.md": {
	id: "hp-spectre-x360-16-f2770nd-2-in-1-laptop-16-inch.md";
  slug: "hp-spectre-x360-16-f2770nd-2-in-1-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-x360-16-f2790nd-2-in-1-laptop-16-inch.md": {
	id: "hp-spectre-x360-16-f2790nd-2-in-1-laptop-16-inch.md";
  slug: "hp-spectre-x360-16-f2790nd-2-in-1-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-x360-16-f2970nd.md": {
	id: "hp-spectre-x360-16-f2970nd.md";
  slug: "hp-spectre-x360-16-f2970nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-x360-16-f2975nd.md": {
	id: "hp-spectre-x360-16-f2975nd.md";
  slug: "hp-spectre-x360-16-f2975nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-x360-2-in-1-laptop-16-f2120nd-40-6-cm-touchscreen-3k-intel-core-i7-16-gb-ddr4-sdram-1000-gb-ssd.md": {
	id: "hp-spectre-x360-2-in-1-laptop-16-f2120nd-40-6-cm-touchscreen-3k-intel-core-i7-16-gb-ddr4-sdram-1000-gb-ssd.md";
  slug: "hp-spectre-x360-2-in-1-laptop-16-f2120nd-40-6-cm-touchscreen-3k-intel-core-i7-16-gb-ddr4-sdram-1000-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-x360-convertible-14-ea1747nd-2-in-1-laptop-13-5-inch.md": {
	id: "hp-spectre-x360-convertible-14-ea1747nd-2-in-1-laptop-13-5-inch.md";
  slug: "hp-spectre-x360-convertible-14-ea1747nd-2-in-1-laptop-13-5-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-spectre-x360-oled-16-f2995nd.md": {
	id: "hp-spectre-x360-oled-16-f2995nd.md";
  slug: "hp-spectre-x360-oled-16-f2995nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-victus-15-fa0910nd.md": {
	id: "hp-victus-15-fa0910nd.md";
  slug: "hp-victus-15-fa0910nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-victus-15-fa0977nd.md": {
	id: "hp-victus-15-fa0977nd.md";
  slug: "hp-victus-15-fa0977nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-victus-15-fa1910nd.md": {
	id: "hp-victus-15-fa1910nd.md";
  slug: "hp-victus-15-fa1910nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-victus-15-fa1925nd.md": {
	id: "hp-victus-15-fa1925nd.md";
  slug: "hp-victus-15-fa1925nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-victus-16-r0970nd.md": {
	id: "hp-victus-16-r0970nd.md";
  slug: "hp-victus-16-r0970nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-victus-16-r0972nd.md": {
	id: "hp-victus-16-r0972nd.md";
  slug: "hp-victus-16-r0972nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-victus-16-r0976nd.md": {
	id: "hp-victus-16-r0976nd.md";
  slug: "hp-victus-16-r0976nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-victus-16-s0950nd.md": {
	id: "hp-victus-16-s0950nd.md";
  slug: "hp-victus-16-s0950nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-victus-16-s0976nd.md": {
	id: "hp-victus-16-s0976nd.md";
  slug: "hp-victus-16-s0976nd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-15-g5-studio-15-6-full-hd-intel-core-i7-8850h-32gb-ram-512gb-ssd-win-10-pro-nvidia-p1000.md": {
	id: "hp-zbook-15-g5-studio-15-6-full-hd-intel-core-i7-8850h-32gb-ram-512gb-ssd-win-10-pro-nvidia-p1000.md";
  slug: "hp-zbook-15-g5-studio-15-6-full-hd-intel-core-i7-8850h-32gb-ram-512gb-ssd-win-10-pro-nvidia-p1000";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-firefly-14-g10-i7-1355u-16gb-512gb-rtx-a500.md": {
	id: "hp-zbook-firefly-14-g10-i7-1355u-16gb-512gb-rtx-a500.md";
  slug: "hp-zbook-firefly-14-g10-i7-1355u-16gb-512gb-rtx-a500";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-firefly-14-g8-i7-1165g7-mobiel-werkstation-35-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-quadro-t500-wi-fi-6-windows-10-pro-grijs.md": {
	id: "hp-zbook-firefly-14-g8-i7-1165g7-mobiel-werkstation-35-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-quadro-t500-wi-fi-6-windows-10-pro-grijs.md";
  slug: "hp-zbook-firefly-14-g8-i7-1165g7-mobiel-werkstation-35-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-quadro-t500-wi-fi-6-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-firefly-14-inch-g9.md": {
	id: "hp-zbook-firefly-14-inch-g9.md";
  slug: "hp-zbook-firefly-14-inch-g9";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-firefly-15-g8-i5-1145g7-16gb-256gb-ssd.md": {
	id: "hp-zbook-firefly-15-g8-i5-1145g7-16gb-256gb-ssd.md";
  slug: "hp-zbook-firefly-15-g8-i5-1145g7-16gb-256gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-firefly-16-g10-865x0ea.md": {
	id: "hp-zbook-firefly-16-g10-865x0ea.md";
  slug: "hp-zbook-firefly-16-g10-865x0ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-firefly-16-g10-i7-1355u-16gb-512gb-rtx-a500.md": {
	id: "hp-zbook-firefly-16-g10-i7-1355u-16gb-512gb-rtx-a500.md";
  slug: "hp-zbook-firefly-16-g10-i7-1355u-16gb-512gb-rtx-a500";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-firefly-16-g9-6b8d7ea.md": {
	id: "hp-zbook-firefly-16-g9-6b8d7ea.md";
  slug: "hp-zbook-firefly-16-g9-6b8d7ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-firefly-16-g9-i7-1255u-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-quadro-t500-wi-fi-6e-windows-10-pro-zilver.md": {
	id: "hp-zbook-firefly-16-g9-i7-1255u-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-quadro-t500-wi-fi-6e-windows-10-pro-zilver.md";
  slug: "hp-zbook-firefly-16-g9-i7-1255u-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-quadro-t500-wi-fi-6e-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-firefly-16-g9-i7-1255u-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-32-gb-ddr5-sdram-1000-gb-ssd-nvidia-quadro-t500-wi-fi-6e-windows-10-pro-zilver.md": {
	id: "hp-zbook-firefly-16-g9-i7-1255u-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-32-gb-ddr5-sdram-1000-gb-ssd-nvidia-quadro-t500-wi-fi-6e-windows-10-pro-zilver.md";
  slug: "hp-zbook-firefly-16-g9-i7-1255u-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-32-gb-ddr5-sdram-1000-gb-ssd-nvidia-quadro-t500-wi-fi-6e-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-fury-16-g10-62w45ea.md": {
	id: "hp-zbook-fury-16-g10-62w45ea.md";
  slug: "hp-zbook-fury-16-g10-62w45ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-fury-16-g10-62w46ea.md": {
	id: "hp-zbook-fury-16-g10-62w46ea.md";
  slug: "hp-zbook-fury-16-g10-62w46ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-fury-16-g10-62w47ea.md": {
	id: "hp-zbook-fury-16-g10-62w47ea.md";
  slug: "hp-zbook-fury-16-g10-62w47ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-fury-16-g10-62w50ea.md": {
	id: "hp-zbook-fury-16-g10-62w50ea.md";
  slug: "hp-zbook-fury-16-g10-62w50ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-fury-16-g10-62w52ea.md": {
	id: "hp-zbook-fury-16-g10-62w52ea.md";
  slug: "hp-zbook-fury-16-g10-62w52ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-fury-16-g10-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-i7-13700hx-16-gb-ddr5-sdram-512-gb-ssd-nvidia-rtx-a1000-wi-fi-6e-windows-11-pro-zilver.md": {
	id: "hp-zbook-fury-16-g10-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-i7-13700hx-16-gb-ddr5-sdram-512-gb-ssd-nvidia-rtx-a1000-wi-fi-6e-windows-11-pro-zilver.md";
  slug: "hp-zbook-fury-16-g10-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-i7-13700hx-16-gb-ddr5-sdram-512-gb-ssd-nvidia-rtx-a1000-wi-fi-6e-windows-11-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-fury-16-g10-wuxga-display-i7-13700hx-32gb-1-tb-ssd-nvidia-rtx-4000-ada.md": {
	id: "hp-zbook-fury-16-g10-wuxga-display-i7-13700hx-32gb-1-tb-ssd-nvidia-rtx-4000-ada.md";
  slug: "hp-zbook-fury-16-g10-wuxga-display-i7-13700hx-32gb-1-tb-ssd-nvidia-rtx-4000-ada";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-fury-16-g9-i7-12800hx-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-rtx-a2000-wi-fi-6-windows-10-pro-grijs.md": {
	id: "hp-zbook-fury-16-g9-i7-12800hx-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-rtx-a2000-wi-fi-6-windows-10-pro-grijs.md";
  slug: "hp-zbook-fury-16-g9-i7-12800hx-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-rtx-a2000-wi-fi-6-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-fury-16-g9-i7-12850hx-32gb-1tb-nvme-ssd-16-wuxga-400-nits-ir-camera-nvidia-rtx-a2000-8gb-w11-pro-verlicht-toetsenbord.md": {
	id: "hp-zbook-fury-16-g9-i7-12850hx-32gb-1tb-nvme-ssd-16-wuxga-400-nits-ir-camera-nvidia-rtx-a2000-8gb-w11-pro-verlicht-toetsenbord.md";
  slug: "hp-zbook-fury-16-g9-i7-12850hx-32gb-1tb-nvme-ssd-16-wuxga-400-nits-ir-camera-nvidia-rtx-a2000-8gb-w11-pro-verlicht-toetsenbord";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-fury-16-g9-i9-12950hx-4k-dreamcolor-display-32gb-2000gb-nvidia-rtx-a4500.md": {
	id: "hp-zbook-fury-16-g9-i9-12950hx-4k-dreamcolor-display-32gb-2000gb-nvidia-rtx-a4500.md";
  slug: "hp-zbook-fury-16-g9-i9-12950hx-4k-dreamcolor-display-32gb-2000gb-nvidia-rtx-a4500";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-fury-17-3-g8-i7-11850h-17-3-fhd-32gb-1tb-ssd-nvidia-rtx-a3000-6gb-wi-fi-6-windows-10-pro-grijs.md": {
	id: "hp-zbook-fury-17-3-g8-i7-11850h-17-3-fhd-32gb-1tb-ssd-nvidia-rtx-a3000-6gb-wi-fi-6-windows-10-pro-grijs.md";
  slug: "hp-zbook-fury-17-3-g8-i7-11850h-17-3-fhd-32gb-1tb-ssd-nvidia-rtx-a3000-6gb-wi-fi-6-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-power-g10-15-6-fhd-i5-13500h-16-gb-ddr5-5200-512gb-ssd-rtx-a500-4gb-gddr6.md": {
	id: "hp-zbook-power-g10-15-6-fhd-i5-13500h-16-gb-ddr5-5200-512gb-ssd-rtx-a500-4gb-gddr6.md";
  slug: "hp-zbook-power-g10-15-6-fhd-i5-13500h-16-gb-ddr5-5200-512gb-ssd-rtx-a500-4gb-gddr6";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-power-g10-866b3ea.md": {
	id: "hp-zbook-power-g10-866b3ea.md";
  slug: "hp-zbook-power-g10-866b3ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-power-g10-866b4ea.md": {
	id: "hp-zbook-power-g10-866b4ea.md";
  slug: "hp-zbook-power-g10-866b4ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-power-g9-5g367es-abh-qwerty.md": {
	id: "hp-zbook-power-g9-5g367es-abh-qwerty.md";
  slug: "hp-zbook-power-g9-5g367es-abh-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-power-g9-5g368es-abh-qwerty.md": {
	id: "hp-zbook-power-g9-5g368es-abh-qwerty.md";
  slug: "hp-zbook-power-g9-5g368es-abh-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-power-g9-i5-12500h-32gb-512ssd-15-6inch.md": {
	id: "hp-zbook-power-g9-i5-12500h-32gb-512ssd-15-6inch.md";
  slug: "hp-zbook-power-g9-i5-12500h-32gb-512ssd-15-6inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-power-g9-i7-12700h-notebook-39-6-cm-full-hd-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-t600-wi-fi-6e-windows-10-pro-grijs.md": {
	id: "hp-zbook-power-g9-i7-12700h-notebook-39-6-cm-full-hd-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-t600-wi-fi-6e-windows-10-pro-grijs.md";
  slug: "hp-zbook-power-g9-i7-12700h-notebook-39-6-cm-full-hd-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-t600-wi-fi-6e-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-power-g9-mobile-workstation-i7-12700h-notebook-full-hd-32gb-1000gb-ssd-nvidia-rtx-a2000-8gb-wi-fi-6e-windows-11-pro-grijs.md": {
	id: "hp-zbook-power-g9-mobile-workstation-i7-12700h-notebook-full-hd-32gb-1000gb-ssd-nvidia-rtx-a2000-8gb-wi-fi-6e-windows-11-pro-grijs.md";
  slug: "hp-zbook-power-g9-mobile-workstation-i7-12700h-notebook-full-hd-32gb-1000gb-ssd-nvidia-rtx-a2000-8gb-wi-fi-6e-windows-11-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-studio-15-6-g8-i7-11800h-mobiel-werkstation-39-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-t1200-wi-fi-6-windows-10-pro-grijs.md": {
	id: "hp-zbook-studio-15-6-g8-i7-11800h-mobiel-werkstation-39-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-t1200-wi-fi-6-windows-10-pro-grijs.md";
  slug: "hp-zbook-studio-15-6-g8-i7-11800h-mobiel-werkstation-39-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-nvidia-t1200-wi-fi-6-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-studio-16-g9-i7-12800h-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-32-gb-ddr5-sdram-1000-gb-ssd-nvidia-geforce-rtx-3080-ti-wi-fi-6e-windows-10-pro-zilver.md": {
	id: "hp-zbook-studio-16-g9-i7-12800h-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-32-gb-ddr5-sdram-1000-gb-ssd-nvidia-geforce-rtx-3080-ti-wi-fi-6e-windows-10-pro-zilver.md";
  slug: "hp-zbook-studio-16-g9-i7-12800h-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-32-gb-ddr5-sdram-1000-gb-ssd-nvidia-geforce-rtx-3080-ti-wi-fi-6e-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-studio-16-g9-i7-12800h-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-32-gb-ddr5-sdram-1000-gb-ssd-nvidia-rtx-a4500-wi-fi-6e-windows-10-pro-zilver.md": {
	id: "hp-zbook-studio-16-g9-i7-12800h-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-32-gb-ddr5-sdram-1000-gb-ssd-nvidia-rtx-a4500-wi-fi-6e-windows-10-pro-zilver.md";
  slug: "hp-zbook-studio-16-g9-i7-12800h-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-32-gb-ddr5-sdram-1000-gb-ssd-nvidia-rtx-a4500-wi-fi-6e-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-studio-16-g9-i9-12900h-mobiel-werkstation-40-6-cm-wqxga-intel-core-i9-32-gb-ddr5-sdram-2000-gb-ssd-nvidia-rtx-a5500-wi-fi-6e-windows-10-pro-zilver.md": {
	id: "hp-zbook-studio-16-g9-i9-12900h-mobiel-werkstation-40-6-cm-wqxga-intel-core-i9-32-gb-ddr5-sdram-2000-gb-ssd-nvidia-rtx-a5500-wi-fi-6e-windows-10-pro-zilver.md";
  slug: "hp-zbook-studio-16-g9-i9-12900h-mobiel-werkstation-40-6-cm-wqxga-intel-core-i9-32-gb-ddr5-sdram-2000-gb-ssd-nvidia-rtx-a5500-wi-fi-6e-windows-10-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-studio-g10-62w39ea.md": {
	id: "hp-zbook-studio-g10-62w39ea.md";
  slug: "hp-zbook-studio-g10-62w39ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-studio-g10-62w42ea.md": {
	id: "hp-zbook-studio-g10-62w42ea.md";
  slug: "hp-zbook-studio-g10-62w42ea";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-studio-g9-i7-12700h-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-rtx-a1000-wi-fi-6e-windows-10-pro-grijs.md": {
	id: "hp-zbook-studio-g9-i7-12700h-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-rtx-a1000-wi-fi-6e-windows-10-pro-grijs.md";
  slug: "hp-zbook-studio-g9-i7-12700h-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-rtx-a1000-wi-fi-6e-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-studio-g9-i7-12700h-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-rtx-a2000-wi-fi-6e-windows-10-pro-grijs.md": {
	id: "hp-zbook-studio-g9-i7-12700h-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-rtx-a2000-wi-fi-6e-windows-10-pro-grijs.md";
  slug: "hp-zbook-studio-g9-i7-12700h-mobiel-werkstation-40-6-cm-wuxga-intel-core-i7-16-gb-ddr5-sdram-512-gb-ssd-nvidia-rtx-a2000-wi-fi-6e-windows-10-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"hp-zbook-studio-g9-mobiele-workstation-16-ips-1920x1200-core-i7-12800h-32gb-1tb-ssd-rtx-a3000-12gb-windows-10-pro-windows-11-pro.md": {
	id: "hp-zbook-studio-g9-mobiele-workstation-16-ips-1920x1200-core-i7-12800h-32gb-1tb-ssd-rtx-a3000-12gb-windows-10-pro-windows-11-pro.md";
  slug: "hp-zbook-studio-g9-mobiele-workstation-16-ips-1920x1200-core-i7-12800h-32gb-1tb-ssd-rtx-a3000-12gb-windows-10-pro-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"ideapad-gaming-3-15iah7-82s9016wmh-gaming-laptop-15-6-inch-120-hz.md": {
	id: "ideapad-gaming-3-15iah7-82s9016wmh-gaming-laptop-15-6-inch-120-hz.md";
  slug: "ideapad-gaming-3-15iah7-82s9016wmh-gaming-laptop-15-6-inch-120-hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i5-1035g1-4gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-tn-intel-uhd-graphics-wlan-webcam-windows-10-home-64-bit.md": {
	id: "intel-core-i5-1035g1-4gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-tn-intel-uhd-graphics-wlan-webcam-windows-10-home-64-bit.md";
  slug: "intel-core-i5-1035g1-4gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-tn-intel-uhd-graphics-wlan-webcam-windows-10-home-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i5-1135g7-16gb-lpddr4x-sdram-512gb-ssd-35-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-wlan-webcam-windows-11-pro-64-bit.md": {
	id: "intel-core-i5-1135g7-16gb-lpddr4x-sdram-512gb-ssd-35-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-wlan-webcam-windows-11-pro-64-bit.md";
  slug: "intel-core-i5-1135g7-16gb-lpddr4x-sdram-512gb-ssd-35-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-wlan-webcam-windows-11-pro-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i5-1135g7-8gb-ddr4-sdram-256gb-ssd-35-6-cm-full-hd-1920-x-1080-wva-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md": {
	id: "intel-core-i5-1135g7-8gb-ddr4-sdram-256gb-ssd-35-6-cm-full-hd-1920-x-1080-wva-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md";
  slug: "intel-core-i5-1135g7-8gb-ddr4-sdram-256gb-ssd-35-6-cm-full-hd-1920-x-1080-wva-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i5-1135g7-8gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md": {
	id: "intel-core-i5-1135g7-8gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md";
  slug: "intel-core-i5-1135g7-8gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i5-1135g7-8mb-cache-8gb-ddr4-sdram-256gb-ssd-35-6-cm-14-full-hd-1920-x-1080-wva-intel-iris-xe-graphics-lan-wlan-webcam-windows-10-pro-64-bit.md": {
	id: "intel-core-i5-1135g7-8mb-cache-8gb-ddr4-sdram-256gb-ssd-35-6-cm-14-full-hd-1920-x-1080-wva-intel-iris-xe-graphics-lan-wlan-webcam-windows-10-pro-64-bit.md";
  slug: "intel-core-i5-1135g7-8mb-cache-8gb-ddr4-sdram-256gb-ssd-35-6-cm-14-full-hd-1920-x-1080-wva-intel-iris-xe-graphics-lan-wlan-webcam-windows-10-pro-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i5-1155g7-8gb-lpddr4x-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-wlan-webcam-windows-11-home.md": {
	id: "intel-core-i5-1155g7-8gb-lpddr4x-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-wlan-webcam-windows-11-home.md";
  slug: "intel-core-i5-1155g7-8gb-lpddr4x-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-wlan-webcam-windows-11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i5-1235u-8gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-education-64-bit.md": {
	id: "intel-core-i5-1235u-8gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-education-64-bit.md";
  slug: "intel-core-i5-1235u-8gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-education-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i5-1335u-16gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md": {
	id: "intel-core-i5-1335u-16gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md";
  slug: "intel-core-i5-1335u-16gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i5-1335u-16gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-wlan-webcam-windows-11-pro-64-bit.md": {
	id: "intel-core-i5-1335u-16gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-wlan-webcam-windows-11-pro-64-bit.md";
  slug: "intel-core-i5-1335u-16gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-wlan-webcam-windows-11-pro-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i5-1335u-16gb-ddr4-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md": {
	id: "intel-core-i5-1335u-16gb-ddr4-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md";
  slug: "intel-core-i5-1335u-16gb-ddr4-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i5-1335u-8gb-ddr4-sdram-256gb-ssd-35-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro.md": {
	id: "intel-core-i5-1335u-8gb-ddr4-sdram-256gb-ssd-35-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro.md";
  slug: "intel-core-i5-1335u-8gb-ddr4-sdram-256gb-ssd-35-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i5-1335u-8gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit-2.md": {
	id: "intel-core-i5-1335u-8gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit-2.md";
  slug: "intel-core-i5-1335u-8gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i5-1335u-8gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md": {
	id: "intel-core-i5-1335u-8gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md";
  slug: "intel-core-i5-1335u-8gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i5-1345u-16gb-ddr4-sdram-256gb-ssd-38-1-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md": {
	id: "intel-core-i5-1345u-16gb-ddr4-sdram-256gb-ssd-38-1-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md";
  slug: "intel-core-i5-1345u-16gb-ddr4-sdram-256gb-ssd-38-1-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i5-1345u-16gb-ddr4-sdram-512gb-ssd-38-1-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md": {
	id: "intel-core-i5-1345u-16gb-ddr4-sdram-512gb-ssd-38-1-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md";
  slug: "intel-core-i5-1345u-16gb-ddr4-sdram-512gb-ssd-38-1-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i5-1345u-8gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md": {
	id: "intel-core-i5-1345u-8gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md";
  slug: "intel-core-i5-1345u-8gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i7-12650h-15-6-fhd-ips-comfyview-32gb-ddr4-sdram-512gb-pcie-nvme-ssd-intel-uhd-graphics-wi-fi-6e-ax-windows-11-home-backlit-us-int-keyboard.md": {
	id: "intel-core-i7-12650h-15-6-fhd-ips-comfyview-32gb-ddr4-sdram-512gb-pcie-nvme-ssd-intel-uhd-graphics-wi-fi-6e-ax-windows-11-home-backlit-us-int-keyboard.md";
  slug: "intel-core-i7-12650h-15-6-fhd-ips-comfyview-32gb-ddr4-sdram-512gb-pcie-nvme-ssd-intel-uhd-graphics-wi-fi-6e-ax-windows-11-home-backlit-us-int-keyboard";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i7-1355u-14-wuxga-ips-16gb-ddr4-sdram-512gb-pcie-nvme-ssd-intel-iris-xe-graphics-wi-fi-6e-ax-bluetooth-5-2-windows-11-pro-backlit-us-int-keyboard.md": {
	id: "intel-core-i7-1355u-14-wuxga-ips-16gb-ddr4-sdram-512gb-pcie-nvme-ssd-intel-iris-xe-graphics-wi-fi-6e-ax-bluetooth-5-2-windows-11-pro-backlit-us-int-keyboard.md";
  slug: "intel-core-i7-1355u-14-wuxga-ips-16gb-ddr4-sdram-512gb-pcie-nvme-ssd-intel-iris-xe-graphics-wi-fi-6e-ax-bluetooth-5-2-windows-11-pro-backlit-us-int-keyboard";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i7-1355u-16gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro.md": {
	id: "intel-core-i7-1355u-16gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro.md";
  slug: "intel-core-i7-1355u-16gb-ddr4-sdram-256gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i7-1360p-32gb-lpddr5-sdram-2000gb-ssd-40-6-cm-quad-hd-2560-x-1600-touch-intel-iris-xe-graphics-nvidia-geforce-rtx-4050-wlan-webcam-windows-11-pro.md": {
	id: "intel-core-i7-1360p-32gb-lpddr5-sdram-2000gb-ssd-40-6-cm-quad-hd-2560-x-1600-touch-intel-iris-xe-graphics-nvidia-geforce-rtx-4050-wlan-webcam-windows-11-pro.md";
  slug: "intel-core-i7-1360p-32gb-lpddr5-sdram-2000gb-ssd-40-6-cm-quad-hd-2560-x-1600-touch-intel-iris-xe-graphics-nvidia-geforce-rtx-4050-wlan-webcam-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"intel-core-i7-1365u-16gb-ddr4-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md": {
	id: "intel-core-i7-1365u-16gb-ddr4-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit.md";
  slug: "intel-core-i7-1365u-16gb-ddr4-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-lan-wlan-webcam-windows-11-pro-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"laptop-17-cp0950nd-windows-11-home-17-3-amd-ryzen-5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md": {
	id: "laptop-17-cp0950nd-windows-11-home-17-3-amd-ryzen-5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md";
  slug: "laptop-17-cp0950nd-windows-11-home-17-3-amd-ryzen-5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"laptop-17-cp2056nd-windows-11-home-17-3-amd-ryzen-5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md": {
	id: "laptop-17-cp2056nd-windows-11-home-17-3-amd-ryzen-5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md";
  slug: "laptop-17-cp2056nd-windows-11-home-17-3-amd-ryzen-5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"laptop-17-cp3670nd-windows-11-home-17-3-amd-ryzen-7-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md": {
	id: "laptop-17-cp3670nd-windows-11-home-17-3-amd-ryzen-7-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md";
  slug: "laptop-17-cp3670nd-windows-11-home-17-3-amd-ryzen-7-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"latitude-3520-i5-1135g7-8gb-256gb-ssd-15-6i-fhd-intel-iris-xe-fgrpr-4-cell-psu-backlit-kb-w10pro-w11pro-licence-1y-basic-onsite-qwerty.md": {
	id: "latitude-3520-i5-1135g7-8gb-256gb-ssd-15-6i-fhd-intel-iris-xe-fgrpr-4-cell-psu-backlit-kb-w10pro-w11pro-licence-1y-basic-onsite-qwerty.md";
  slug: "latitude-3520-i5-1135g7-8gb-256gb-ssd-15-6i-fhd-intel-iris-xe-fgrpr-4-cell-psu-backlit-kb-w10pro-w11pro-licence-1y-basic-onsite-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-3-15ad-15-6-f-hd-ryzen-3-3250u-8gb-256gb-w11h.md": {
	id: "lenovo-3-15ad-15-6-f-hd-ryzen-3-3250u-8gb-256gb-w11h.md";
  slug: "lenovo-3-15ad-15-6-f-hd-ryzen-3-3250u-8gb-256gb-w11h";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-amd-ryzen-3-5300u-8gb-ddr4-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-amd-radeon-graphics-wlan-webcam-windows-11-home-64-bit.md": {
	id: "lenovo-amd-ryzen-3-5300u-8gb-ddr4-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-amd-radeon-graphics-wlan-webcam-windows-11-home-64-bit.md";
  slug: "lenovo-amd-ryzen-3-5300u-8gb-ddr4-sdram-512gb-ssd-39-6-cm-full-hd-1920-x-1080-ips-amd-radeon-graphics-wlan-webcam-windows-11-home-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideap-3-17-3-hd-i5-1135g7-8gb-512gb-w11p.md": {
	id: "lenovo-ideap-3-17-3-hd-i5-1135g7-8gb-512gb-w11p.md";
  slug: "lenovo-ideap-3-17-3-hd-i5-1135g7-8gb-512gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-1-14amn7-82vf003ymh.md": {
	id: "lenovo-ideapad-1-14amn7-82vf003ymh.md";
  slug: "lenovo-ideapad-1-14amn7-82vf003ymh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-1-14amn7-82vf0041mh.md": {
	id: "lenovo-ideapad-1-14amn7-82vf0041mh.md";
  slug: "lenovo-ideapad-1-14amn7-82vf0041mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-1-14amn7-82vf0063mh-laptop-14-inch.md": {
	id: "lenovo-ideapad-1-14amn7-82vf0063mh-laptop-14-inch.md";
  slug: "lenovo-ideapad-1-14amn7-82vf0063mh-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-1-14amn7-laptop-14-inch.md": {
	id: "lenovo-ideapad-1-14amn7-laptop-14-inch.md";
  slug: "lenovo-ideapad-1-14amn7-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-1-14iau7-laptop-14-inch.md": {
	id: "lenovo-ideapad-1-14iau7-laptop-14-inch.md";
  slug: "lenovo-ideapad-1-14iau7-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-1-15amn7-82vg005qmh.md": {
	id: "lenovo-ideapad-1-15amn7-82vg005qmh.md";
  slug: "lenovo-ideapad-1-15amn7-82vg005qmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-1-15amn7-82vg005xmh.md": {
	id: "lenovo-ideapad-1-15amn7-82vg005xmh.md";
  slug: "lenovo-ideapad-1-15amn7-82vg005xmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-1-15igl7-82v700aumh.md": {
	id: "lenovo-ideapad-1-15igl7-82v700aumh.md";
  slug: "lenovo-ideapad-1-15igl7-82v700aumh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-14aba7-82rm006dmh.md": {
	id: "lenovo-ideapad-3-14aba7-82rm006dmh.md";
  slug: "lenovo-ideapad-3-14aba7-82rm006dmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-14aba7-82rm006fmh.md": {
	id: "lenovo-ideapad-3-14aba7-82rm006fmh.md";
  slug: "lenovo-ideapad-3-14aba7-82rm006fmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-14itl6-82h701nqmh.md": {
	id: "lenovo-ideapad-3-14itl6-82h701nqmh.md";
  slug: "lenovo-ideapad-3-14itl6-82h701nqmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-14itl6-82h701qsmh-laptop-14-inch.md": {
	id: "lenovo-ideapad-3-14itl6-82h701qsmh-laptop-14-inch.md";
  slug: "lenovo-ideapad-3-14itl6-82h701qsmh-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15-6-fullhd-laptop-ryzen-5-5500u-8gb-256gb-ssd-windows-11-pro.md": {
	id: "lenovo-ideapad-3-15-6-fullhd-laptop-ryzen-5-5500u-8gb-256gb-ssd-windows-11-pro.md";
  slug: "lenovo-ideapad-3-15-6-fullhd-laptop-ryzen-5-5500u-8gb-256gb-ssd-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15-6-fullhd-laptop-ryzen-7-5700u-8gb-512gb-ssd-windows-11-pro.md": {
	id: "lenovo-ideapad-3-15-6-fullhd-laptop-ryzen-7-5700u-8gb-512gb-ssd-windows-11-pro.md";
  slug: "lenovo-ideapad-3-15-6-fullhd-laptop-ryzen-7-5700u-8gb-512gb-ssd-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15-inch.md": {
	id: "lenovo-ideapad-3-15-inch.md";
  slug: "lenovo-ideapad-3-15-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15-ryzen-5-8gb-256gb-ssd-1723303.md": {
	id: "lenovo-ideapad-3-15-ryzen-5-8gb-256gb-ssd-1723303.md";
  slug: "lenovo-ideapad-3-15-ryzen-5-8gb-256gb-ssd-1723303";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15-ryzen5-8gb-512gb-ssd-1720375.md": {
	id: "lenovo-ideapad-3-15-ryzen5-8gb-512gb-ssd-1720375.md";
  slug: "lenovo-ideapad-3-15-ryzen5-8gb-512gb-ssd-1720375";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15aba7-15-6-f-hd-ryzen-7-5825u-8gb-512gb-windows-11-pro.md": {
	id: "lenovo-ideapad-3-15aba7-15-6-f-hd-ryzen-7-5825u-8gb-512gb-windows-11-pro.md";
  slug: "lenovo-ideapad-3-15aba7-15-6-f-hd-ryzen-7-5825u-8gb-512gb-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15aba7-82rn00f1mh.md": {
	id: "lenovo-ideapad-3-15aba7-82rn00f1mh.md";
  slug: "lenovo-ideapad-3-15aba7-82rn00f1mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15alc6-15-6-full-hd-ips-amd-radeon-graphics.md": {
	id: "lenovo-ideapad-3-15alc6-15-6-full-hd-ips-amd-radeon-graphics.md";
  slug: "lenovo-ideapad-3-15alc6-15-6-full-hd-ips-amd-radeon-graphics";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15alc6-15-inch-amd-ryzen-5-8-gb-256-gb-1794028.md": {
	id: "lenovo-ideapad-3-15alc6-15-inch-amd-ryzen-5-8-gb-256-gb-1794028.md";
  slug: "lenovo-ideapad-3-15alc6-15-inch-amd-ryzen-5-8-gb-256-gb-1794028";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15alc6-82ku00l8mh.md": {
	id: "lenovo-ideapad-3-15alc6-82ku00l8mh.md";
  slug: "lenovo-ideapad-3-15alc6-82ku00l8mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15alc6-82ku01e7mh-laptop-15-6-inch.md": {
	id: "lenovo-ideapad-3-15alc6-82ku01e7mh-laptop-15-6-inch.md";
  slug: "lenovo-ideapad-3-15alc6-82ku01e7mh-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15iau7-82rk00w5mh.md": {
	id: "lenovo-ideapad-3-15iau7-82rk00w5mh.md";
  slug: "lenovo-ideapad-3-15iau7-82rk00w5mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15iau7-laptop-15-6-inch.md": {
	id: "lenovo-ideapad-3-15iau7-laptop-15-6-inch.md";
  slug: "lenovo-ideapad-3-15iau7-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15itl6-15-6-intel-core-i5-1135g7-8gb-ddr4-256gb-ssd-intel-iris-xe-graphics-windows-11-home-64-bit.md": {
	id: "lenovo-ideapad-3-15itl6-15-6-intel-core-i5-1135g7-8gb-ddr4-256gb-ssd-intel-iris-xe-graphics-windows-11-home-64-bit.md";
  slug: "lenovo-ideapad-3-15itl6-15-6-intel-core-i5-1135g7-8gb-ddr4-256gb-ssd-intel-iris-xe-graphics-windows-11-home-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15itl6-82h8-laptop-15-6-inch-2.md": {
	id: "lenovo-ideapad-3-15itl6-82h8-laptop-15-6-inch-2.md";
  slug: "lenovo-ideapad-3-15itl6-82h8-laptop-15-6-inch-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15itl6-82h8-laptop-15-6-inch.md": {
	id: "lenovo-ideapad-3-15itl6-82h8-laptop-15-6-inch.md";
  slug: "lenovo-ideapad-3-15itl6-82h8-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15itl6-82h803pcmh.md": {
	id: "lenovo-ideapad-3-15itl6-82h803pcmh.md";
  slug: "lenovo-ideapad-3-15itl6-82h803pcmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15itl6-82h803pemh.md": {
	id: "lenovo-ideapad-3-15itl6-82h803pemh.md";
  slug: "lenovo-ideapad-3-15itl6-82h803pemh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15itl6-82h803pfmh.md": {
	id: "lenovo-ideapad-3-15itl6-82h803pfmh.md";
  slug: "lenovo-ideapad-3-15itl6-82h803pfmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-15itl6-intel-core-i5-1135g7-16gb-512gb-ssd-15-6-fhd-ips-intel-iris-xe-graphics-g7-windows-11-home-82h8027qmh.md": {
	id: "lenovo-ideapad-3-15itl6-intel-core-i5-1135g7-16gb-512gb-ssd-15-6-fhd-ips-intel-iris-xe-graphics-g7-windows-11-home-82h8027qmh.md";
  slug: "lenovo-ideapad-3-15itl6-intel-core-i5-1135g7-16gb-512gb-ssd-15-6-fhd-ips-intel-iris-xe-graphics-g7-windows-11-home-82h8027qmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17-core-i5-1135g7-8gb-512gb-ssd-1729753.md": {
	id: "lenovo-ideapad-3-17-core-i5-1135g7-8gb-512gb-ssd-1729753.md";
  slug: "lenovo-ideapad-3-17-core-i5-1135g7-8gb-512gb-ssd-1729753";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17aba7-82rq006lmh-laptop-17-3-inch.md": {
	id: "lenovo-ideapad-3-17aba7-82rq006lmh-laptop-17-3-inch.md";
  slug: "lenovo-ideapad-3-17aba7-82rq006lmh-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17alc-17-3-full-hd-ryzen-5-5500u-8gb-512gb-w11h.md": {
	id: "lenovo-ideapad-3-17alc-17-3-full-hd-ryzen-5-5500u-8gb-512gb-w11h.md";
  slug: "lenovo-ideapad-3-17alc-17-3-full-hd-ryzen-5-5500u-8gb-512gb-w11h";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17alc6-17-3-fhd-ips-ryzen-5-8gb-ddr4-128gb-ssd-1tb-hdd-w11-home.md": {
	id: "lenovo-ideapad-3-17alc6-17-3-fhd-ips-ryzen-5-8gb-ddr4-128gb-ssd-1tb-hdd-w11-home.md";
  slug: "lenovo-ideapad-3-17alc6-17-3-fhd-ips-ryzen-5-8gb-ddr4-128gb-ssd-1tb-hdd-w11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17alc6-173-inch-amd-ryzen-7-8-gb-512-gb-1768800.md": {
	id: "lenovo-ideapad-3-17alc6-173-inch-amd-ryzen-7-8-gb-512-gb-1768800.md";
  slug: "lenovo-ideapad-3-17alc6-173-inch-amd-ryzen-7-8-gb-512-gb-1768800";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17alc6-82kv00enmh.md": {
	id: "lenovo-ideapad-3-17alc6-82kv00enmh.md";
  slug: "lenovo-ideapad-3-17alc6-82kv00enmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17alc6-amd-ryzen-5-5500u.md": {
	id: "lenovo-ideapad-3-17alc6-amd-ryzen-5-5500u.md";
  slug: "lenovo-ideapad-3-17alc6-amd-ryzen-5-5500u";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17alc6-laptop-17-3-inch-2.md": {
	id: "lenovo-ideapad-3-17alc6-laptop-17-3-inch-2.md";
  slug: "lenovo-ideapad-3-17alc6-laptop-17-3-inch-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17alc6-laptop-17-3-inch-3.md": {
	id: "lenovo-ideapad-3-17alc6-laptop-17-3-inch-3.md";
  slug: "lenovo-ideapad-3-17alc6-laptop-17-3-inch-3";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17alc6-laptop-17-3-inch.md": {
	id: "lenovo-ideapad-3-17alc6-laptop-17-3-inch.md";
  slug: "lenovo-ideapad-3-17alc6-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17iau7-82rl007kmh-laptop-17-3-inch.md": {
	id: "lenovo-ideapad-3-17iau7-82rl007kmh-laptop-17-3-inch.md";
  slug: "lenovo-ideapad-3-17iau7-82rl007kmh-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17iau7-82rl0088mh.md": {
	id: "lenovo-ideapad-3-17iau7-82rl0088mh.md";
  slug: "lenovo-ideapad-3-17iau7-82rl0088mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17iau7-82rl008smh-laptop-core-i5-1235u-iris-xe-graphics-16-gb-512-gb-ssd.md": {
	id: "lenovo-ideapad-3-17iau7-82rl008smh-laptop-core-i5-1235u-iris-xe-graphics-16-gb-512-gb-ssd.md";
  slug: "lenovo-ideapad-3-17iau7-82rl008smh-laptop-core-i5-1235u-iris-xe-graphics-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17iau7-i5-1235u.md": {
	id: "lenovo-ideapad-3-17iau7-i5-1235u.md";
  slug: "lenovo-ideapad-3-17iau7-i5-1235u";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17iau7-laptop-17-3-full-hd-ips-intel-core-i5-1235u-intel-iris-xe-graphics-16-gb-ddr4-512-gb-ssd-wi-fi-6-bluetooth-5-1-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-3-17iau7-laptop-17-3-full-hd-ips-intel-core-i5-1235u-intel-iris-xe-graphics-16-gb-ddr4-512-gb-ssd-wi-fi-6-bluetooth-5-1-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-3-17iau7-laptop-17-3-full-hd-ips-intel-core-i5-1235u-intel-iris-xe-graphics-16-gb-ddr4-512-gb-ssd-wi-fi-6-bluetooth-5-1-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17itl6-17-3-fhd-i5-1135g7-8gb-512gb-w11.md": {
	id: "lenovo-ideapad-3-17itl6-17-3-fhd-i5-1135g7-8gb-512gb-w11.md";
  slug: "lenovo-ideapad-3-17itl6-17-3-fhd-i5-1135g7-8gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17itl6-82h9-laptop-17-3-inch-2.md": {
	id: "lenovo-ideapad-3-17itl6-82h9-laptop-17-3-inch-2.md";
  slug: "lenovo-ideapad-3-17itl6-82h9-laptop-17-3-inch-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17itl6-intel-core-i5-1135g7-8gb-512gb-ssd-17-3-fhd-ips-intel-iris-xe-graphics-g7-windows-11-home.md": {
	id: "lenovo-ideapad-3-17itl6-intel-core-i5-1135g7-8gb-512gb-ssd-17-3-fhd-ips-intel-iris-xe-graphics-g7-windows-11-home.md";
  slug: "lenovo-ideapad-3-17itl6-intel-core-i5-1135g7-8gb-512gb-ssd-17-3-fhd-ips-intel-iris-xe-graphics-g7-windows-11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-17itl6-laptop-17-3-inch.md": {
	id: "lenovo-ideapad-3-17itl6-laptop-17-3-inch.md";
  slug: "lenovo-ideapad-3-17itl6-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-3500u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-3-3500u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-3-3500u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-5500u-15-6-full-hd-amd-ryzen-5-16-gb-ddr4-512-gb-ssd-wi-fi-6-windows-11-home-blauw.md": {
	id: "lenovo-ideapad-3-5500u-15-6-full-hd-amd-ryzen-5-16-gb-ddr4-512-gb-ssd-wi-fi-6-windows-11-home-blauw.md";
  slug: "lenovo-ideapad-3-5500u-15-6-full-hd-amd-ryzen-5-16-gb-ddr4-512-gb-ssd-wi-fi-6-windows-11-home-blauw";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-5500u-notebook-39-6-cm-full-hd-amd-ryzen-5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-3-5500u-notebook-39-6-cm-full-hd-amd-ryzen-5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-3-5500u-notebook-39-6-cm-full-hd-amd-ryzen-5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-5500u-notebook-43-9-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs-2.md": {
	id: "lenovo-ideapad-3-5500u-notebook-43-9-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs-2.md";
  slug: "lenovo-ideapad-3-5500u-notebook-43-9-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-5500u-notebook-43-9-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-3-5500u-notebook-43-9-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-3-5500u-notebook-43-9-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-5700u-notebook-39-6-cm-full-hd-amd-ryzen-7-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-10-home-grijs.md": {
	id: "lenovo-ideapad-3-5700u-notebook-39-6-cm-full-hd-amd-ryzen-7-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-10-home-grijs.md";
  slug: "lenovo-ideapad-3-5700u-notebook-39-6-cm-full-hd-amd-ryzen-7-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-10-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-5700u-notebook-43-9-cm-full-hd-amd-ryzen-7-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-3-5700u-notebook-43-9-cm-full-hd-amd-ryzen-7-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-3-5700u-notebook-43-9-cm-full-hd-amd-ryzen-7-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-81w101cjmh-15-6-inch-256gb-ryzen-3-windows-home-s.md": {
	id: "lenovo-ideapad-3-81w101cjmh-15-6-inch-256gb-ryzen-3-windows-home-s.md";
  slug: "lenovo-ideapad-3-81w101cjmh-15-6-inch-256gb-ryzen-3-windows-home-s";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-82kt00a2mh-qwerty.md": {
	id: "lenovo-ideapad-3-82kt00a2mh-qwerty.md";
  slug: "lenovo-ideapad-3-82kt00a2mh-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-82ku01ljmh.md": {
	id: "lenovo-ideapad-3-82ku01ljmh.md";
  slug: "lenovo-ideapad-3-82ku01ljmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-amd-ryzen-5-2-1-ghz-39-6-cm-1920-x-1080-pixels-8-gb-256-gb.md": {
	id: "lenovo-ideapad-3-amd-ryzen-5-2-1-ghz-39-6-cm-1920-x-1080-pixels-8-gb-256-gb.md";
  slug: "lenovo-ideapad-3-amd-ryzen-5-2-1-ghz-39-6-cm-1920-x-1080-pixels-8-gb-256-gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-i5-1035g1-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-mx330-wi-fi-5-windows-10-home-grijs.md": {
	id: "lenovo-ideapad-3-i5-1035g1-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-mx330-wi-fi-5-windows-10-home-grijs.md";
  slug: "lenovo-ideapad-3-i5-1035g1-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-mx330-wi-fi-5-windows-10-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-i5-1135g7-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-3-i5-1135g7-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-3-i5-1135g7-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-i5-1135g7-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-3-i5-1135g7-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-3-i5-1135g7-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-i5-1135g7-notebook-43-9-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-3-i5-1135g7-notebook-43-9-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-3-i5-1135g7-notebook-43-9-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-i5-1135g7-notebook-43-9-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-3-i5-1135g7-notebook-43-9-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-3-i5-1135g7-notebook-43-9-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-i5-1135g7-notebook-43-9-cm-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-10-home-grijs.md": {
	id: "lenovo-ideapad-3-i5-1135g7-notebook-43-9-cm-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-10-home-grijs.md";
  slug: "lenovo-ideapad-3-i5-1135g7-notebook-43-9-cm-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-10-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-i5-1155g7-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-3-i5-1155g7-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-3-i5-1155g7-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-laptop-17-3-inch.md": {
	id: "lenovo-ideapad-3-laptop-17-3-inch.md";
  slug: "lenovo-ideapad-3-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-3-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-3-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3-notebook-grijs-platina-35-6-cm-1920-x-1080-pixels-intel-10de-generatie-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-home.md": {
	id: "lenovo-ideapad-3-notebook-grijs-platina-35-6-cm-1920-x-1080-pixels-intel-10de-generatie-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-home.md";
  slug: "lenovo-ideapad-3-notebook-grijs-platina-35-6-cm-1920-x-1080-pixels-intel-10de-generatie-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-330-17-17-3-hd-i5-8250u-8gb-1tb-hdd-black.md": {
	id: "lenovo-ideapad-330-17-17-3-hd-i5-8250u-8gb-1tb-hdd-black.md";
  slug: "lenovo-ideapad-330-17-17-3-hd-i5-8250u-8gb-1tb-hdd-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-330-notebook-39-6-cm-1920-x-1080-pixels-intel-8de-generatie-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-home-zwart.md": {
	id: "lenovo-ideapad-330-notebook-39-6-cm-1920-x-1080-pixels-intel-8de-generatie-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-home-zwart.md";
  slug: "lenovo-ideapad-330-notebook-39-6-cm-1920-x-1080-pixels-intel-8de-generatie-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-home-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-3i-i5-1135g7-notebook-43-9-cm-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-home-grijs.md": {
	id: "lenovo-ideapad-3i-i5-1135g7-notebook-43-9-cm-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-home-grijs.md";
  slug: "lenovo-ideapad-3i-i5-1135g7-notebook-43-9-cm-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-10-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-14aba7-82se00aumh.md": {
	id: "lenovo-ideapad-5-14aba7-82se00aumh.md";
  slug: "lenovo-ideapad-5-14aba7-82se00aumh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-15-i7-1165g7-16gb-512gb-1719571.md": {
	id: "lenovo-ideapad-5-15-i7-1165g7-16gb-512gb-1719571.md";
  slug: "lenovo-ideapad-5-15-i7-1165g7-16gb-512gb-1719571";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-15aba7-82sg00a2mh.md": {
	id: "lenovo-ideapad-5-15aba7-82sg00a2mh.md";
  slug: "lenovo-ideapad-5-15aba7-82sg00a2mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-15are05-amd-ryzen-5-4500u-16gb-512gb-ssd-15-6-fhd-81yq00mgmh-blue.md": {
	id: "lenovo-ideapad-5-15are05-amd-ryzen-5-4500u-16gb-512gb-ssd-15-6-fhd-81yq00mgmh-blue.md";
  slug: "lenovo-ideapad-5-15are05-amd-ryzen-5-4500u-16gb-512gb-ssd-15-6-fhd-81yq00mgmh-blue";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-15ial7-laptop-15-6-inch-2.md": {
	id: "lenovo-ideapad-5-15ial7-laptop-15-6-inch-2.md";
  slug: "lenovo-ideapad-5-15ial7-laptop-15-6-inch-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-15ial7-laptop-15-6-inch.md": {
	id: "lenovo-ideapad-5-15ial7-laptop-15-6-inch.md";
  slug: "lenovo-ideapad-5-15ial7-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-5500u-notebook-39-6-cm-full-hd-amd-ryzen-5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-5-5500u-notebook-39-6-cm-full-hd-amd-ryzen-5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-5-5500u-notebook-39-6-cm-full-hd-amd-ryzen-5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-5500u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-grijs.md": {
	id: "lenovo-ideapad-5-5500u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-grijs.md";
  slug: "lenovo-ideapad-5-5500u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-5625u-notebook-35-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-5-5625u-notebook-35-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-5-5625u-notebook-35-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-82fe01ecmh-qwerty.md": {
	id: "lenovo-ideapad-5-82fe01ecmh-qwerty.md";
  slug: "lenovo-ideapad-5-82fe01ecmh-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-82fg01sjmh-qwerty.md": {
	id: "lenovo-ideapad-5-82fg01sjmh-qwerty.md";
  slug: "lenovo-ideapad-5-82fg01sjmh-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-chrome-gaming-16iau7-82v8000qmh.md": {
	id: "lenovo-ideapad-5-chrome-gaming-16iau7-82v8000qmh.md";
  slug: "lenovo-ideapad-5-chrome-gaming-16iau7-82v8000qmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-i5-1135g7-laptop.md": {
	id: "lenovo-ideapad-5-i5-1135g7-laptop.md";
  slug: "lenovo-ideapad-5-i5-1135g7-laptop";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-notebook-39-6-cm-1920-x-1080-pixels-intel-11de-generatie-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-10-home.md": {
	id: "lenovo-ideapad-5-notebook-39-6-cm-1920-x-1080-pixels-intel-11de-generatie-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-10-home.md";
  slug: "lenovo-ideapad-5-notebook-39-6-cm-1920-x-1080-pixels-intel-11de-generatie-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-10-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-14acn6-5800u-notebook-35-6-cm-2-8k-amd-ryzen-7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-5-pro-14acn6-5800u-notebook-35-6-cm-2-8k-amd-ryzen-7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-5-pro-14acn6-5800u-notebook-35-6-cm-2-8k-amd-ryzen-7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-14arh7-82sj004ymh.md": {
	id: "lenovo-ideapad-5-pro-14arh7-82sj004ymh.md";
  slug: "lenovo-ideapad-5-pro-14arh7-82sj004ymh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-14iap7-82sh0070mh.md": {
	id: "lenovo-ideapad-5-pro-14iap7-82sh0070mh.md";
  slug: "lenovo-ideapad-5-pro-14iap7-82sh0070mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-16-i5-11300h-8gb-512gb-ssd-1708331.md": {
	id: "lenovo-ideapad-5-pro-16-i5-11300h-8gb-512gb-ssd-1708331.md";
  slug: "lenovo-ideapad-5-pro-16-i5-11300h-8gb-512gb-ssd-1708331";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-16-ryzen-5-16gb-512gb-ssd-1708332.md": {
	id: "lenovo-ideapad-5-pro-16-ryzen-5-16gb-512gb-ssd-1708332.md";
  slug: "lenovo-ideapad-5-pro-16-ryzen-5-16gb-512gb-ssd-1708332";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-16ach6-82l500xumh-creator-laptop-16-inch.md": {
	id: "lenovo-ideapad-5-pro-16ach6-82l500xumh-creator-laptop-16-inch.md";
  slug: "lenovo-ideapad-5-pro-16ach6-82l500xumh-creator-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-16ach6-laptop-16-inch-wqxga-amd-ryzen-5-5600h-3-3ghz.md": {
	id: "lenovo-ideapad-5-pro-16ach6-laptop-16-inch-wqxga-amd-ryzen-5-5600h-3-3ghz.md";
  slug: "lenovo-ideapad-5-pro-16ach6-laptop-16-inch-wqxga-amd-ryzen-5-5600h-3-3ghz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-16ach6.md": {
	id: "lenovo-ideapad-5-pro-16ach6.md";
  slug: "lenovo-ideapad-5-pro-16ach6";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-16arh7-82sn00blmh.md": {
	id: "lenovo-ideapad-5-pro-16arh7-82sn00blmh.md";
  slug: "lenovo-ideapad-5-pro-16arh7-82sn00blmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-16arh7-82sn00bmmh.md": {
	id: "lenovo-ideapad-5-pro-16arh7-82sn00bmmh.md";
  slug: "lenovo-ideapad-5-pro-16arh7-82sn00bmmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-16arh7-82sn00d7mh.md": {
	id: "lenovo-ideapad-5-pro-16arh7-82sn00d7mh.md";
  slug: "lenovo-ideapad-5-pro-16arh7-82sn00d7mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-16arh7-creator-laptop-16-inch.md": {
	id: "lenovo-ideapad-5-pro-16arh7-creator-laptop-16-inch.md";
  slug: "lenovo-ideapad-5-pro-16arh7-creator-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-16iah7-82sk009bmh.md": {
	id: "lenovo-ideapad-5-pro-16iah7-82sk009bmh.md";
  slug: "lenovo-ideapad-5-pro-16iah7-82sk009bmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-16iah7-82sk00aqmh.md": {
	id: "lenovo-ideapad-5-pro-16iah7-82sk00aqmh.md";
  slug: "lenovo-ideapad-5-pro-16iah7-82sk00aqmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-5600h-notebook-40-6-cm-wqxga-amd-ryzen-5-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-5-pro-5600h-notebook-40-6-cm-wqxga-amd-ryzen-5-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-5-pro-5600h-notebook-40-6-cm-wqxga-amd-ryzen-5-16-gb-ddr4-sdram-512-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-5800h-notebook-40-6-cm-wqxga-amd-ryzen-7-16-gb-ddr4-sdram-1000-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-5-pro-5800h-notebook-40-6-cm-wqxga-amd-ryzen-7-16-gb-ddr4-sdram-1000-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-5-pro-5800h-notebook-40-6-cm-wqxga-amd-ryzen-7-16-gb-ddr4-sdram-1000-gb-ssd-nvidia-geforce-rtx-3050-wi-fi-6-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-5800h-notebook-40-6-cm-wqxga-amd-ryzen-7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-5-pro-5800h-notebook-40-6-cm-wqxga-amd-ryzen-7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-5-pro-5800h-notebook-40-6-cm-wqxga-amd-ryzen-7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-6600hs-notebook-35-6-cm-2-8k-amd-ryzen-5-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-5-pro-6600hs-notebook-35-6-cm-2-8k-amd-ryzen-5-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-5-pro-6600hs-notebook-35-6-cm-2-8k-amd-ryzen-5-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-82l300ndmh-qwerty.md": {
	id: "lenovo-ideapad-5-pro-82l300ndmh-qwerty.md";
  slug: "lenovo-ideapad-5-pro-82l300ndmh-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-82l700p9mh-qwerty.md": {
	id: "lenovo-ideapad-5-pro-82l700p9mh-qwerty.md";
  slug: "lenovo-ideapad-5-pro-82l700p9mh-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5-pro-i5-12500h-notebook-40-6-cm-2-5k-intel-core-i5-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md": {
	id: "lenovo-ideapad-5-pro-i5-12500h-notebook-40-6-cm-2-5k-intel-core-i5-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs.md";
  slug: "lenovo-ideapad-5-pro-i5-12500h-notebook-40-6-cm-2-5k-intel-core-i5-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6-windows-11-home-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-5i-notebook-14-inch-fullhd-intel-core-i7-8gb-512gb-windows-11-home-uk.md": {
	id: "lenovo-ideapad-5i-notebook-14-inch-fullhd-intel-core-i7-8gb-512gb-windows-11-home-uk.md";
  slug: "lenovo-ideapad-5i-notebook-14-inch-fullhd-intel-core-i7-8gb-512gb-windows-11-home-uk";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-flex-5-14-ryzen5-8gb-256gb-ssd-1723295.md": {
	id: "lenovo-ideapad-flex-5-14-ryzen5-8gb-256gb-ssd-1723295.md";
  slug: "lenovo-ideapad-flex-5-14-ryzen5-8gb-256gb-ssd-1723295";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-flex-5-14abr8-14-inch-amd-ryzen-7-16-gb-512-gb-1766192.md": {
	id: "lenovo-ideapad-flex-5-14abr8-14-inch-amd-ryzen-7-16-gb-512-gb-1766192.md";
  slug: "lenovo-ideapad-flex-5-14abr8-14-inch-amd-ryzen-7-16-gb-512-gb-1766192";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-flex-5-14abr8-82xx008emh.md": {
	id: "lenovo-ideapad-flex-5-14abr8-82xx008emh.md";
  slug: "lenovo-ideapad-flex-5-14abr8-82xx008emh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-flex-5-14alc7-82r900camh-5300u-2-6hz-8gb-ram-256gb-ssd-cloud-grey.md": {
	id: "lenovo-ideapad-flex-5-14alc7-82r900camh-5300u-2-6hz-8gb-ram-256gb-ssd-cloud-grey.md";
  slug: "lenovo-ideapad-flex-5-14alc7-82r900camh-5300u-2-6hz-8gb-ram-256gb-ssd-cloud-grey";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-flex-5-14iau7-82r700j1mh-2-in-1-laptop-14-inch.md": {
	id: "lenovo-ideapad-flex-5-14iau7-82r700j1mh-2-in-1-laptop-14-inch.md";
  slug: "lenovo-ideapad-flex-5-14iau7-82r700j1mh-2-in-1-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-flex-5-14iau7-82r700j2mh-2-in-1-laptop-14-inch.md": {
	id: "lenovo-ideapad-flex-5-14iau7-82r700j2mh-2-in-1-laptop-14-inch.md";
  slug: "lenovo-ideapad-flex-5-14iau7-82r700j2mh-2-in-1-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-flex-5-16abr8-82xy005vmh.md": {
	id: "lenovo-ideapad-flex-5-16abr8-82xy005vmh.md";
  slug: "lenovo-ideapad-flex-5-16abr8-82xy005vmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-flex-5-16abr8-82xy005wmh.md": {
	id: "lenovo-ideapad-flex-5-16abr8-82xy005wmh.md";
  slug: "lenovo-ideapad-flex-5-16abr8-82xy005wmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-flex-5-16alc7-2-in-1-laptop-16-inch.md": {
	id: "lenovo-ideapad-flex-5-16alc7-2-in-1-laptop-16-inch.md";
  slug: "lenovo-ideapad-flex-5-16alc7-2-in-1-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-flex-5-16alc7-82ra005tmh.md": {
	id: "lenovo-ideapad-flex-5-16alc7-82ra005tmh.md";
  slug: "lenovo-ideapad-flex-5-16alc7-82ra005tmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-flex-5-16iau7-82r800almh-2-in-1-laptop-16-inch.md": {
	id: "lenovo-ideapad-flex-5-16iau7-82r800almh-2-in-1-laptop-16-inch.md";
  slug: "lenovo-ideapad-flex-5-16iau7-82r800almh-2-in-1-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-flex-5-chromebook-13itl6-82m70046mh.md": {
	id: "lenovo-ideapad-flex-5-chromebook-13itl6-82m70046mh.md";
  slug: "lenovo-ideapad-flex-5-chromebook-13itl6-82m70046mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-gaming-3-15-6-f-hd-i5-11320h-16gb-512gb-w11p-2.md": {
	id: "lenovo-ideapad-gaming-3-15-6-f-hd-i5-11320h-16gb-512gb-w11p-2.md";
  slug: "lenovo-ideapad-gaming-3-15-6-f-hd-i5-11320h-16gb-512gb-w11p-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-gaming-3-15-6-f-hd-i5-11320h-16gb-512gb-w11p.md": {
	id: "lenovo-ideapad-gaming-3-15-6-f-hd-i5-11320h-16gb-512gb-w11p.md";
  slug: "lenovo-ideapad-gaming-3-15-6-f-hd-i5-11320h-16gb-512gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-gaming-3-15ach6-15-6-r5-5600h-16gb-512gb-ssd-gtx-1650-4gb-gaming-laptop-zilver-uk-qwerty-eu-plug.md": {
	id: "lenovo-ideapad-gaming-3-15ach6-15-6-r5-5600h-16gb-512gb-ssd-gtx-1650-4gb-gaming-laptop-zilver-uk-qwerty-eu-plug.md";
  slug: "lenovo-ideapad-gaming-3-15ach6-15-6-r5-5600h-16gb-512gb-ssd-gtx-1650-4gb-gaming-laptop-zilver-uk-qwerty-eu-plug";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-gaming-3-15ach6-82k201a7mh.md": {
	id: "lenovo-ideapad-gaming-3-15ach6-82k201a7mh.md";
  slug: "lenovo-ideapad-gaming-3-15ach6-82k201a7mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-gaming-3-15ach6-82k201aamh.md": {
	id: "lenovo-ideapad-gaming-3-15ach6-82k201aamh.md";
  slug: "lenovo-ideapad-gaming-3-15ach6-82k201aamh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-gaming-3-15ach6-82k201upmh-gaming-laptop-15-6-inch.md": {
	id: "lenovo-ideapad-gaming-3-15ach6-82k201upmh-gaming-laptop-15-6-inch.md";
  slug: "lenovo-ideapad-gaming-3-15ach6-82k201upmh-gaming-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-gaming-3-15ach6-82k201wpmh.md": {
	id: "lenovo-ideapad-gaming-3-15ach6-82k201wpmh.md";
  slug: "lenovo-ideapad-gaming-3-15ach6-82k201wpmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-gaming-3-15ach6-82k2023mmh.md": {
	id: "lenovo-ideapad-gaming-3-15ach6-82k2023mmh.md";
  slug: "lenovo-ideapad-gaming-3-15ach6-82k2023mmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-gaming-3-15arh7-82sb00s2mh.md": {
	id: "lenovo-ideapad-gaming-3-15arh7-82sb00s2mh.md";
  slug: "lenovo-ideapad-gaming-3-15arh7-82sb00s2mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-gaming-3-15arh7-82sb00stmh-gaming-laptop-15-6-inch.md": {
	id: "lenovo-ideapad-gaming-3-15arh7-82sb00stmh-gaming-laptop-15-6-inch.md";
  slug: "lenovo-ideapad-gaming-3-15arh7-82sb00stmh-gaming-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-gaming-3-15iah7-82s900j8mh-gaming-laptop-15-6-inch-120hz.md": {
	id: "lenovo-ideapad-gaming-3-15iah7-82s900j8mh-gaming-laptop-15-6-inch-120hz.md";
  slug: "lenovo-ideapad-gaming-3-15iah7-82s900j8mh-gaming-laptop-15-6-inch-120hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-gaming-3-15iah7-82s900nrmh.md": {
	id: "lenovo-ideapad-gaming-3-15iah7-82s900nrmh.md";
  slug: "lenovo-ideapad-gaming-3-15iah7-82s900nrmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-gaming-3-15iah7-82s9010vmh.md": {
	id: "lenovo-ideapad-gaming-3-15iah7-82s9010vmh.md";
  slug: "lenovo-ideapad-gaming-3-15iah7-82s9010vmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-gaming-3-16iah7-82sa00armh.md": {
	id: "lenovo-ideapad-gaming-3-16iah7-82sa00armh.md";
  slug: "lenovo-ideapad-gaming-3-16iah7-82sa00armh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-gaming-3-82s900j6mh-qwerty.md": {
	id: "lenovo-ideapad-gaming-3-82s900j6mh-qwerty.md";
  slug: "lenovo-ideapad-gaming-3-82s900j6mh-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-gaming-3-82sb00q4mh.md": {
	id: "lenovo-ideapad-gaming-3-82sb00q4mh.md";
  slug: "lenovo-ideapad-gaming-3-82sb00q4mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-gaming-3-laptop-15-6-inch.md": {
	id: "lenovo-ideapad-gaming-3-laptop-15-6-inch.md";
  slug: "lenovo-ideapad-gaming-3-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-ip-3-17alc6-laptop-17-3-inch.md": {
	id: "lenovo-ideapad-ip-3-17alc6-laptop-17-3-inch.md";
  slug: "lenovo-ideapad-ip-3-17alc6-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-pro-5-14aph8-83am000cmh.md": {
	id: "lenovo-ideapad-pro-5-14aph8-83am000cmh.md";
  slug: "lenovo-ideapad-pro-5-14aph8-83am000cmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-pro-5-14aph8-83am000dmh.md": {
	id: "lenovo-ideapad-pro-5-14aph8-83am000dmh.md";
  slug: "lenovo-ideapad-pro-5-14aph8-83am000dmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-pro-5-14irh8-83al0028mh-creator-laptop-14-inch-120-hz.md": {
	id: "lenovo-ideapad-pro-5-14irh8-83al0028mh-creator-laptop-14-inch-120-hz.md";
  slug: "lenovo-ideapad-pro-5-14irh8-83al0028mh-creator-laptop-14-inch-120-hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-pro-5-16aph8-83ar001qmh.md": {
	id: "lenovo-ideapad-pro-5-16aph8-83ar001qmh.md";
  slug: "lenovo-ideapad-pro-5-16aph8-83ar001qmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-pro-5-16aph8-83ar001rmh.md": {
	id: "lenovo-ideapad-pro-5-16aph8-83ar001rmh.md";
  slug: "lenovo-ideapad-pro-5-16aph8-83ar001rmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-pro-5-16aph8-83ar001smh.md": {
	id: "lenovo-ideapad-pro-5-16aph8-83ar001smh.md";
  slug: "lenovo-ideapad-pro-5-16aph8-83ar001smh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-pro-5-16aph8-83ar002cmh-creator-laptop-16-inch.md": {
	id: "lenovo-ideapad-pro-5-16aph8-83ar002cmh-creator-laptop-16-inch.md";
  slug: "lenovo-ideapad-pro-5-16aph8-83ar002cmh-creator-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-pro-5-16aph8-83ar0043mh.md": {
	id: "lenovo-ideapad-pro-5-16aph8-83ar0043mh.md";
  slug: "lenovo-ideapad-pro-5-16aph8-83ar0043mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-pro-5-16aph8-83ar0045mh.md": {
	id: "lenovo-ideapad-pro-5-16aph8-83ar0045mh.md";
  slug: "lenovo-ideapad-pro-5-16aph8-83ar0045mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-pro-5-16arp8-83as004hmh-laptop-16-inch.md": {
	id: "lenovo-ideapad-pro-5-16arp8-83as004hmh-laptop-16-inch.md";
  slug: "lenovo-ideapad-pro-5-16arp8-83as004hmh-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-pro-5-16irh8-83aq004kmh.md": {
	id: "lenovo-ideapad-pro-5-16irh8-83aq004kmh.md";
  slug: "lenovo-ideapad-pro-5-16irh8-83aq004kmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-pro-5-16irh8-83aq004lmh.md": {
	id: "lenovo-ideapad-pro-5-16irh8-83aq004lmh.md";
  slug: "lenovo-ideapad-pro-5-16irh8-83aq004lmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-pro-5-16irh8-creator-laptop-16-inch.md": {
	id: "lenovo-ideapad-pro-5-16irh8-creator-laptop-16-inch.md";
  slug: "lenovo-ideapad-pro-5-16irh8-creator-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-pro-5-83ar0011mh.md": {
	id: "lenovo-ideapad-pro-5-83ar0011mh.md";
  slug: "lenovo-ideapad-pro-5-83ar0011mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-pro-5-83as0043mh.md": {
	id: "lenovo-ideapad-pro-5-83as0043mh.md";
  slug: "lenovo-ideapad-pro-5-83as0043mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-pro-5-83as0044mh.md": {
	id: "lenovo-ideapad-pro-5-83as0044mh.md";
  slug: "lenovo-ideapad-pro-5-83as0044mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-s340-15api-amd-ryzen-7-2-3-ghz-39-6-cm-1920-x-1080-pixels-8-gb-512-gb.md": {
	id: "lenovo-ideapad-s340-15api-amd-ryzen-7-2-3-ghz-39-6-cm-1920-x-1080-pixels-8-gb-512-gb.md";
  slug: "lenovo-ideapad-s340-15api-amd-ryzen-7-2-3-ghz-39-6-cm-1920-x-1080-pixels-8-gb-512-gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-s340-notebook-grijs-35-6-cm-1920-x-1080-pixels-intel-10de-generatie-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-10-home.md": {
	id: "lenovo-ideapad-s340-notebook-grijs-35-6-cm-1920-x-1080-pixels-intel-10de-generatie-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-10-home.md";
  slug: "lenovo-ideapad-s340-notebook-grijs-35-6-cm-1920-x-1080-pixels-intel-10de-generatie-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-5-windows-10-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-14abr8-82xl0052mh.md": {
	id: "lenovo-ideapad-slim-3-14abr8-82xl0052mh.md";
  slug: "lenovo-ideapad-slim-3-14abr8-82xl0052mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-14abr8-laptop-14-inch-2.md": {
	id: "lenovo-ideapad-slim-3-14abr8-laptop-14-inch-2.md";
  slug: "lenovo-ideapad-slim-3-14abr8-laptop-14-inch-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-14abr8-laptop-14-inch.md": {
	id: "lenovo-ideapad-slim-3-14abr8-laptop-14-inch.md";
  slug: "lenovo-ideapad-slim-3-14abr8-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-14amn8-82xn0042mh.md": {
	id: "lenovo-ideapad-slim-3-14amn8-82xn0042mh.md";
  slug: "lenovo-ideapad-slim-3-14amn8-82xn0042mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-14amn8-82xn0043mh.md": {
	id: "lenovo-ideapad-slim-3-14amn8-82xn0043mh.md";
  slug: "lenovo-ideapad-slim-3-14amn8-82xn0043mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-14amn8-laptop-14-inch.md": {
	id: "lenovo-ideapad-slim-3-14amn8-laptop-14-inch.md";
  slug: "lenovo-ideapad-slim-3-14amn8-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-14iah8-83eq001qmh.md": {
	id: "lenovo-ideapad-slim-3-14iah8-83eq001qmh.md";
  slug: "lenovo-ideapad-slim-3-14iah8-83eq001qmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-15abr8-82xm008ymh.md": {
	id: "lenovo-ideapad-slim-3-15abr8-82xm008ymh.md";
  slug: "lenovo-ideapad-slim-3-15abr8-82xm008ymh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-15abr8-laptop-15-6-inch.md": {
	id: "lenovo-ideapad-slim-3-15abr8-laptop-15-6-inch.md";
  slug: "lenovo-ideapad-slim-3-15abr8-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-15amn8-156-inch-amd-ryzen-5-8-gb-512-gb-1766195.md": {
	id: "lenovo-ideapad-slim-3-15amn8-156-inch-amd-ryzen-5-8-gb-512-gb-1766195.md";
  slug: "lenovo-ideapad-slim-3-15amn8-156-inch-amd-ryzen-5-8-gb-512-gb-1766195";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-15amn8-82xq00aemh.md": {
	id: "lenovo-ideapad-slim-3-15amn8-82xq00aemh.md";
  slug: "lenovo-ideapad-slim-3-15amn8-82xq00aemh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-15amn8-82xq00awmh.md": {
	id: "lenovo-ideapad-slim-3-15amn8-82xq00awmh.md";
  slug: "lenovo-ideapad-slim-3-15amn8-82xq00awmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-15iah8-83er003amh.md": {
	id: "lenovo-ideapad-slim-3-15iah8-83er003amh.md";
  slug: "lenovo-ideapad-slim-3-15iah8-83er003amh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-15iah8-83er003bmh.md": {
	id: "lenovo-ideapad-slim-3-15iah8-83er003bmh.md";
  slug: "lenovo-ideapad-slim-3-15iah8-83er003bmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-16abr8-82xr0065mh-laptop-16-inch.md": {
	id: "lenovo-ideapad-slim-3-16abr8-82xr0065mh-laptop-16-inch.md";
  slug: "lenovo-ideapad-slim-3-16abr8-82xr0065mh-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-16abr8-82xr0068mh-laptop-16-inch.md": {
	id: "lenovo-ideapad-slim-3-16abr8-82xr0068mh-laptop-16-inch.md";
  slug: "lenovo-ideapad-slim-3-16abr8-82xr0068mh-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-16abr8-laptop-16-inch-2.md": {
	id: "lenovo-ideapad-slim-3-16abr8-laptop-16-inch-2.md";
  slug: "lenovo-ideapad-slim-3-16abr8-laptop-16-inch-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-16abr8-laptop-16-inch.md": {
	id: "lenovo-ideapad-slim-3-16abr8-laptop-16-inch.md";
  slug: "lenovo-ideapad-slim-3-16abr8-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-82xq0092mh.md": {
	id: "lenovo-ideapad-slim-3-82xq0092mh.md";
  slug: "lenovo-ideapad-slim-3-82xq0092mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-3-82xq0093mh.md": {
	id: "lenovo-ideapad-slim-3-82xq0093mh.md";
  slug: "lenovo-ideapad-slim-3-82xq0093mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-5-14-i5-12450h-8gb-512gb-ssd-intel-uhd-qwerty-w11-pro-zilver.md": {
	id: "lenovo-ideapad-slim-5-14-i5-12450h-8gb-512gb-ssd-intel-uhd-qwerty-w11-pro-zilver.md";
  slug: "lenovo-ideapad-slim-5-14-i5-12450h-8gb-512gb-ssd-intel-uhd-qwerty-w11-pro-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-5-14abr8-amd-ryzen-7-2-ghz-35-6-cm-1920-x-1200-pixels-16-gb-1-tb-2.md": {
	id: "lenovo-ideapad-slim-5-14abr8-amd-ryzen-7-2-ghz-35-6-cm-1920-x-1200-pixels-16-gb-1-tb-2.md";
  slug: "lenovo-ideapad-slim-5-14abr8-amd-ryzen-7-2-ghz-35-6-cm-1920-x-1200-pixels-16-gb-1-tb-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-5-14abr8-amd-ryzen-7-2-ghz-35-6-cm-1920-x-1200-pixels-16-gb-1-tb.md": {
	id: "lenovo-ideapad-slim-5-14abr8-amd-ryzen-7-2-ghz-35-6-cm-1920-x-1200-pixels-16-gb-1-tb.md";
  slug: "lenovo-ideapad-slim-5-14abr8-amd-ryzen-7-2-ghz-35-6-cm-1920-x-1200-pixels-16-gb-1-tb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-5-14iah8-83bf001gmh.md": {
	id: "lenovo-ideapad-slim-5-14iah8-83bf001gmh.md";
  slug: "lenovo-ideapad-slim-5-14iah8-83bf001gmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-5-14iah8-83bf004mmh-laptop-core-i5-12450h-uhd-graphics-16-gb-512-gb-ssd.md": {
	id: "lenovo-ideapad-slim-5-14iah8-83bf004mmh-laptop-core-i5-12450h-uhd-graphics-16-gb-512-gb-ssd.md";
  slug: "lenovo-ideapad-slim-5-14iah8-83bf004mmh-laptop-core-i5-12450h-uhd-graphics-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-5-14irl8-14-wuxga-oled-intel-core-i7-13620h-intel-uhd-graphics-16-gb-ddr5-1-tb-ssd.md": {
	id: "lenovo-ideapad-slim-5-14irl8-14-wuxga-oled-intel-core-i7-13620h-intel-uhd-graphics-16-gb-ddr5-1-tb-ssd.md";
  slug: "lenovo-ideapad-slim-5-14irl8-14-wuxga-oled-intel-core-i7-13620h-intel-uhd-graphics-16-gb-ddr5-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-5-14irl8-82xd004gmh.md": {
	id: "lenovo-ideapad-slim-5-14irl8-82xd004gmh.md";
  slug: "lenovo-ideapad-slim-5-14irl8-82xd004gmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-5-16abr8-16-inch-amd-ryzen-5-16-gb-512-gb-1766191.md": {
	id: "lenovo-ideapad-slim-5-16abr8-16-inch-amd-ryzen-5-16-gb-512-gb-1766191.md";
  slug: "lenovo-ideapad-slim-5-16abr8-16-inch-amd-ryzen-5-16-gb-512-gb-1766191";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-5-16abr8-82xg005rmh.md": {
	id: "lenovo-ideapad-slim-5-16abr8-82xg005rmh.md";
  slug: "lenovo-ideapad-slim-5-16abr8-82xg005rmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-5-16abr8-82xg006nmh-laptop-16-inch.md": {
	id: "lenovo-ideapad-slim-5-16abr8-82xg006nmh-laptop-16-inch.md";
  slug: "lenovo-ideapad-slim-5-16abr8-82xg006nmh-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-5-16abr8-laptop-16-inch.md": {
	id: "lenovo-ideapad-slim-5-16abr8-laptop-16-inch.md";
  slug: "lenovo-ideapad-slim-5-16abr8-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-5-16iah8-83bg002bmh.md": {
	id: "lenovo-ideapad-slim-5-16iah8-83bg002bmh.md";
  slug: "lenovo-ideapad-slim-5-16iah8-83bg002bmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-5-16iah8-83bg002cmh.md": {
	id: "lenovo-ideapad-slim-5-16iah8-83bg002cmh.md";
  slug: "lenovo-ideapad-slim-5-16iah8-83bg002cmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-5-16irl8-16-inch-intel-core-i7-16-gb-512-gb-1766194.md": {
	id: "lenovo-ideapad-slim-5-16irl8-16-inch-intel-core-i7-16-gb-512-gb-1766194.md";
  slug: "lenovo-ideapad-slim-5-16irl8-16-inch-intel-core-i7-16-gb-512-gb-1766194";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-5-16irl8-82xf005dmh.md": {
	id: "lenovo-ideapad-slim-5-16irl8-82xf005dmh.md";
  slug: "lenovo-ideapad-slim-5-16irl8-82xf005dmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-5-16irl8-82xf005fmh.md": {
	id: "lenovo-ideapad-slim-5-16irl8-82xf005fmh.md";
  slug: "lenovo-ideapad-slim-5-16irl8-82xf005fmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-5-16irl8-laptop-16-inch-2.md": {
	id: "lenovo-ideapad-slim-5-16irl8-laptop-16-inch-2.md";
  slug: "lenovo-ideapad-slim-5-16irl8-laptop-16-inch-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ideapad-slim-5-16irl8-laptop-16-inch.md": {
	id: "lenovo-ideapad-slim-5-16irl8-laptop-16-inch.md";
  slug: "lenovo-ideapad-slim-5-16irl8-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ip-3-14itl6-laptop-14-inch-512gb.md": {
	id: "lenovo-ip-3-14itl6-laptop-14-inch-512gb.md";
  slug: "lenovo-ip-3-14itl6-laptop-14-inch-512gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ip-3-156-core-i5-16gb-512gb-grey-1729747.md": {
	id: "lenovo-ip-3-156-core-i5-16gb-512gb-grey-1729747.md";
  slug: "lenovo-ip-3-156-core-i5-16gb-512gb-grey-1729747";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-ips3-15amn8-laptop-notebook-15-6-inch-512-gb.md": {
	id: "lenovo-ips3-15amn8-laptop-notebook-15-6-inch-512-gb.md";
  slug: "lenovo-ips3-15amn8-laptop-notebook-15-6-inch-512-gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-laptop-ideapad-3-14-ryzen-5-8-gb-256-gb.md": {
	id: "lenovo-laptop-ideapad-3-14-ryzen-5-8-gb-256-gb.md";
  slug: "lenovo-laptop-ideapad-3-14-ryzen-5-8-gb-256-gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-loq-15aph8-82xt008amh.md": {
	id: "lenovo-loq-15aph8-82xt008amh.md";
  slug: "lenovo-loq-15aph8-82xt008amh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-loq-15aph8-82xt008bmh.md": {
	id: "lenovo-loq-15aph8-82xt008bmh.md";
  slug: "lenovo-loq-15aph8-82xt008bmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-loq-15irh8-82xv00mcmh-gaming-laptop-15-6-inch-144hz.md": {
	id: "lenovo-loq-15irh8-82xv00mcmh-gaming-laptop-15-6-inch-144hz.md";
  slug: "lenovo-loq-15irh8-82xv00mcmh-gaming-laptop-15-6-inch-144hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-loq-15irh8-gaming-laptop-15-6-inch-144-hz.md": {
	id: "lenovo-loq-15irh8-gaming-laptop-15-6-inch-144-hz.md";
  slug: "lenovo-loq-15irh8-gaming-laptop-15-6-inch-144-hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-loq-16aph8-82xu0057mh-gaming-laptop-16-inch-144-hz.md": {
	id: "lenovo-loq-16aph8-82xu0057mh-gaming-laptop-16-inch-144-hz.md";
  slug: "lenovo-loq-16aph8-82xu0057mh-gaming-laptop-16-inch-144-hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-loq-16irh8-82xw006vmh.md": {
	id: "lenovo-loq-16irh8-82xw006vmh.md";
  slug: "lenovo-loq-16irh8-82xw006vmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-loq-16irh8-82xw006wmh.md": {
	id: "lenovo-loq-16irh8-82xw006wmh.md";
  slug: "lenovo-loq-16irh8-82xw006wmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-loq-16irh8-82xw006xmh.md": {
	id: "lenovo-loq-16irh8-82xw006xmh.md";
  slug: "lenovo-loq-16irh8-82xw006xmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-loq-16irh8-gaming-laptop-16-inch-144-hz.md": {
	id: "lenovo-loq-16irh8-gaming-laptop-16-inch-144-hz.md";
  slug: "lenovo-loq-16irh8-gaming-laptop-16-inch-144-hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-loq-82xv00e4mh.md": {
	id: "lenovo-loq-82xv00e4mh.md";
  slug: "lenovo-loq-82xv00e4mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-s340-15api-15-full-hd-ryzen-7-256gb-m-2-ssd-8gb.md": {
	id: "lenovo-s340-15api-15-full-hd-ryzen-7-256gb-m-2-ssd-8gb.md";
  slug: "lenovo-s340-15api-15-full-hd-ryzen-7-256gb-m-2-ssd-8gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-13s-6600u-notebook-33-8-cm-wuxga-amd-ryzen-5-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-grijs.md": {
	id: "lenovo-thinkbook-13s-6600u-notebook-33-8-cm-wuxga-amd-ryzen-5-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-grijs.md";
  slug: "lenovo-thinkbook-13s-6600u-notebook-33-8-cm-wuxga-amd-ryzen-5-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-14-g3-21a200bxmh-qwerty.md": {
	id: "lenovo-thinkbook-14-g3-21a200bxmh-qwerty.md";
  slug: "lenovo-thinkbook-14-g3-21a200bxmh-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-14-g4-aba-21dk006amh.md": {
	id: "lenovo-thinkbook-14-g4-aba-21dk006amh.md";
  slug: "lenovo-thinkbook-14-g4-aba-21dk006amh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-14-g4-iap-21cx003dmh-laptop-i7-1255u-iris-xe-graphics-16-gb-512-gb-ssd-win-11-pro.md": {
	id: "lenovo-thinkbook-14-g4-iap-21cx003dmh-laptop-i7-1255u-iris-xe-graphics-16-gb-512-gb-ssd-win-11-pro.md";
  slug: "lenovo-thinkbook-14-g4-iap-21cx003dmh-laptop-i7-1255u-iris-xe-graphics-16-gb-512-gb-ssd-win-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-14-g6-abp-14-inch-amd-ryzen-5-16-gb-256-gb-windows-11-pro-1795816.md": {
	id: "lenovo-thinkbook-14-g6-abp-14-inch-amd-ryzen-5-16-gb-256-gb-windows-11-pro-1795816.md";
  slug: "lenovo-thinkbook-14-g6-abp-14-inch-amd-ryzen-5-16-gb-256-gb-windows-11-pro-1795816";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-14-g6-abp-14-inch-amd-ryzen-7-16-gb-512-gb-windows-11-pro-1795817.md": {
	id: "lenovo-thinkbook-14-g6-abp-14-inch-amd-ryzen-7-16-gb-512-gb-windows-11-pro-1795817.md";
  slug: "lenovo-thinkbook-14-g6-abp-14-inch-amd-ryzen-7-16-gb-512-gb-windows-11-pro-1795817";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-14-g6-irl-14-inch-intel-core-i5-16-gb-256-gb-windows-11-pro-1795818.md": {
	id: "lenovo-thinkbook-14-g6-irl-14-inch-intel-core-i5-16-gb-256-gb-windows-11-pro-1795818.md";
  slug: "lenovo-thinkbook-14-g6-irl-14-inch-intel-core-i5-16-gb-256-gb-windows-11-pro-1795818";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-14-g6-irl-14-inch-intel-core-i7-16-gb-512-gb-windows-11-pro-1795819.md": {
	id: "lenovo-thinkbook-14-g6-irl-14-inch-intel-core-i7-16-gb-512-gb-windows-11-pro-1795819.md";
  slug: "lenovo-thinkbook-14-g6-irl-14-inch-intel-core-i7-16-gb-512-gb-windows-11-pro-1795819";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-14-g6-irl-21kg000wmh.md": {
	id: "lenovo-thinkbook-14-g6-irl-21kg000wmh.md";
  slug: "lenovo-thinkbook-14-g6-irl-21kg000wmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-14s-yoga-g3-iru-21jg000umh.md": {
	id: "lenovo-thinkbook-14s-yoga-g3-iru-21jg000umh.md";
  slug: "lenovo-thinkbook-14s-yoga-g3-iru-21jg000umh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-14s-yoga-g3-iru-21jg000vmh.md": {
	id: "lenovo-thinkbook-14s-yoga-g3-iru-21jg000vmh.md";
  slug: "lenovo-thinkbook-14s-yoga-g3-iru-21jg000vmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-14s-yoga-intel-core-i5-35-6-cm-1920-x-1080-pixels-16-gb-512-gb-windows-11-pro.md": {
	id: "lenovo-thinkbook-14s-yoga-intel-core-i5-35-6-cm-1920-x-1080-pixels-16-gb-512-gb-windows-11-pro.md";
  slug: "lenovo-thinkbook-14s-yoga-intel-core-i5-35-6-cm-1920-x-1080-pixels-16-gb-512-gb-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-15-21dl000bmh.md": {
	id: "lenovo-thinkbook-15-21dl000bmh.md";
  slug: "lenovo-thinkbook-15-21dl000bmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-15-21dl004umh.md": {
	id: "lenovo-thinkbook-15-21dl004umh.md";
  slug: "lenovo-thinkbook-15-21dl004umh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-15-5625u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-grijs.md": {
	id: "lenovo-thinkbook-15-5625u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-grijs.md";
  slug: "lenovo-thinkbook-15-5625u-notebook-39-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-15-g2-15-6-full-hd-ips-anti-glare-intel-core-i5-1135g7-8gb-ddr4-256gb-ssd-m-2-nvme-windows-11-ready.md": {
	id: "lenovo-thinkbook-15-g2-15-6-full-hd-ips-anti-glare-intel-core-i5-1135g7-8gb-ddr4-256gb-ssd-m-2-nvme-windows-11-ready.md";
  slug: "lenovo-thinkbook-15-g2-15-6-full-hd-ips-anti-glare-intel-core-i5-1135g7-8gb-ddr4-256gb-ssd-m-2-nvme-windows-11-ready";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-15-g4-aba-21dl006fmh.md": {
	id: "lenovo-thinkbook-15-g4-aba-21dl006fmh.md";
  slug: "lenovo-thinkbook-15-g4-aba-21dl006fmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-15-g4-aba-21dl006gmh.md": {
	id: "lenovo-thinkbook-15-g4-aba-21dl006gmh.md";
  slug: "lenovo-thinkbook-15-g4-aba-21dl006gmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-15-g4-i5-1235u-16gb-512gb-ssd-15-6-fhd-w10pro-verlicht-toetsenbord.md": {
	id: "lenovo-thinkbook-15-g4-i5-1235u-16gb-512gb-ssd-15-6-fhd-w10pro-verlicht-toetsenbord.md";
  slug: "lenovo-thinkbook-15-g4-i5-1235u-16gb-512gb-ssd-15-6-fhd-w10pro-verlicht-toetsenbord";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-15-g4-iap-21dj00demh-156-inch-intel-core-i5-8-gb-256-gb-windows-11-pro-1763563.md": {
	id: "lenovo-thinkbook-15-g4-iap-21dj00demh-156-inch-intel-core-i5-8-gb-256-gb-windows-11-pro-1763563.md";
  slug: "lenovo-thinkbook-15-g4-iap-21dj00demh-156-inch-intel-core-i5-8-gb-256-gb-windows-11-pro-1763563";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-15-g4-iap-21dj00demh.md": {
	id: "lenovo-thinkbook-15-g4-iap-21dj00demh.md";
  slug: "lenovo-thinkbook-15-g4-iap-21dj00demh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-15-g4-iap-21dj00dfmh.md": {
	id: "lenovo-thinkbook-15-g4-iap-21dj00dfmh.md";
  slug: "lenovo-thinkbook-15-g4-iap-21dj00dfmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-15-g4-iap-21dj00dgmh.md": {
	id: "lenovo-thinkbook-15-g4-iap-21dj00dgmh.md";
  slug: "lenovo-thinkbook-15-g4-iap-21dj00dgmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-15-g4-nieuw-model-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-grijs-3-jaar-onsite-garantie-zakelijk-model.md": {
	id: "lenovo-thinkbook-15-g4-nieuw-model-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-grijs-3-jaar-onsite-garantie-zakelijk-model.md";
  slug: "lenovo-thinkbook-15-g4-nieuw-model-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-grijs-3-jaar-onsite-garantie-zakelijk-model";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-15-i5-1135g7-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-grijs.md": {
	id: "lenovo-thinkbook-15-i5-1135g7-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-grijs.md";
  slug: "lenovo-thinkbook-15-i5-1135g7-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-15-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-grijs.md": {
	id: "lenovo-thinkbook-15-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-grijs.md";
  slug: "lenovo-thinkbook-15-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-15-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-grijs.md": {
	id: "lenovo-thinkbook-15-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-grijs.md";
  slug: "lenovo-thinkbook-15-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-15-i7-1255u-notebook-39-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-grijs.md": {
	id: "lenovo-thinkbook-15-i7-1255u-notebook-39-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-grijs.md";
  slug: "lenovo-thinkbook-15-i7-1255u-notebook-39-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-15-iil-g2-i7-1165g7-16gb-512ssd-fhd-matt-w10pro.md": {
	id: "lenovo-thinkbook-15-iil-g2-i7-1165g7-16gb-512ssd-fhd-matt-w10pro.md";
  slug: "lenovo-thinkbook-15-iil-g2-i7-1165g7-16gb-512ssd-fhd-matt-w10pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-16-g4-i7-1255u-notebook-40-6-cm-wuxga-intel-core-i7-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-grijs.md": {
	id: "lenovo-thinkbook-16-g4-i7-1255u-notebook-40-6-cm-wuxga-intel-core-i7-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-grijs.md";
  slug: "lenovo-thinkbook-16-g4-i7-1255u-notebook-40-6-cm-wuxga-intel-core-i7-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-16-g6-abp-16-inch-amd-ryzen-5-16-gb-256-gb-windows-11-pro-1795820.md": {
	id: "lenovo-thinkbook-16-g6-abp-16-inch-amd-ryzen-5-16-gb-256-gb-windows-11-pro-1795820.md";
  slug: "lenovo-thinkbook-16-g6-abp-16-inch-amd-ryzen-5-16-gb-256-gb-windows-11-pro-1795820";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-16-g6-abp-16-inch-amd-ryzen-5-16-gb-512-gb-windows-11-pro-1797037.md": {
	id: "lenovo-thinkbook-16-g6-abp-16-inch-amd-ryzen-5-16-gb-512-gb-windows-11-pro-1797037.md";
  slug: "lenovo-thinkbook-16-g6-abp-16-inch-amd-ryzen-5-16-gb-512-gb-windows-11-pro-1797037";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-16-g6-abp-16-inch-amd-ryzen-7-16-gb-512-gb-windows-11-pro-1795822.md": {
	id: "lenovo-thinkbook-16-g6-abp-16-inch-amd-ryzen-7-16-gb-512-gb-windows-11-pro-1795822.md";
  slug: "lenovo-thinkbook-16-g6-abp-16-inch-amd-ryzen-7-16-gb-512-gb-windows-11-pro-1795822";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-16-g6-abp-21kk000kmh-laptop-ryzen-7-7730u-radeon-graphics-16gb-512gb-ssd.md": {
	id: "lenovo-thinkbook-16-g6-abp-21kk000kmh-laptop-ryzen-7-7730u-radeon-graphics-16gb-512gb-ssd.md";
  slug: "lenovo-thinkbook-16-g6-abp-21kk000kmh-laptop-ryzen-7-7730u-radeon-graphics-16gb-512gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-16-g6-abp-21kk000umh-laptop-ryzen-5-7530u-radeon-graphics-16gb-512gb-ssd.md": {
	id: "lenovo-thinkbook-16-g6-abp-21kk000umh-laptop-ryzen-5-7530u-radeon-graphics-16gb-512gb-ssd.md";
  slug: "lenovo-thinkbook-16-g6-abp-21kk000umh-laptop-ryzen-5-7530u-radeon-graphics-16gb-512gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-16-g6-abp-21kk001kmh.md": {
	id: "lenovo-thinkbook-16-g6-abp-21kk001kmh.md";
  slug: "lenovo-thinkbook-16-g6-abp-21kk001kmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-16-g6-irl-16-inch-intel-core-i7-16-gb-512-gb-windows-11-pro-1795825.md": {
	id: "lenovo-thinkbook-16-g6-irl-16-inch-intel-core-i7-16-gb-512-gb-windows-11-pro-1795825.md";
  slug: "lenovo-thinkbook-16-g6-irl-16-inch-intel-core-i7-16-gb-512-gb-windows-11-pro-1795825";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-16-g6-irl-21kh000rmh.md": {
	id: "lenovo-thinkbook-16-g6-irl-21kh000rmh.md";
  slug: "lenovo-thinkbook-16-g6-irl-21kh000rmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-16-g6-irl-i5-1335u-16-gb-ddr5-512-gb-pcie-4-0-16-wuxga-ips-300-nits-71wh-sterke-accu-ir-hybrid-cam-windows-11-pro-3-jaar-garantie-verlicht-toetsenbord.md": {
	id: "lenovo-thinkbook-16-g6-irl-i5-1335u-16-gb-ddr5-512-gb-pcie-4-0-16-wuxga-ips-300-nits-71wh-sterke-accu-ir-hybrid-cam-windows-11-pro-3-jaar-garantie-verlicht-toetsenbord.md";
  slug: "lenovo-thinkbook-16-g6-irl-i5-1335u-16-gb-ddr5-512-gb-pcie-4-0-16-wuxga-ips-300-nits-71wh-sterke-accu-ir-hybrid-cam-windows-11-pro-3-jaar-garantie-verlicht-toetsenbord";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-16-g6-irl-i7-13700h-16-gb-ddr5-512-gb-pcie-4-0-16-wuxga-ips-300-nits-71wh-sterke-accu-ir-hybrid-cam-windows-11-pro-3-jaar-garantie-verlicht-toetsenbord.md": {
	id: "lenovo-thinkbook-16-g6-irl-i7-13700h-16-gb-ddr5-512-gb-pcie-4-0-16-wuxga-ips-300-nits-71wh-sterke-accu-ir-hybrid-cam-windows-11-pro-3-jaar-garantie-verlicht-toetsenbord.md";
  slug: "lenovo-thinkbook-16-g6-irl-i7-13700h-16-gb-ddr5-512-gb-pcie-4-0-16-wuxga-ips-300-nits-71wh-sterke-accu-ir-hybrid-cam-windows-11-pro-3-jaar-garantie-verlicht-toetsenbord";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-16p-g4-irh-21j8001fmh.md": {
	id: "lenovo-thinkbook-16p-g4-irh-21j8001fmh.md";
  slug: "lenovo-thinkbook-16p-g4-irh-21j8001fmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-g3-14-21a2002mmh-amd-ryzen-5-8gb-ram-256gb-ssd-windows-10-pro.md": {
	id: "lenovo-thinkbook-g3-14-21a2002mmh-amd-ryzen-5-8gb-ram-256gb-ssd-windows-10-pro.md";
  slug: "lenovo-thinkbook-g3-14-21a2002mmh-amd-ryzen-5-8gb-ram-256gb-ssd-windows-10-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-g4-15-6-f-hd-i7-1255u-16gb-512gb-w10p.md": {
	id: "lenovo-thinkbook-g4-15-6-f-hd-i7-1255u-16gb-512gb-w10p.md";
  slug: "lenovo-thinkbook-g4-15-6-f-hd-i7-1255u-16gb-512gb-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-g4-15-6-fhd-ips-i7-1255u-32gb-ddr4-512gb-m-2-ssd-toetsenbordverlichting-w11-pro-ready.md": {
	id: "lenovo-thinkbook-g4-15-6-fhd-ips-i7-1255u-32gb-ddr4-512gb-m-2-ssd-toetsenbordverlichting-w11-pro-ready.md";
  slug: "lenovo-thinkbook-g4-15-6-fhd-ips-i7-1255u-32gb-ddr4-512gb-m-2-ssd-toetsenbordverlichting-w11-pro-ready";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-g4-15-6-full-hd-ips-anti-glare-intel-core-i5-8gb-ddr4-256gb-m-2-nvme-ssd-verlicht-toetsenbord-w11-pro-ready.md": {
	id: "lenovo-thinkbook-g4-15-6-full-hd-ips-anti-glare-intel-core-i5-8gb-ddr4-256gb-m-2-nvme-ssd-verlicht-toetsenbord-w11-pro-ready.md";
  slug: "lenovo-thinkbook-g4-15-6-full-hd-ips-anti-glare-intel-core-i5-8gb-ddr4-256gb-m-2-nvme-ssd-verlicht-toetsenbord-w11-pro-ready";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-g6-ryzen-5-16-16gb-512gb-ssd-grijs-amd-ryzen-5-7530u-2x-8gb-so-dimm-ddr4-3200-integrated-amd-radeon-graphics.md": {
	id: "lenovo-thinkbook-g6-ryzen-5-16-16gb-512gb-ssd-grijs-amd-ryzen-5-7530u-2x-8gb-so-dimm-ddr4-3200-integrated-amd-radeon-graphics.md";
  slug: "lenovo-thinkbook-g6-ryzen-5-16-16gb-512gb-ssd-grijs-amd-ryzen-5-7530u-2x-8gb-so-dimm-ddr4-3200-integrated-amd-radeon-graphics";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkbook-plus-hybride-grijs-33-8-cm-1920-x-1080-pixels-intel-10de-generatie-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro.md": {
	id: "lenovo-thinkbook-plus-hybride-grijs-33-8-cm-1920-x-1080-pixels-intel-10de-generatie-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro.md";
  slug: "lenovo-thinkbook-plus-hybride-grijs-33-8-cm-1920-x-1080-pixels-intel-10de-generatie-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e14-5625u-notebook-35-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-e14-5625u-notebook-35-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-e14-5625u-notebook-35-6-cm-full-hd-amd-ryzen-5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e14-amd-g4-21eb0072mh.md": {
	id: "lenovo-thinkpad-e14-amd-g4-21eb0072mh.md";
  slug: "lenovo-thinkpad-e14-amd-g4-21eb0072mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e14-g4-21e300damh-14-inch-intel-core-i5-8-gb-256-gb-windows-11-pro-1745910.md": {
	id: "lenovo-thinkpad-e14-g4-21e300damh-14-inch-intel-core-i5-8-gb-256-gb-windows-11-pro-1745910.md";
  slug: "lenovo-thinkpad-e14-g4-21e300damh-14-inch-intel-core-i5-8-gb-256-gb-windows-11-pro-1745910";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e14-g4-21e300damh.md": {
	id: "lenovo-thinkpad-e14-g4-21e300damh.md";
  slug: "lenovo-thinkpad-e14-g4-21e300damh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e14-gen-5-14-inch-intel-core-i5-16-gb-512-gb-windows-11-pro-1795827.md": {
	id: "lenovo-thinkpad-e14-gen-5-14-inch-intel-core-i5-16-gb-512-gb-windows-11-pro-1795827.md";
  slug: "lenovo-thinkpad-e14-gen-5-14-inch-intel-core-i5-16-gb-512-gb-windows-11-pro-1795827";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e14-gen-5-21jr001vmh-laptop-ryzen-7-7730u-radeon-graphics-16-gb-512-gb-ssd.md": {
	id: "lenovo-thinkpad-e14-gen-5-21jr001vmh-laptop-ryzen-7-7730u-radeon-graphics-16-gb-512-gb-ssd.md";
  slug: "lenovo-thinkpad-e14-gen-5-21jr001vmh-laptop-ryzen-7-7730u-radeon-graphics-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e14-gen-5-amd-21jr002xmh.md": {
	id: "lenovo-thinkpad-e14-gen-5-amd-21jr002xmh.md";
  slug: "lenovo-thinkpad-e14-gen-5-amd-21jr002xmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e14-gen-5-intel-21jk0008mh.md": {
	id: "lenovo-thinkpad-e14-gen-5-intel-21jk0008mh.md";
  slug: "lenovo-thinkpad-e14-gen-5-intel-21jk0008mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e14-gen-5-intel-21jk00b7mh.md": {
	id: "lenovo-thinkpad-e14-gen-5-intel-21jk00b7mh.md";
  slug: "lenovo-thinkpad-e14-gen-5-intel-21jk00b7mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e15-15-inch-laptop.md": {
	id: "lenovo-thinkpad-e15-15-inch-laptop.md";
  slug: "lenovo-thinkpad-e15-15-inch-laptop";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e15-g4-21e600cbmh.md": {
	id: "lenovo-thinkpad-e15-g4-21e600cbmh.md";
  slug: "lenovo-thinkpad-e15-g4-21e600cbmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e15-g4-21e600cdmh.md": {
	id: "lenovo-thinkpad-e15-g4-21e600cdmh.md";
  slug: "lenovo-thinkpad-e15-g4-21e600cdmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e15-gen-2-15-6-intel-core-i5-1135g7-8gb-ddr4ram-256gb-ssd-wifi-6-windows-11-pro.md": {
	id: "lenovo-thinkpad-e15-gen-2-15-6-intel-core-i5-1135g7-8gb-ddr4ram-256gb-ssd-wifi-6-windows-11-pro.md";
  slug: "lenovo-thinkpad-e15-gen-2-15-6-intel-core-i5-1135g7-8gb-ddr4ram-256gb-ssd-wifi-6-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e15-i7-1165g7-15-6-full-hd-intel-core-i7-16-gb-ddr4-512-gb-ssd-windows-11-pro-zwart-zakelijk-model-ir-cam-finger-print.md": {
	id: "lenovo-thinkpad-e15-i7-1165g7-15-6-full-hd-intel-core-i7-16-gb-ddr4-512-gb-ssd-windows-11-pro-zwart-zakelijk-model-ir-cam-finger-print.md";
  slug: "lenovo-thinkpad-e15-i7-1165g7-15-6-full-hd-intel-core-i7-16-gb-ddr4-512-gb-ssd-windows-11-pro-zwart-zakelijk-model-ir-cam-finger-print";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e15-intel-core-i7-1355u-40-6-cm-1920-x-1080-pixels-16-gb-512-gb-windows-11-pro.md": {
	id: "lenovo-thinkpad-e15-intel-core-i7-1355u-40-6-cm-1920-x-1080-pixels-16-gb-512-gb-windows-11-pro.md";
  slug: "lenovo-thinkpad-e15-intel-core-i7-1355u-40-6-cm-1920-x-1080-pixels-16-gb-512-gb-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e16-gen-1-16-inch-intel-core-i5-16-gb-512-gb-windows-11-pro-1795830.md": {
	id: "lenovo-thinkpad-e16-gen-1-16-inch-intel-core-i5-16-gb-512-gb-windows-11-pro-1795830.md";
  slug: "lenovo-thinkpad-e16-gen-1-16-inch-intel-core-i5-16-gb-512-gb-windows-11-pro-1795830";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e16-gen-1-21jn00almh.md": {
	id: "lenovo-thinkpad-e16-gen-1-21jn00almh.md";
  slug: "lenovo-thinkpad-e16-gen-1-21jn00almh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e16-gen-1-amd-21jt0038mh.md": {
	id: "lenovo-thinkpad-e16-gen-1-amd-21jt0038mh.md";
  slug: "lenovo-thinkpad-e16-gen-1-amd-21jt0038mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e16-gen-1-amd-21jt0039mh.md": {
	id: "lenovo-thinkpad-e16-gen-1-amd-21jt0039mh.md";
  slug: "lenovo-thinkpad-e16-gen-1-amd-21jt0039mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e16-gen-1-intel-21jn000emh.md": {
	id: "lenovo-thinkpad-e16-gen-1-intel-21jn000emh.md";
  slug: "lenovo-thinkpad-e16-gen-1-intel-21jn000emh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-e16-gen-1-intel-21jn00ammh.md": {
	id: "lenovo-thinkpad-e16-gen-1-intel-21jn00ammh.md";
  slug: "lenovo-thinkpad-e16-gen-1-intel-21jn00ammh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l13-13-inch-laptop-intel-core-i5-8gb-256gb-windows-11-pro.md": {
	id: "lenovo-thinkpad-l13-13-inch-laptop-intel-core-i5-8gb-256gb-windows-11-pro.md";
  slug: "lenovo-thinkpad-l13-13-inch-laptop-intel-core-i5-8gb-256gb-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l13-gen-2-i5-1135g7-notebook-33-8-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-l13-gen-2-i5-1135g7-notebook-33-8-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-l13-gen-2-i5-1135g7-notebook-33-8-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l13-i5-1135g7-notebook-33-8-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zwart.md": {
	id: "lenovo-thinkpad-l13-i5-1135g7-notebook-33-8-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zwart.md";
  slug: "lenovo-thinkpad-l13-i5-1135g7-notebook-33-8-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l13-i5-1235u-notebook-33-8-cm-wuxga-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-l13-i5-1235u-notebook-33-8-cm-wuxga-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-l13-i5-1235u-notebook-33-8-cm-wuxga-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l13-yoga-5675u-hybride-33-8-cm-touchscreen-wuxga-amd-ryzen-5-pro-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-l13-yoga-5675u-hybride-33-8-cm-touchscreen-wuxga-amd-ryzen-5-pro-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-l13-yoga-5675u-hybride-33-8-cm-touchscreen-wuxga-amd-ryzen-5-pro-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l13-yoga-5875u-hybride-33-8-cm-touchscreen-wuxga-amd-ryzen-7-pro-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-l13-yoga-5875u-hybride-33-8-cm-touchscreen-wuxga-amd-ryzen-7-pro-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-l13-yoga-5875u-hybride-33-8-cm-touchscreen-wuxga-amd-ryzen-7-pro-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l13-yoga-gen-2-13-3-f-hd-ips-300nits-touchscreen-i5-1145g7-8gb-256gb-ssd-windows-11-pro-verlicht-toetsenbord-de-ideale-back-to-school-laptop.md": {
	id: "lenovo-thinkpad-l13-yoga-gen-2-13-3-f-hd-ips-300nits-touchscreen-i5-1145g7-8gb-256gb-ssd-windows-11-pro-verlicht-toetsenbord-de-ideale-back-to-school-laptop.md";
  slug: "lenovo-thinkpad-l13-yoga-gen-2-13-3-f-hd-ips-300nits-touchscreen-i5-1145g7-8gb-256gb-ssd-windows-11-pro-verlicht-toetsenbord-de-ideale-back-to-school-laptop";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l13-yoga-gen-2-13-3-fullhd-laptop-amd-ryzen-5-pro-5650u-8gb-256gb-ssd-windows-11-pro.md": {
	id: "lenovo-thinkpad-l13-yoga-gen-2-13-3-fullhd-laptop-amd-ryzen-5-pro-5650u-8gb-256gb-ssd-windows-11-pro.md";
  slug: "lenovo-thinkpad-l13-yoga-gen-2-13-3-fullhd-laptop-amd-ryzen-5-pro-5650u-8gb-256gb-ssd-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l13-yoga-gen2-13-3-fullhd-touchscreen-laptop-ryzen-7-pro-5850u-16gb-512gb-ssd-windows-11-pro.md": {
	id: "lenovo-thinkpad-l13-yoga-gen2-13-3-fullhd-touchscreen-laptop-ryzen-7-pro-5850u-16gb-512gb-ssd-windows-11-pro.md";
  slug: "lenovo-thinkpad-l13-yoga-gen2-13-3-fullhd-touchscreen-laptop-ryzen-7-pro-5850u-16gb-512gb-ssd-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l13-yoga-i7-1255u-hybride-33-8-cm-touchscreen-wuxga-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-l13-yoga-i7-1255u-hybride-33-8-cm-touchscreen-wuxga-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-l13-yoga-i7-1255u-hybride-33-8-cm-touchscreen-wuxga-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l14-5875u-notebook-35-6-cm-full-hd-amd-ryzen-7-pro-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-l14-5875u-notebook-35-6-cm-full-hd-amd-ryzen-7-pro-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-l14-5875u-notebook-35-6-cm-full-hd-amd-ryzen-7-pro-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l14-gen-3-intel-core-i5-1235u-8-gb-512-ssd-14-full-hd-windows-11-pro-verlicht-toetsenbord-high-end-zakelijk-model-ir-cam-finger-print.md": {
	id: "lenovo-thinkpad-l14-gen-3-intel-core-i5-1235u-8-gb-512-ssd-14-full-hd-windows-11-pro-verlicht-toetsenbord-high-end-zakelijk-model-ir-cam-finger-print.md";
  slug: "lenovo-thinkpad-l14-gen-3-intel-core-i5-1235u-8-gb-512-ssd-14-full-hd-windows-11-pro-verlicht-toetsenbord-high-end-zakelijk-model-ir-cam-finger-print";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l14-gen-3-intel-core-i7-1255u-16gb-512-gb-14-full-hd-ips-windows-11-pro-ir-cam.md": {
	id: "lenovo-thinkpad-l14-gen-3-intel-core-i7-1255u-16gb-512-gb-14-full-hd-ips-windows-11-pro-ir-cam.md";
  slug: "lenovo-thinkpad-l14-gen-3-intel-core-i7-1255u-16gb-512-gb-14-full-hd-ips-windows-11-pro-ir-cam";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l14-gen-4-21h1003vmh-laptop-i7-1355u-iris-xe-graphics-16gb-512gb-ssd.md": {
	id: "lenovo-thinkpad-l14-gen-4-21h1003vmh-laptop-i7-1355u-iris-xe-graphics-16gb-512gb-ssd.md";
  slug: "lenovo-thinkpad-l14-gen-4-21h1003vmh-laptop-i7-1355u-iris-xe-graphics-16gb-512gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l14-gen-4-intel-21h1003umh.md": {
	id: "lenovo-thinkpad-l14-gen-4-intel-21h1003umh.md";
  slug: "lenovo-thinkpad-l14-gen-4-intel-21h1003umh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l15-5675u-notebook-39-6-cm-full-hd-amd-ryzen-5-pro-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-l15-5675u-notebook-39-6-cm-full-hd-amd-ryzen-5-pro-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-l15-5675u-notebook-39-6-cm-full-hd-amd-ryzen-5-pro-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l15-5875u-notebook-39-6-cm-full-hd-amd-ryzen-7-pro-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-l15-5875u-notebook-39-6-cm-full-hd-amd-ryzen-7-pro-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-l15-5875u-notebook-39-6-cm-full-hd-amd-ryzen-7-pro-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l15-gen-2-i5-1135g7-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-l15-gen-2-i5-1135g7-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-l15-gen-2-i5-1135g7-notebook-39-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l15-gen-3-15-6-intel-core-i5-1245u-16gb-ddr4ram-512gb-nvme-ssd-intel-iris-xe-graphics-windows-11-pro.md": {
	id: "lenovo-thinkpad-l15-gen-3-15-6-intel-core-i5-1245u-16gb-ddr4ram-512gb-nvme-ssd-intel-iris-xe-graphics-windows-11-pro.md";
  slug: "lenovo-thinkpad-l15-gen-3-15-6-intel-core-i5-1245u-16gb-ddr4ram-512gb-nvme-ssd-intel-iris-xe-graphics-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l15-gen-4-21h7001lmh-laptop-r7-7730u-radeon-graphics-16-gb-512-gb-ssd.md": {
	id: "lenovo-thinkpad-l15-gen-4-21h7001lmh-laptop-r7-7730u-radeon-graphics-16-gb-512-gb-ssd.md";
  slug: "lenovo-thinkpad-l15-gen-4-21h7001lmh-laptop-r7-7730u-radeon-graphics-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l15-gen-4-intel-21h3002smh.md": {
	id: "lenovo-thinkpad-l15-gen-4-intel-21h3002smh.md";
  slug: "lenovo-thinkpad-l15-gen-4-intel-21h3002smh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l15-gen-4-intel-21h3004rmh.md": {
	id: "lenovo-thinkpad-l15-gen-4-intel-21h3004rmh.md";
  slug: "lenovo-thinkpad-l15-gen-4-intel-21h3004rmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-l15-intel-core-i7-1355u-39-6-cm-1920-x-1080-pixels-16-gb-512-gb-windows-11-pro.md": {
	id: "lenovo-thinkpad-l15-intel-core-i7-1355u-39-6-cm-1920-x-1080-pixels-16-gb-512-gb-windows-11-pro.md";
  slug: "lenovo-thinkpad-l15-intel-core-i7-1355u-39-6-cm-1920-x-1080-pixels-16-gb-512-gb-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-p14s-i5-1250p-mobiel-werkstation-35-6-cm-wuxga-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-nvidia-quadro-t550-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-p14s-i5-1250p-mobiel-werkstation-35-6-cm-wuxga-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-nvidia-quadro-t550-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-p14s-i5-1250p-mobiel-werkstation-35-6-cm-wuxga-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-nvidia-quadro-t550-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-p15v-21em000wmh.md": {
	id: "lenovo-thinkpad-p15v-21em000wmh.md";
  slug: "lenovo-thinkpad-p15v-21em000wmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-p16s-laptop-intel-core-i7-1270p-16gb-ddr4-sdram-512gb-ssd-40-6-cm-full-hd-1920-x-1200-ips-intel-iris-xe-graphics-nvidia-quadro-t550-lan-wlan-webcam-windows-11-pro-64-bit.md": {
	id: "lenovo-thinkpad-p16s-laptop-intel-core-i7-1270p-16gb-ddr4-sdram-512gb-ssd-40-6-cm-full-hd-1920-x-1200-ips-intel-iris-xe-graphics-nvidia-quadro-t550-lan-wlan-webcam-windows-11-pro-64-bit.md";
  slug: "lenovo-thinkpad-p16s-laptop-intel-core-i7-1270p-16gb-ddr4-sdram-512gb-ssd-40-6-cm-full-hd-1920-x-1200-ips-intel-iris-xe-graphics-nvidia-quadro-t550-lan-wlan-webcam-windows-11-pro-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t14-6650u-notebook-35-6-cm-wuxga-amd-ryzen-5-pro-8-gb-lpddr5-sdram-256-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-t14-6650u-notebook-35-6-cm-wuxga-amd-ryzen-5-pro-8-gb-lpddr5-sdram-256-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-t14-6650u-notebook-35-6-cm-wuxga-amd-ryzen-5-pro-8-gb-lpddr5-sdram-256-gb-ssd-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t14-gen-2-14-intel-core-i5-1145g7-16gb-ddr4ram-256gb-nvme-ssd-windows-10-pro-intel-iris-xe-graphics.md": {
	id: "lenovo-thinkpad-t14-gen-2-14-intel-core-i5-1145g7-16gb-ddr4ram-256gb-nvme-ssd-windows-10-pro-intel-iris-xe-graphics.md";
  slug: "lenovo-thinkpad-t14-gen-2-14-intel-core-i5-1145g7-16gb-ddr4ram-256gb-nvme-ssd-windows-10-pro-intel-iris-xe-graphics";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t14-gen-2-amd-ryzen-7m-pro-16gb-512ssd-win10.md": {
	id: "lenovo-thinkpad-t14-gen-2-amd-ryzen-7m-pro-16gb-512ssd-win10.md";
  slug: "lenovo-thinkpad-t14-gen-2-amd-ryzen-7m-pro-16gb-512ssd-win10";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t14-gen-4-intel-21hd00ckmh.md": {
	id: "lenovo-thinkpad-t14-gen-4-intel-21hd00ckmh.md";
  slug: "lenovo-thinkpad-t14-gen-4-intel-21hd00ckmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t14-gen2-i5-1135g7-ssd-16-go-256-go-14-fhd-windows-10-pro.md": {
	id: "lenovo-thinkpad-t14-gen2-i5-1135g7-ssd-16-go-256-go-14-fhd-windows-10-pro.md";
  slug: "lenovo-thinkpad-t14-gen2-i5-1135g7-ssd-16-go-256-go-14-fhd-windows-10-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t14-i5-10210u-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zwart.md": {
	id: "lenovo-thinkpad-t14-i5-10210u-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zwart.md";
  slug: "lenovo-thinkpad-t14-i5-10210u-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t14-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zwart.md": {
	id: "lenovo-thinkpad-t14-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zwart.md";
  slug: "lenovo-thinkpad-t14-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-10-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t14-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-t14-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-t14-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t14-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11.md": {
	id: "lenovo-thinkpad-t14-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11.md";
  slug: "lenovo-thinkpad-t14-i5-1135g7-notebook-35-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-6-windows-11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t14-i5-1235u-notebook-35-6-cm-wuxga-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-t14-i5-1235u-notebook-35-6-cm-wuxga-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-t14-i5-1235u-notebook-35-6-cm-wuxga-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t14-i5-1245u-notebook-35-6-cm-wuxga-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-t14-i5-1245u-notebook-35-6-cm-wuxga-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-t14-i5-1245u-notebook-35-6-cm-wuxga-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t14-i7-1165g7-notebook-35-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-t14-i7-1165g7-notebook-35-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-t14-i7-1165g7-notebook-35-6-cm-full-hd-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t14-notebook-35-6-cm-wuxga-touchscreen-intel-core-i5-1245u-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-t14-notebook-35-6-cm-wuxga-touchscreen-intel-core-i5-1245u-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-t14-notebook-35-6-cm-wuxga-touchscreen-intel-core-i5-1245u-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t14s-g4-21f6003emh.md": {
	id: "lenovo-thinkpad-t14s-g4-21f6003emh.md";
  slug: "lenovo-thinkpad-t14s-g4-21f6003emh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t14s-intel-core-i7-35-6-cm-1920-x-1200-pixels-16-gb-512-gb-windows-11-pro.md": {
	id: "lenovo-thinkpad-t14s-intel-core-i7-35-6-cm-1920-x-1200-pixels-16-gb-512-gb-windows-11-pro.md";
  slug: "lenovo-thinkpad-t14s-intel-core-i7-35-6-cm-1920-x-1200-pixels-16-gb-512-gb-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t15-gen-1-i5-8gb-256gb.md": {
	id: "lenovo-thinkpad-t15-gen-1-i5-8gb-256gb.md";
  slug: "lenovo-thinkpad-t15-gen-1-i5-8gb-256gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t15g-15-6-f-hd-i7-11800h-16gb-512gb-w10p-2.md": {
	id: "lenovo-thinkpad-t15g-15-6-f-hd-i7-11800h-16gb-512gb-w10p-2.md";
  slug: "lenovo-thinkpad-t15g-15-6-f-hd-i7-11800h-16gb-512gb-w10p-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t15g-15-6-f-hd-i7-11800h-16gb-512gb-w10p.md": {
	id: "lenovo-thinkpad-t15g-15-6-f-hd-i7-11800h-16gb-512gb-w10p.md";
  slug: "lenovo-thinkpad-t15g-15-6-f-hd-i7-11800h-16gb-512gb-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t15g-15-6-u-hd-i7-11800h-32gb-1tb-rtx3080-w10p.md": {
	id: "lenovo-thinkpad-t15g-15-6-u-hd-i7-11800h-32gb-1tb-rtx3080-w10p.md";
  slug: "lenovo-thinkpad-t15g-15-6-u-hd-i7-11800h-32gb-1tb-rtx3080-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t15g-15-6-uhd-i9-1195-32gb-1tb-w10p.md": {
	id: "lenovo-thinkpad-t15g-15-6-uhd-i9-1195-32gb-1tb-w10p.md";
  slug: "lenovo-thinkpad-t15g-15-6-uhd-i9-1195-32gb-1tb-w10p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t16-g2-21hh0026mh.md": {
	id: "lenovo-thinkpad-t16-g2-21hh0026mh.md";
  slug: "lenovo-thinkpad-t16-g2-21hh0026mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t16-g2-21hh002emh.md": {
	id: "lenovo-thinkpad-t16-g2-21hh002emh.md";
  slug: "lenovo-thinkpad-t16-g2-21hh002emh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t16-gen-1-amd-ryzen-7-pro-6850u-16gb-512gb-ssd-40-6-cm-wuxga-1920-x-1200-ips-amd-radeon-680m-windows-11-pro.md": {
	id: "lenovo-thinkpad-t16-gen-1-amd-ryzen-7-pro-6850u-16gb-512gb-ssd-40-6-cm-wuxga-1920-x-1200-ips-amd-radeon-680m-windows-11-pro.md";
  slug: "lenovo-thinkpad-t16-gen-1-amd-ryzen-7-pro-6850u-16gb-512gb-ssd-40-6-cm-wuxga-1920-x-1200-ips-amd-radeon-680m-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t16-gen-2-intel-21hh0032mh.md": {
	id: "lenovo-thinkpad-t16-gen-2-intel-21hh0032mh.md";
  slug: "lenovo-thinkpad-t16-gen-2-intel-21hh0032mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t16-i5-1235u-notebook-40-6-cm-wuxga-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-t16-i5-1235u-notebook-40-6-cm-wuxga-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-t16-i5-1235u-notebook-40-6-cm-wuxga-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t16-i5-1240p-notebook-40-6-cm-wuxga-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-t16-i5-1240p-notebook-40-6-cm-wuxga-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-t16-i5-1240p-notebook-40-6-cm-wuxga-intel-core-i5-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t16-i7-1260p-notebook-40-6-cm-wuxga-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-t16-i7-1260p-notebook-40-6-cm-wuxga-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-t16-i7-1260p-notebook-40-6-cm-wuxga-intel-core-i7-16-gb-ddr4-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t16-laptop-40-6-cm-wuxga-intel-core-i7-i7-1355u-32-gb-ddr5-sdram-1-tb-ssd-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-t16-laptop-40-6-cm-wuxga-intel-core-i7-i7-1355u-32-gb-ddr5-sdram-1-tb-ssd-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-t16-laptop-40-6-cm-wuxga-intel-core-i7-i7-1355u-32-gb-ddr5-sdram-1-tb-ssd-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-t431s-14-intel-core-i5-4gb-128gb-ssd-windows-10-home.md": {
	id: "lenovo-thinkpad-t431s-14-intel-core-i5-4gb-128gb-ssd-windows-10-home.md";
  slug: "lenovo-thinkpad-t431s-14-intel-core-i5-4gb-128gb-ssd-windows-10-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-x1-2-1-titanium-gen-1-i7-1180g7-16gb-1tb-ssd-13-5inch.md": {
	id: "lenovo-thinkpad-x1-2-1-titanium-gen-1-i7-1180g7-16gb-1tb-ssd-13-5inch.md";
  slug: "lenovo-thinkpad-x1-2-1-titanium-gen-1-i7-1180g7-16gb-1tb-ssd-13-5inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-x1-carbon-g10-intel-core-i7-1255u-processor-16-gb-ram-512-gb-ssd-14-wuxga-ips-windows-11-pro-64-3-jaar-garantie.md": {
	id: "lenovo-thinkpad-x1-carbon-g10-intel-core-i7-1255u-processor-16-gb-ram-512-gb-ssd-14-wuxga-ips-windows-11-pro-64-3-jaar-garantie.md";
  slug: "lenovo-thinkpad-x1-carbon-g10-intel-core-i7-1255u-processor-16-gb-ram-512-gb-ssd-14-wuxga-ips-windows-11-pro-64-3-jaar-garantie";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-x1-carbon-g11-21hm004fmh.md": {
	id: "lenovo-thinkpad-x1-carbon-g11-21hm004fmh.md";
  slug: "lenovo-thinkpad-x1-carbon-g11-21hm004fmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-x1-carbon-g11-21hm004hmh.md": {
	id: "lenovo-thinkpad-x1-carbon-g11-21hm004hmh.md";
  slug: "lenovo-thinkpad-x1-carbon-g11-21hm004hmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-x1-carbon-g11-21hm006wmh.md": {
	id: "lenovo-thinkpad-x1-carbon-g11-21hm006wmh.md";
  slug: "lenovo-thinkpad-x1-carbon-g11-21hm006wmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-x1-carbon-i5-1235u-notebook-35-6-cm-wuxga-intel-core-i5-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-x1-carbon-i5-1235u-notebook-35-6-cm-wuxga-intel-core-i5-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-x1-carbon-i5-1235u-notebook-35-6-cm-wuxga-intel-core-i5-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-x1-carbon-i5-1240p-notebook-35-6-cm-wuxga-intel-core-i5-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-x1-carbon-i5-1240p-notebook-35-6-cm-wuxga-intel-core-i5-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-x1-carbon-i5-1240p-notebook-35-6-cm-wuxga-intel-core-i5-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-x1-nano-i7-1260p-notebook-33-cm-2k-intel-core-i7-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md": {
	id: "lenovo-thinkpad-x1-nano-i7-1260p-notebook-33-cm-2k-intel-core-i7-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart.md";
  slug: "lenovo-thinkpad-x1-nano-i7-1260p-notebook-33-cm-2k-intel-core-i7-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-x1-yoga-g8-21hq002smh.md": {
	id: "lenovo-thinkpad-x1-yoga-g8-21hq002smh.md";
  slug: "lenovo-thinkpad-x1-yoga-g8-21hq002smh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-x1-yoga-gen-6-core-i7-3-0ghz-16gb-1tb-nfc-360-touchscreen.md": {
	id: "lenovo-thinkpad-x1-yoga-gen-6-core-i7-3-0ghz-16gb-1tb-nfc-360-touchscreen.md";
  slug: "lenovo-thinkpad-x1-yoga-gen-6-core-i7-3-0ghz-16gb-1tb-nfc-360-touchscreen";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-x13-gen-2-13-3-intel-core-i5-1145g7-8gb-ddr4ram-256gb-nvme-ssd-intel-iris-xe-graphics-windows-10-pro.md": {
	id: "lenovo-thinkpad-x13-gen-2-13-3-intel-core-i5-1145g7-8gb-ddr4ram-256gb-nvme-ssd-intel-iris-xe-graphics-windows-10-pro.md";
  slug: "lenovo-thinkpad-x13-gen-2-13-3-intel-core-i5-1145g7-8gb-ddr4ram-256gb-nvme-ssd-intel-iris-xe-graphics-windows-10-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-x13-gen-4-21ex005tmh-laptop-i5-1335u-iris-xe-graphics-16gb-512gb-ssd.md": {
	id: "lenovo-thinkpad-x13-gen-4-21ex005tmh-laptop-i5-1335u-iris-xe-graphics-16gb-512gb-ssd.md";
  slug: "lenovo-thinkpad-x13-gen-4-21ex005tmh-laptop-i5-1335u-iris-xe-graphics-16gb-512gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-x13-yoga-gen-4-intel-core-i5-1335u-16gb-lpddr5-sdram-512gb-ssd-33-8-cm-wuxga-1920-x-1200-ips-touch-intel-iris-xe-graphics-wlan-webcam-windows-11-pro.md": {
	id: "lenovo-thinkpad-x13-yoga-gen-4-intel-core-i5-1335u-16gb-lpddr5-sdram-512gb-ssd-33-8-cm-wuxga-1920-x-1200-ips-touch-intel-iris-xe-graphics-wlan-webcam-windows-11-pro.md";
  slug: "lenovo-thinkpad-x13-yoga-gen-4-intel-core-i5-1335u-16gb-lpddr5-sdram-512gb-ssd-33-8-cm-wuxga-1920-x-1200-ips-touch-intel-iris-xe-graphics-wlan-webcam-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-z13-6650u-notebook-33-8-cm-wuxga-amd-ryzen-5-pro-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-grijs-zwart.md": {
	id: "lenovo-thinkpad-z13-6650u-notebook-33-8-cm-wuxga-amd-ryzen-5-pro-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-grijs-zwart.md";
  slug: "lenovo-thinkpad-z13-6650u-notebook-33-8-cm-wuxga-amd-ryzen-5-pro-16-gb-lpddr5-sdram-512-gb-ssd-wi-fi-6e-windows-11-pro-grijs-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-zakelijke-laptop-e14-g4-t-i7-1255u-14-fhd-2x8gb-256gb-mx550-w11p.md": {
	id: "lenovo-thinkpad-zakelijke-laptop-e14-g4-t-i7-1255u-14-fhd-2x8gb-256gb-mx550-w11p.md";
  slug: "lenovo-thinkpad-zakelijke-laptop-e14-g4-t-i7-1255u-14-fhd-2x8gb-256gb-mx550-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-zakelijke-laptop-e14-g4-t-r5-5625u-14-fhd-8gb-256gb-w11p.md": {
	id: "lenovo-thinkpad-zakelijke-laptop-e14-g4-t-r5-5625u-14-fhd-8gb-256gb-w11p.md";
  slug: "lenovo-thinkpad-zakelijke-laptop-e14-g4-t-r5-5625u-14-fhd-8gb-256gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-zakelijke-laptop-l13-clam-g3-t-i5-1235u-13-3-fhd-8gb-256gb-w11p.md": {
	id: "lenovo-thinkpad-zakelijke-laptop-l13-clam-g3-t-i5-1235u-13-3-fhd-8gb-256gb-w11p.md";
  slug: "lenovo-thinkpad-zakelijke-laptop-l13-clam-g3-t-i5-1235u-13-3-fhd-8gb-256gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-zakelijke-laptop-l14-g3-t-i5-1235u-14-fhd-8gb-256g-w11p.md": {
	id: "lenovo-thinkpad-zakelijke-laptop-l14-g3-t-i5-1235u-14-fhd-8gb-256g-w11p.md";
  slug: "lenovo-thinkpad-zakelijke-laptop-l14-g3-t-i5-1235u-14-fhd-8gb-256g-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-zakelijke-laptop-l14-g3-t-r-5-pro-5675u-14-fhd-16gb-512gb-w11p.md": {
	id: "lenovo-thinkpad-zakelijke-laptop-l14-g3-t-r-5-pro-5675u-14-fhd-16gb-512gb-w11p.md";
  slug: "lenovo-thinkpad-zakelijke-laptop-l14-g3-t-r-5-pro-5675u-14-fhd-16gb-512gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-zakelijke-laptop-l14-g3-t-r-7-pro-5875u-14-fhd-16gb-512gb-w11p.md": {
	id: "lenovo-thinkpad-zakelijke-laptop-l14-g3-t-r-7-pro-5875u-14-fhd-16gb-512gb-w11p.md";
  slug: "lenovo-thinkpad-zakelijke-laptop-l14-g3-t-r-7-pro-5875u-14-fhd-16gb-512gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-thinkpad-zakelijke-laptop-x13-g3-i5-1240p-13-3-fhd-16gb-512gb-w11p.md": {
	id: "lenovo-thinkpad-zakelijke-laptop-x13-g3-i5-1240p-13-3-fhd-16gb-512gb-w11p.md";
  slug: "lenovo-thinkpad-zakelijke-laptop-x13-g3-i5-1240p-13-3-fhd-16gb-512gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-v-v15-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-11-pro-zwart.md": {
	id: "lenovo-v-v15-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-11-pro-zwart.md";
  slug: "lenovo-v-v15-i5-1235u-notebook-39-6-cm-full-hd-intel-core-i5-8-gb-ddr4-sdram-256-gb-ssd-wi-fi-5-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-v-v15-intel-core-i5-39-6-cm-1920-x-1080-pixels-16-gb-512-gb-windows-11-pro.md": {
	id: "lenovo-v-v15-intel-core-i5-39-6-cm-1920-x-1080-pixels-16-gb-512-gb-windows-11-pro.md";
  slug: "lenovo-v-v15-intel-core-i5-39-6-cm-1920-x-1080-pixels-16-gb-512-gb-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-v14-g3-14-0-f-hd-i5-1235u-8gb-256gb-w11p.md": {
	id: "lenovo-v14-g3-14-0-f-hd-i5-1235u-8gb-256gb-w11p.md";
  slug: "lenovo-v14-g3-14-0-f-hd-i5-1235u-8gb-256gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-v14-g4-amn-82yt00m4mh-laptop-ryzen-5-7520u-radeon-610m-graphics-16-gb-512-gb-ssd.md": {
	id: "lenovo-v14-g4-amn-82yt00m4mh-laptop-ryzen-5-7520u-radeon-610m-graphics-16-gb-512-gb-ssd.md";
  slug: "lenovo-v14-g4-amn-82yt00m4mh-laptop-ryzen-5-7520u-radeon-610m-graphics-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-v14-g4-amn-82yt00m4mh.md": {
	id: "lenovo-v14-g4-amn-82yt00m4mh.md";
  slug: "lenovo-v14-g4-amn-82yt00m4mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-v15-g3-15-6-f-hd-ryzen-5-5625u-8gb-512gb-w11p.md": {
	id: "lenovo-v15-g3-15-6-f-hd-ryzen-5-5625u-8gb-512gb-w11p.md";
  slug: "lenovo-v15-g3-15-6-f-hd-ryzen-5-5625u-8gb-512gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-v15-g3-15-6-full-hd-i5-1235u-8gb-512gb-windows-11-pro.md": {
	id: "lenovo-v15-g3-15-6-full-hd-i5-1235u-8gb-512gb-windows-11-pro.md";
  slug: "lenovo-v15-g3-15-6-full-hd-i5-1235u-8gb-512gb-windows-11-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-v15-g4-15-6-f-hd-i5-13420h-8gb-512gb-w11p.md": {
	id: "lenovo-v15-g4-15-6-f-hd-i5-13420h-8gb-512gb-w11p.md";
  slug: "lenovo-v15-g4-15-6-f-hd-i5-13420h-8gb-512gb-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-v15-g4-amn-82yu-amd-ryzen-5-7520u-2-8-ghz-win-11-pro-radeon-610m-16-gb-ram-512-gb-ssd-nvme-15-6-tn-1920-x-1080.md": {
	id: "lenovo-v15-g4-amn-82yu-amd-ryzen-5-7520u-2-8-ghz-win-11-pro-radeon-610m-16-gb-ram-512-gb-ssd-nvme-15-6-tn-1920-x-1080.md";
  slug: "lenovo-v15-g4-amn-82yu-amd-ryzen-5-7520u-2-8-ghz-win-11-pro-radeon-610m-16-gb-ram-512-gb-ssd-nvme-15-6-tn-1920-x-1080";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-v15-g4-amn-82yu-laptop-15-6-full-hd-amd-ryzen-5-7520u-radeon-610m-8-gb-ram-256-gb-ssd-windows-11-pro-tsb-engels-met-2-jaar-lenovo-depotondersteuning-co2-neutralisatie-0-5-ton.md": {
	id: "lenovo-v15-g4-amn-82yu-laptop-15-6-full-hd-amd-ryzen-5-7520u-radeon-610m-8-gb-ram-256-gb-ssd-windows-11-pro-tsb-engels-met-2-jaar-lenovo-depotondersteuning-co2-neutralisatie-0-5-ton.md";
  slug: "lenovo-v15-g4-amn-82yu-laptop-15-6-full-hd-amd-ryzen-5-7520u-radeon-610m-8-gb-ram-256-gb-ssd-windows-11-pro-tsb-engels-met-2-jaar-lenovo-depotondersteuning-co2-neutralisatie-0-5-ton";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-v15-g4-amn-82yu00u9mh.md": {
	id: "lenovo-v15-g4-amn-82yu00u9mh.md";
  slug: "lenovo-v15-g4-amn-82yu00u9mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-v15-g4-amn-ryzen-5-7520u.md": {
	id: "lenovo-v15-g4-amn-ryzen-5-7520u.md";
  slug: "lenovo-v15-g4-amn-ryzen-5-7520u";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-v15-g4-iah-156-inch-intel-core-i5-8-gb-512-gb-windows-11-pro-1797038.md": {
	id: "lenovo-v15-g4-iah-156-inch-intel-core-i5-8-gb-512-gb-windows-11-pro-1797038.md";
  slug: "lenovo-v15-g4-iah-156-inch-intel-core-i5-8-gb-512-gb-windows-11-pro-1797038";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-v15-g4-iah-i5-4-5-ghz-15-6-16gb-512gb-ssd-zwart.md": {
	id: "lenovo-v15-g4-iah-i5-4-5-ghz-15-6-16gb-512gb-ssd-zwart.md";
  slug: "lenovo-v15-g4-iah-i5-4-5-ghz-15-6-16gb-512gb-ssd-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-v15-g4-iru-83a10045mh.md": {
	id: "lenovo-v15-g4-iru-83a10045mh.md";
  slug: "lenovo-v15-g4-iru-83a10045mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-v17-g4-iru-83a2-intel-core-i7-1355u-16gb-ddr4-sdram-512gb-ssd-43-9-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-wlan-webcam-windows-11-pro-64-bit.md": {
	id: "lenovo-v17-g4-iru-83a2-intel-core-i7-1355u-16gb-ddr4-sdram-512gb-ssd-43-9-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-wlan-webcam-windows-11-pro-64-bit.md";
  slug: "lenovo-v17-g4-iru-83a2-intel-core-i7-1355u-16gb-ddr4-sdram-512gb-ssd-43-9-cm-full-hd-1920-x-1080-ips-intel-iris-xe-graphics-wlan-webcam-windows-11-pro-64-bit";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-v17-g4-iru-83a2000wmh.md": {
	id: "lenovo-v17-g4-iru-83a2000wmh.md";
  slug: "lenovo-v17-g4-iru-83a2000wmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-7-14arb7-82qf005dmh.md": {
	id: "lenovo-yoga-7-14arb7-82qf005dmh.md";
  slug: "lenovo-yoga-7-14arb7-82qf005dmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-7-14irl8-82yl0088mh-2-in-1-laptop-14-inch.md": {
	id: "lenovo-yoga-7-14irl8-82yl0088mh-2-in-1-laptop-14-inch.md";
  slug: "lenovo-yoga-7-14irl8-82yl0088mh-2-in-1-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-7-16arp8-83bs000lmh.md": {
	id: "lenovo-yoga-7-16arp8-83bs000lmh.md";
  slug: "lenovo-yoga-7-16arp8-83bs000lmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-7-16arp8-83bs000mmh.md": {
	id: "lenovo-yoga-7-16arp8-83bs000mmh.md";
  slug: "lenovo-yoga-7-16arp8-83bs000mmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-7-16arp8-83bs000ymh-2-in-1-laptop-16-inch.md": {
	id: "lenovo-yoga-7-16arp8-83bs000ymh-2-in-1-laptop-16-inch.md";
  slug: "lenovo-yoga-7-16arp8-83bs000ymh-2-in-1-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-7-16irl8-16-inch-intel-core-i7-16-gb-1-tb-1766189.md": {
	id: "lenovo-yoga-7-16irl8-16-inch-intel-core-i7-16-gb-1-tb-1766189.md";
  slug: "lenovo-yoga-7-16irl8-16-inch-intel-core-i7-16-gb-1-tb-1766189";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-7-16irl8-82yn0033mh.md": {
	id: "lenovo-yoga-7-16irl8-82yn0033mh.md";
  slug: "lenovo-yoga-7-16irl8-82yn0033mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-7-16irl8-82yn0045mh-2-in-1-laptop-16-inch.md": {
	id: "lenovo-yoga-7-16irl8-82yn0045mh-2-in-1-laptop-16-inch.md";
  slug: "lenovo-yoga-7-16irl8-82yn0045mh-2-in-1-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-7-oled-14arp8-82ym0054mh.md": {
	id: "lenovo-yoga-7-oled-14arp8-82ym0054mh.md";
  slug: "lenovo-yoga-7-oled-14arp8-82ym0054mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-7-oled-14arp8-82ym0076mh.md": {
	id: "lenovo-yoga-7-oled-14arp8-82ym0076mh.md";
  slug: "lenovo-yoga-7-oled-14arp8-82ym0076mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-7-oled-14irl8-82yl006emh.md": {
	id: "lenovo-yoga-7-oled-14irl8-82yl006emh.md";
  slug: "lenovo-yoga-7-oled-14irl8-82yl006emh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-9-pro-16irp8-creator-laptop-16-inch-2.md": {
	id: "lenovo-yoga-9-pro-16irp8-creator-laptop-16-inch-2.md";
  slug: "lenovo-yoga-9-pro-16irp8-creator-laptop-16-inch-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-9-pro-16irp8-creator-laptop-16-inch.md": {
	id: "lenovo-yoga-9-pro-16irp8-creator-laptop-16-inch.md";
  slug: "lenovo-yoga-9-pro-16irp8-creator-laptop-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-book-9-13iru8-82yq0031mh.md": {
	id: "lenovo-yoga-book-9-13iru8-82yq0031mh.md";
  slug: "lenovo-yoga-book-9-13iru8-82yq0031mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-c930-13ikb-81c4002wmh-2-in-1-laptop-13-9-inch.md": {
	id: "lenovo-yoga-c930-13ikb-81c4002wmh-2-in-1-laptop-13-9-inch.md";
  slug: "lenovo-yoga-c930-13ikb-81c4002wmh-2-in-1-laptop-13-9-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-pro-7-14aph8-82y80024mh-laptop-14-5-inch.md": {
	id: "lenovo-yoga-pro-7-14aph8-82y80024mh-laptop-14-5-inch.md";
  slug: "lenovo-yoga-pro-7-14aph8-82y80024mh-laptop-14-5-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-pro-7-14aph8-82y80026mh-creator-laptop-14-5-inch.md": {
	id: "lenovo-yoga-pro-7-14aph8-82y80026mh-creator-laptop-14-5-inch.md";
  slug: "lenovo-yoga-pro-7-14aph8-82y80026mh-creator-laptop-14-5-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-pro-7-14aph8-creator-laptop-14-5-inch.md": {
	id: "lenovo-yoga-pro-7-14aph8-creator-laptop-14-5-inch.md";
  slug: "lenovo-yoga-pro-7-14aph8-creator-laptop-14-5-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-pro-7-14irh8-82y700a5mh-laptop-14-5-inch-90-hz.md": {
	id: "lenovo-yoga-pro-7-14irh8-82y700a5mh-laptop-14-5-inch-90-hz.md";
  slug: "lenovo-yoga-pro-7-14irh8-82y700a5mh-laptop-14-5-inch-90-hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-pro-7-14irh8-82y700a6mh-creator-laptop-14-5-inch-120-hz.md": {
	id: "lenovo-yoga-pro-7-14irh8-82y700a6mh-creator-laptop-14-5-inch-120-hz.md";
  slug: "lenovo-yoga-pro-7-14irh8-82y700a6mh-creator-laptop-14-5-inch-120-hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-pro-7-14irh8-82y700b0mh.md": {
	id: "lenovo-yoga-pro-7-14irh8-82y700b0mh.md";
  slug: "lenovo-yoga-pro-7-14irh8-82y700b0mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-pro-7-14irh8-82y700b3mh.md": {
	id: "lenovo-yoga-pro-7-14irh8-82y700b3mh.md";
  slug: "lenovo-yoga-pro-7-14irh8-82y700b3mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-pro-7-83au0048mh.md": {
	id: "lenovo-yoga-pro-7-83au0048mh.md";
  slug: "lenovo-yoga-pro-7-83au0048mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-pro-9-16irp8-83by006qmh.md": {
	id: "lenovo-yoga-pro-9-16irp8-83by006qmh.md";
  slug: "lenovo-yoga-pro-9-16irp8-83by006qmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-pro-9-16irp8-creator-laptop-16-inch-165-hz.md": {
	id: "lenovo-yoga-pro-9-16irp8-creator-laptop-16-inch-165-hz.md";
  slug: "lenovo-yoga-pro-9-16irp8-creator-laptop-16-inch-165-hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-slim-6-14apu8-82x3002qmh-laptop-14-inch.md": {
	id: "lenovo-yoga-slim-6-14apu8-82x3002qmh-laptop-14-inch.md";
  slug: "lenovo-yoga-slim-6-14apu8-82x3002qmh-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-slim-6-14irp8-82wv005vmh-laptop-14-inch.md": {
	id: "lenovo-yoga-slim-6-14irp8-82wv005vmh-laptop-14-inch.md";
  slug: "lenovo-yoga-slim-6-14irp8-82wv005vmh-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-slim-6-82wu0076mh.md": {
	id: "lenovo-yoga-slim-6-82wu0076mh.md";
  slug: "lenovo-yoga-slim-6-82wu0076mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-slim-6-82wu0077mh.md": {
	id: "lenovo-yoga-slim-6-82wu0077mh.md";
  slug: "lenovo-yoga-slim-6-82wu0077mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-slim-6-oled-14iap8-82wu008tmh.md": {
	id: "lenovo-yoga-slim-6-oled-14iap8-82wu008tmh.md";
  slug: "lenovo-yoga-slim-6-oled-14iap8-82wu008tmh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-slim-6-oled-14iap8-82wu008umh.md": {
	id: "lenovo-yoga-slim-6-oled-14iap8-82wu008umh.md";
  slug: "lenovo-yoga-slim-6-oled-14iap8-82wu008umh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-slim-7-pro-82ms00fsmh-qwerty.md": {
	id: "lenovo-yoga-slim-7-pro-82ms00fsmh-qwerty.md";
  slug: "lenovo-yoga-slim-7-pro-82ms00fsmh-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-slim-7-pro-82nk0040mh.md": {
	id: "lenovo-yoga-slim-7-pro-82nk0040mh.md";
  slug: "lenovo-yoga-slim-7-pro-82nk0040mh";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-slim-7-pro-x-14iah7-laptop-14-5-inch.md": {
	id: "lenovo-yoga-slim-7-pro-x-14iah7-laptop-14-5-inch.md";
  slug: "lenovo-yoga-slim-7-pro-x-14iah7-laptop-14-5-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-yoga-slim-7-prox-i7-12700h-notebook-36-8-cm-3k-intel-core-i7-16-gb-lpddr5-sdram-1000-gb-ssd-nvidia-geforce-gtx-1650-wi-fi-6e-windows-11-home-blauw.md": {
	id: "lenovo-yoga-slim-7-prox-i7-12700h-notebook-36-8-cm-3k-intel-core-i7-16-gb-lpddr5-sdram-1000-gb-ssd-nvidia-geforce-gtx-1650-wi-fi-6e-windows-11-home-blauw.md";
  slug: "lenovo-yoga-slim-7-prox-i7-12700h-notebook-36-8-cm-3k-intel-core-i7-16-gb-lpddr5-sdram-1000-gb-ssd-nvidia-geforce-gtx-1650-wi-fi-6e-windows-11-home-blauw";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"lenovo-zakelijke-laptop-thinkpad-e14-g4-t-i5-1235u-14-fhd-2x8gb-512gb-mx550-w11p.md": {
	id: "lenovo-zakelijke-laptop-thinkpad-e14-g4-t-i5-1235u-14-fhd-2x8gb-512gb-mx550-w11p.md";
  slug: "lenovo-zakelijke-laptop-thinkpad-e14-g4-t-i5-1235u-14-fhd-2x8gb-512gb-mx550-w11p";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-akoya-e15413-laptop-windows-11-home-15-6-inch.md": {
	id: "medion-akoya-e15413-laptop-windows-11-home-15-6-inch.md";
  slug: "medion-akoya-e15413-laptop-windows-11-home-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-akoya-e15415-30034416-qwerty.md": {
	id: "medion-akoya-e15415-30034416-qwerty.md";
  slug: "medion-akoya-e15415-30034416-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-akoya-e16401-laptop-16-1-inch.md": {
	id: "medion-akoya-e16401-laptop-16-1-inch.md";
  slug: "medion-akoya-e16401-laptop-16-1-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-akoya-e16423-md62558-nl-16-inch-intel-core-i5-8-gb-512-gb-1770559.md": {
	id: "medion-akoya-e16423-md62558-nl-16-inch-intel-core-i5-8-gb-512-gb-1770559.md";
  slug: "medion-akoya-e16423-md62558-nl-16-inch-intel-core-i5-8-gb-512-gb-1770559";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-akoya-e16423-md62559-nl-16-inch-intel-core-i7-16-gb-512-gb-1791309.md": {
	id: "medion-akoya-e16423-md62559-nl-16-inch-intel-core-i7-16-gb-512-gb-1791309.md";
  slug: "medion-akoya-e16423-md62559-nl-16-inch-intel-core-i7-16-gb-512-gb-1791309";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-akoya-e16423-md62559-nl-laptop.md": {
	id: "medion-akoya-e16423-md62559-nl-laptop.md";
  slug: "medion-akoya-e16423-md62559-nl-laptop";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-akoya-i7-e16423-md62559-nl-laptop-i7-1195g7-iris-xe-graphics-16-gb-512-gb-ssd.md": {
	id: "medion-akoya-i7-e16423-md62559-nl-laptop-i7-1195g7-iris-xe-graphics-16-gb-512-gb-ssd.md";
  slug: "medion-akoya-i7-e16423-md62559-nl-laptop-i7-1195g7-iris-xe-graphics-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-e15413-i5-512f8-laptop-15-6-fhd-windows-11-grijs-1733392.md": {
	id: "medion-e15413-i5-512f8-laptop-15-6-fhd-windows-11-grijs-1733392.md";
  slug: "medion-e15413-i5-512f8-laptop-15-6-fhd-windows-11-grijs-1733392";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-e15413-md62465.md": {
	id: "medion-e15413-md62465.md";
  slug: "medion-e15413-md62465";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-erazer-beast-x25-gaming-laptop-240-hz-windows-11-home-17-3-inch.md": {
	id: "medion-erazer-beast-x25-gaming-laptop-240-hz-windows-11-home-17-3-inch.md";
  slug: "medion-erazer-beast-x25-gaming-laptop-240-hz-windows-11-home-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-erazer-beast-x30-md62462-nl-gaming-laptop-173-qhd-intel-core-i7-12700h-16-gb-ram-1-tb-ssd-geforce-rtx-3080-ti-windows-11-zwart-1733400.md": {
	id: "medion-erazer-beast-x30-md62462-nl-gaming-laptop-173-qhd-intel-core-i7-12700h-16-gb-ram-1-tb-ssd-geforce-rtx-3080-ti-windows-11-zwart-1733400.md";
  slug: "medion-erazer-beast-x30-md62462-nl-gaming-laptop-173-qhd-intel-core-i7-12700h-16-gb-ram-1-tb-ssd-geforce-rtx-3080-ti-windows-11-zwart-1733400";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-erazer-defender-p40-md62522-nl-1756493.md": {
	id: "medion-erazer-defender-p40-md62522-nl-1756493.md";
  slug: "medion-erazer-defender-p40-md62522-nl-1756493";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-erazer-defender-p50-md62587-nl.md": {
	id: "medion-erazer-defender-p50-md62587-nl.md";
  slug: "medion-erazer-defender-p50-md62587-nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-erazer-deputy-p25-gaming-laptop-15-6-inch-144-hz.md": {
	id: "medion-erazer-deputy-p25-gaming-laptop-15-6-inch-144-hz.md";
  slug: "medion-erazer-deputy-p25-gaming-laptop-15-6-inch-144-hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-erazer-deputy-p25-gaming-laptop-windows-11-home-15-6-inch.md": {
	id: "medion-erazer-deputy-p25-gaming-laptop-windows-11-home-15-6-inch.md";
  slug: "medion-erazer-deputy-p25-gaming-laptop-windows-11-home-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-erazer-deputy-p30-md62473-nl-gaming-laptop-15-6-fhd-intel-core-i7-12700h-16-gb-ram-1-tb-ssd-geforce-rtx-3060-windows-11-zwart-1733397.md": {
	id: "medion-erazer-deputy-p30-md62473-nl-gaming-laptop-15-6-fhd-intel-core-i7-12700h-16-gb-ram-1-tb-ssd-geforce-rtx-3060-windows-11-zwart-1733397.md";
  slug: "medion-erazer-deputy-p30-md62473-nl-gaming-laptop-15-6-fhd-intel-core-i7-12700h-16-gb-ram-1-tb-ssd-geforce-rtx-3060-windows-11-zwart-1733397";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-erazer-deputy-p60-md62588-nl.md": {
	id: "medion-erazer-deputy-p60-md62588-nl.md";
  slug: "medion-erazer-deputy-p60-md62588-nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-erazer-major-x20-gaming-laptop-intel-core-i7-13700hx-16gb-ddr5-1024gb-ssd-16-inch-qhd-rtx-4070-windows-11-home.md": {
	id: "medion-erazer-major-x20-gaming-laptop-intel-core-i7-13700hx-16gb-ddr5-1024gb-ssd-16-inch-qhd-rtx-4070-windows-11-home.md";
  slug: "medion-erazer-major-x20-gaming-laptop-intel-core-i7-13700hx-16gb-ddr5-1024gb-ssd-16-inch-qhd-rtx-4070-windows-11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-gaming-laptop-erazer-crawler-e40-core-i5-13500h-15-6-inch-fhd-144hz-geforce-rtx-4050-512-gb-ssd-16-gb-ram-windows-11-home.md": {
	id: "medion-gaming-laptop-erazer-crawler-e40-core-i5-13500h-15-6-inch-fhd-144hz-geforce-rtx-4050-512-gb-ssd-16-gb-ram-windows-11-home.md";
  slug: "medion-gaming-laptop-erazer-crawler-e40-core-i5-13500h-15-6-inch-fhd-144hz-geforce-rtx-4050-512-gb-ssd-16-gb-ram-windows-11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-gaming-laptop-erazer-scout-e20-core-i5-13420h-17-3-inch-fhd-scherm-144-hz-nvidia-rtx-4050-512-gb-ssd-16-gb-ram-windows-11-home.md": {
	id: "medion-gaming-laptop-erazer-scout-e20-core-i5-13420h-17-3-inch-fhd-scherm-144-hz-nvidia-rtx-4050-512-gb-ssd-16-gb-ram-windows-11-home.md";
  slug: "medion-gaming-laptop-erazer-scout-e20-core-i5-13420h-17-3-inch-fhd-scherm-144-hz-nvidia-rtx-4050-512-gb-ssd-16-gb-ram-windows-11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-gaming-laptop-medion-erazer-crawler-e30-intel-core-i5-12450h-15-6-inch-full-hd-scherm-nvidia-geforce-gtx-1650-512-gb-ssd-16-gb-ram-windows-11-home.md": {
	id: "medion-gaming-laptop-medion-erazer-crawler-e30-intel-core-i5-12450h-15-6-inch-full-hd-scherm-nvidia-geforce-gtx-1650-512-gb-ssd-16-gb-ram-windows-11-home.md";
  slug: "medion-gaming-laptop-medion-erazer-crawler-e30-intel-core-i5-12450h-15-6-inch-full-hd-scherm-nvidia-geforce-gtx-1650-512-gb-ssd-16-gb-ram-windows-11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"medion-high-end-gaming-laptop-erazer-major-x10-intel-core-i7-12700h-qhd-display-intel-arc-a730m-1-tb-pcie-ssd-16-gb-ram-144-hz-16-inch.md": {
	id: "medion-high-end-gaming-laptop-erazer-major-x10-intel-core-i7-12700h-qhd-display-intel-arc-a730m-1-tb-pcie-ssd-16-gb-ram-144-hz-16-inch.md";
  slug: "medion-high-end-gaming-laptop-erazer-major-x10-intel-core-i7-12700h-qhd-display-intel-arc-a730m-1-tb-pcie-ssd-16-gb-ram-144-hz-16-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-4-laptop-amd-r7se-15-inch-8gb-platinum.md": {
	id: "microsoft-surface-4-laptop-amd-r7se-15-inch-8gb-platinum.md";
  slug: "microsoft-surface-4-laptop-amd-r7se-15-inch-8gb-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-4-laptop-intel-i5-13-5-inch-8gb-platinum.md": {
	id: "microsoft-surface-4-laptop-intel-i5-13-5-inch-8gb-platinum.md";
  slug: "microsoft-surface-4-laptop-intel-i5-13-5-inch-8gb-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-2-notebook-platina-34-3-cm-2256-x-1504-pixels-touchscreen-intel-8de-generatie-core-i7-16-gb-ddr3l-sdram-512-gb-ssd-wi-fi-5-windows-10-pro.md": {
	id: "microsoft-surface-laptop-2-notebook-platina-34-3-cm-2256-x-1504-pixels-touchscreen-intel-8de-generatie-core-i7-16-gb-ddr3l-sdram-512-gb-ssd-wi-fi-5-windows-10-pro.md";
  slug: "microsoft-surface-laptop-2-notebook-platina-34-3-cm-2256-x-1504-pixels-touchscreen-intel-8de-generatie-core-i7-16-gb-ddr3l-sdram-512-gb-ssd-wi-fi-5-windows-10-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-3-13-5-touchscreen-gebruikt-i5-10th-8gb-256gb-black-uk-qwerty-keyboard-gebruikt-bevat-gebruikssporen.md": {
	id: "microsoft-surface-laptop-3-13-5-touchscreen-gebruikt-i5-10th-8gb-256gb-black-uk-qwerty-keyboard-gebruikt-bevat-gebruikssporen.md";
  slug: "microsoft-surface-laptop-3-13-5-touchscreen-gebruikt-i5-10th-8gb-256gb-black-uk-qwerty-keyboard-gebruikt-bevat-gebruikssporen";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-3-13-5-touchscreen-gebruikt-i5-10th-8gb-256gb-platinum-uk-qwerty-keyboard-gebruikt-bevat-gebruikssporen.md": {
	id: "microsoft-surface-laptop-3-13-5-touchscreen-gebruikt-i5-10th-8gb-256gb-platinum-uk-qwerty-keyboard-gebruikt-bevat-gebruikssporen.md";
  slug: "microsoft-surface-laptop-3-13-5-touchscreen-gebruikt-i5-10th-8gb-256gb-platinum-uk-qwerty-keyboard-gebruikt-bevat-gebruikssporen";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-3-amd-ryzen-5-256-gb-15-inch.md": {
	id: "microsoft-surface-laptop-3-amd-ryzen-5-256-gb-15-inch.md";
  slug: "microsoft-surface-laptop-3-amd-ryzen-5-256-gb-15-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-3-amd-ryzen-7-16gb-512gb-platina.md": {
	id: "microsoft-surface-laptop-3-amd-ryzen-7-16gb-512gb-platina.md";
  slug: "microsoft-surface-laptop-3-amd-ryzen-7-16gb-512gb-platina";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-3-i7-1065g7-notebook-38-1-cm-touchscreen-intel-core-i7-16-gb-lpddr4x-sdram-512-gb-ssd-wi-fi-6-windows-10-pro-zwart.md": {
	id: "microsoft-surface-laptop-3-i7-1065g7-notebook-38-1-cm-touchscreen-intel-core-i7-16-gb-lpddr4x-sdram-512-gb-ssd-wi-fi-6-windows-10-pro-zwart.md";
  slug: "microsoft-surface-laptop-3-i7-1065g7-notebook-38-1-cm-touchscreen-intel-core-i7-16-gb-lpddr4x-sdram-512-gb-ssd-wi-fi-6-windows-10-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-4-13-5-r5se-8gb-256gb-platinum-radeon-graphics-microsoft-surface-edition.md": {
	id: "microsoft-surface-laptop-4-13-5-r5se-8gb-256gb-platinum-radeon-graphics-microsoft-surface-edition.md";
  slug: "microsoft-surface-laptop-4-13-5-r5se-8gb-256gb-platinum-radeon-graphics-microsoft-surface-edition";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-4-13-amd-ryzen-5-8gb-256gb-platinum.md": {
	id: "microsoft-surface-laptop-4-13-amd-ryzen-5-8gb-256gb-platinum.md";
  slug: "microsoft-surface-laptop-4-13-amd-ryzen-5-8gb-256gb-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-4-13-i5-16gb-512gb-zwart.md": {
	id: "microsoft-surface-laptop-4-13-i5-16gb-512gb-zwart.md";
  slug: "microsoft-surface-laptop-4-13-i5-16gb-512gb-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-4-15-i7-32gb-1tb-zwart.md": {
	id: "microsoft-surface-laptop-4-15-i7-32gb-1tb-zwart.md";
  slug: "microsoft-surface-laptop-4-15-i7-32gb-1tb-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-4-15-i7-8gb-256gb-platinum.md": {
	id: "microsoft-surface-laptop-4-15-i7-8gb-256gb-platinum.md";
  slug: "microsoft-surface-laptop-4-15-i7-8gb-256gb-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-4-4980u-notebook-38-1-cm-touchscreen-amd-ryzen-7-8-gb-lpddr4x-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-platina.md": {
	id: "microsoft-surface-laptop-4-4980u-notebook-38-1-cm-touchscreen-amd-ryzen-7-8-gb-lpddr4x-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-platina.md";
  slug: "microsoft-surface-laptop-4-4980u-notebook-38-1-cm-touchscreen-amd-ryzen-7-8-gb-lpddr4x-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-platina";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-4-i5-1145g7-notebook-34-3-cm-touchscreen-intel-core-i5-8-gb-lpddr4x-sdram-512-gb-ssd-wi-fi-6-windows-10-pro-zwart.md": {
	id: "microsoft-surface-laptop-4-i5-1145g7-notebook-34-3-cm-touchscreen-intel-core-i5-8-gb-lpddr4x-sdram-512-gb-ssd-wi-fi-6-windows-10-pro-zwart.md";
  slug: "microsoft-surface-laptop-4-i5-1145g7-notebook-34-3-cm-touchscreen-intel-core-i5-8-gb-lpddr4x-sdram-512-gb-ssd-wi-fi-6-windows-10-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-4-i7-1185g7-notebook-38-1-cm-touchscreen-intel-core-i7-8-gb-lpddr4x-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-platina.md": {
	id: "microsoft-surface-laptop-4-i7-1185g7-notebook-38-1-cm-touchscreen-intel-core-i7-8-gb-lpddr4x-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-platina.md";
  slug: "microsoft-surface-laptop-4-i7-1185g7-notebook-38-1-cm-touchscreen-intel-core-i7-8-gb-lpddr4x-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-platina";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-4-platinum-i5-16gb-512gb-1689274.md": {
	id: "microsoft-surface-laptop-4-platinum-i5-16gb-512gb-1689274.md";
  slug: "microsoft-surface-laptop-4-platinum-i5-16gb-512gb-1689274";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-13-i5-16gb-512gb-black.md": {
	id: "microsoft-surface-laptop-5-13-i5-16gb-512gb-black.md";
  slug: "microsoft-surface-laptop-5-13-i5-16gb-512gb-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-13-i5-8gb-256gb-platinum.md": {
	id: "microsoft-surface-laptop-5-13-i5-8gb-256gb-platinum.md";
  slug: "microsoft-surface-laptop-5-13-i5-8gb-256gb-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-13-i5-8gb-512gb-black.md": {
	id: "microsoft-surface-laptop-5-13-i5-8gb-512gb-black.md";
  slug: "microsoft-surface-laptop-5-13-i5-8gb-512gb-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-13-i5-8gb-512gb-platinum.md": {
	id: "microsoft-surface-laptop-5-13-i5-8gb-512gb-platinum.md";
  slug: "microsoft-surface-laptop-5-13-i5-8gb-512gb-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-13-i7-16gb-512gb-black.md": {
	id: "microsoft-surface-laptop-5-13-i7-16gb-512gb-black.md";
  slug: "microsoft-surface-laptop-5-13-i7-16gb-512gb-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-15-i7-16gb-512gb-black.md": {
	id: "microsoft-surface-laptop-5-15-i7-16gb-512gb-black.md";
  slug: "microsoft-surface-laptop-5-15-i7-16gb-512gb-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-15-i7-16gb-512gb-platinum.md": {
	id: "microsoft-surface-laptop-5-15-i7-16gb-512gb-platinum.md";
  slug: "microsoft-surface-laptop-5-15-i7-16gb-512gb-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-15-i7-32gb-1tb-black.md": {
	id: "microsoft-surface-laptop-5-15-i7-32gb-1tb-black.md";
  slug: "microsoft-surface-laptop-5-15-i7-32gb-1tb-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-15-i7-8gb-256gb-platinum.md": {
	id: "microsoft-surface-laptop-5-15-i7-8gb-256gb-platinum.md";
  slug: "microsoft-surface-laptop-5-15-i7-8gb-256gb-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-i5-1235u-touchscreen-core-i5-8gb-512gb-platina.md": {
	id: "microsoft-surface-laptop-5-i5-1235u-touchscreen-core-i5-8gb-512gb-platina.md";
  slug: "microsoft-surface-laptop-5-i5-1235u-touchscreen-core-i5-8gb-512gb-platina";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-i5-1245u-notebook-34-3-cm-touchscreen-intel-core-i5-16-gb-lpddr5x-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-platina.md": {
	id: "microsoft-surface-laptop-5-i5-1245u-notebook-34-3-cm-touchscreen-intel-core-i5-16-gb-lpddr5x-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-platina.md";
  slug: "microsoft-surface-laptop-5-i5-1245u-notebook-34-3-cm-touchscreen-intel-core-i5-16-gb-lpddr5x-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-platina";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-i5-1245u-notebook-34-3-cm-touchscreen-intel-core-i5-16-gb-lpddr5x-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-zwart.md": {
	id: "microsoft-surface-laptop-5-i5-1245u-notebook-34-3-cm-touchscreen-intel-core-i5-16-gb-lpddr5x-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-zwart.md";
  slug: "microsoft-surface-laptop-5-i5-1245u-notebook-34-3-cm-touchscreen-intel-core-i5-16-gb-lpddr5x-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-i5-1245u-notebook-34-3-cm-touchscreen-intel-core-i5-16-gb-lpddr5x-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart.md": {
	id: "microsoft-surface-laptop-5-i5-1245u-notebook-34-3-cm-touchscreen-intel-core-i5-16-gb-lpddr5x-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart.md";
  slug: "microsoft-surface-laptop-5-i5-1245u-notebook-34-3-cm-touchscreen-intel-core-i5-16-gb-lpddr5x-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-i5-1245u-notebook-34-3-cm-touchscreen-intel-core-i5-8-gb-lpddr5x-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart.md": {
	id: "microsoft-surface-laptop-5-i5-1245u-notebook-34-3-cm-touchscreen-intel-core-i5-8-gb-lpddr5x-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart.md";
  slug: "microsoft-surface-laptop-5-i5-1245u-notebook-34-3-cm-touchscreen-intel-core-i5-8-gb-lpddr5x-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-i7-1265u-notebook-34-3-cm-touchscreen-intel-core-i7-16-gb-lpddr5x-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-platina.md": {
	id: "microsoft-surface-laptop-5-i7-1265u-notebook-34-3-cm-touchscreen-intel-core-i7-16-gb-lpddr5x-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-platina.md";
  slug: "microsoft-surface-laptop-5-i7-1265u-notebook-34-3-cm-touchscreen-intel-core-i7-16-gb-lpddr5x-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-platina";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-i7-1265u-notebook-38-1-cm-touchscreen-intel-core-i7-16-gb-lpddr5x-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-zwart.md": {
	id: "microsoft-surface-laptop-5-i7-1265u-notebook-38-1-cm-touchscreen-intel-core-i7-16-gb-lpddr5x-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-zwart.md";
  slug: "microsoft-surface-laptop-5-i7-1265u-notebook-38-1-cm-touchscreen-intel-core-i7-16-gb-lpddr5x-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-i7-1265u-notebook-38-1-cm-touchscreen-intel-core-i7-16-gb-lpddr5x-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-platina.md": {
	id: "microsoft-surface-laptop-5-i7-1265u-notebook-38-1-cm-touchscreen-intel-core-i7-16-gb-lpddr5x-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-platina.md";
  slug: "microsoft-surface-laptop-5-i7-1265u-notebook-38-1-cm-touchscreen-intel-core-i7-16-gb-lpddr5x-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-platina";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-i7-1265u-notebook-38-1-cm-touchscreen-intel-core-i7-16-gb-lpddr5x-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart.md": {
	id: "microsoft-surface-laptop-5-i7-1265u-notebook-38-1-cm-touchscreen-intel-core-i7-16-gb-lpddr5x-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart.md";
  slug: "microsoft-surface-laptop-5-i7-1265u-notebook-38-1-cm-touchscreen-intel-core-i7-16-gb-lpddr5x-sdram-512-gb-ssd-wi-fi-6-windows-11-pro-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-i7-1265u-notebook-38-1-cm-touchscreen-intel-core-i7-8-gb-lpddr5x-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-platina.md": {
	id: "microsoft-surface-laptop-5-i7-1265u-notebook-38-1-cm-touchscreen-intel-core-i7-8-gb-lpddr5x-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-platina.md";
  slug: "microsoft-surface-laptop-5-i7-1265u-notebook-38-1-cm-touchscreen-intel-core-i7-8-gb-lpddr5x-sdram-256-gb-ssd-wi-fi-6-windows-11-pro-platina";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-i7-1265u.md": {
	id: "microsoft-surface-laptop-5-i7-1265u.md";
  slug: "microsoft-surface-laptop-5-i7-1265u";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-notebook-touchscreen-i5-8gb-512gb-zwart-13-5-inch.md": {
	id: "microsoft-surface-laptop-5-notebook-touchscreen-i5-8gb-512gb-zwart-13-5-inch.md";
  slug: "microsoft-surface-laptop-5-notebook-touchscreen-i5-8gb-512gb-zwart-13-5-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-platinum-i5-8gb-256gb-1739101.md": {
	id: "microsoft-surface-laptop-5-platinum-i5-8gb-256gb-1739101.md";
  slug: "microsoft-surface-laptop-5-platinum-i5-8gb-256gb-1739101";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-platinum-i5-8gb-512gb-1739102.md": {
	id: "microsoft-surface-laptop-5-platinum-i5-8gb-512gb-1739102.md";
  slug: "microsoft-surface-laptop-5-platinum-i5-8gb-512gb-1739102";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-platinum-i7-16g-512gb-1739108.md": {
	id: "microsoft-surface-laptop-5-platinum-i7-16g-512gb-1739108.md";
  slug: "microsoft-surface-laptop-5-platinum-i7-16g-512gb-1739108";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-platinum-i7-8gb-256gb-1739107.md": {
	id: "microsoft-surface-laptop-5-platinum-i7-8gb-256gb-1739107.md";
  slug: "microsoft-surface-laptop-5-platinum-i7-8gb-256gb-1739107";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-qzi-00009-touchscreen-i5-8gb-256gb-platinum-13-5-inch.md": {
	id: "microsoft-surface-laptop-5-qzi-00009-touchscreen-i5-8gb-256gb-platinum-13-5-inch.md";
  slug: "microsoft-surface-laptop-5-qzi-00009-touchscreen-i5-8gb-256gb-platinum-13-5-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-r1s-00009-touchscreen-i5-8gb-512gb-platinum-13-5-inch.md": {
	id: "microsoft-surface-laptop-5-r1s-00009-touchscreen-i5-8gb-512gb-platinum-13-5-inch.md";
  slug: "microsoft-surface-laptop-5-r1s-00009-touchscreen-i5-8gb-512gb-platinum-13-5-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-rbg-00034-touchscreen-i7-16gb-512gb-zwart-13-5-inch.md": {
	id: "microsoft-surface-laptop-5-rbg-00034-touchscreen-i7-16gb-512gb-zwart-13-5-inch.md";
  slug: "microsoft-surface-laptop-5-rbg-00034-touchscreen-i7-16gb-512gb-zwart-13-5-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-rby-00009-touchscreen-i7-8gb-256gb-platinum-15-inch.md": {
	id: "microsoft-surface-laptop-5-rby-00009-touchscreen-i7-8gb-256gb-platinum-15-inch.md";
  slug: "microsoft-surface-laptop-5-rby-00009-touchscreen-i7-8gb-256gb-platinum-15-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-rip-00009-touchscreen-i7-16gb-512gb-platinum-15-inch.md": {
	id: "microsoft-surface-laptop-5-rip-00009-touchscreen-i7-16gb-512gb-platinum-15-inch.md";
  slug: "microsoft-surface-laptop-5-rip-00009-touchscreen-i7-16gb-512gb-platinum-15-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-rip-00034-touchscreen-i7-16gb-512gb-zwart-15-inch.md": {
	id: "microsoft-surface-laptop-5-rip-00034-touchscreen-i7-16gb-512gb-zwart-15-inch.md";
  slug: "microsoft-surface-laptop-5-rip-00034-touchscreen-i7-16gb-512gb-zwart-15-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-zwart-i5-16gb-512gb-1739104.md": {
	id: "microsoft-surface-laptop-5-zwart-i5-16gb-512gb-1739104.md";
  slug: "microsoft-surface-laptop-5-zwart-i5-16gb-512gb-1739104";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-zwart-i5-8gb-512gb-1739103.md": {
	id: "microsoft-surface-laptop-5-zwart-i5-8gb-512gb-1739103.md";
  slug: "microsoft-surface-laptop-5-zwart-i5-8gb-512gb-1739103";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-zwart-i7-16gb-512gb-1739105.md": {
	id: "microsoft-surface-laptop-5-zwart-i7-16gb-512gb-1739105.md";
  slug: "microsoft-surface-laptop-5-zwart-i7-16gb-512gb-1739105";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-5-zwart-i7-16gb-512gb-1739109.md": {
	id: "microsoft-surface-laptop-5-zwart-i7-16gb-512gb-1739109.md";
  slug: "microsoft-surface-laptop-5-zwart-i7-16gb-512gb-1739109";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-go-12-i5-8gb-256gb-platinum.md": {
	id: "microsoft-surface-laptop-go-12-i5-8gb-256gb-platinum.md";
  slug: "microsoft-surface-laptop-go-12-i5-8gb-256gb-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-go-3-124-inch-intel-core-i5-16-gb-256-gb-1771750.md": {
	id: "microsoft-surface-laptop-go-3-124-inch-intel-core-i5-16-gb-256-gb-1771750.md";
  slug: "microsoft-surface-laptop-go-3-124-inch-intel-core-i5-16-gb-256-gb-1771750";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-go-3-124-inch-intel-core-i5-8-gb-256-gb-1771752.md": {
	id: "microsoft-surface-laptop-go-3-124-inch-intel-core-i5-8-gb-256-gb-1771752.md";
  slug: "microsoft-surface-laptop-go-3-124-inch-intel-core-i5-8-gb-256-gb-1771752";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-go-3-i5-8gb-256gb-platinum.md": {
	id: "microsoft-surface-laptop-go-3-i5-8gb-256gb-platinum.md";
  slug: "microsoft-surface-laptop-go-3-i5-8gb-256gb-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-go-3-intel-core-i5-16gb-ram-256gb-ssd-12-4-inch-touchscreen-qwerty-platinum.md": {
	id: "microsoft-surface-laptop-go-3-intel-core-i5-16gb-ram-256gb-ssd-12-4-inch-touchscreen-qwerty-platinum.md";
  slug: "microsoft-surface-laptop-go-3-intel-core-i5-16gb-ram-256gb-ssd-12-4-inch-touchscreen-qwerty-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-go-3-intel-core-i5-8gb-ram-256gb-ssd-12-4-inch-touchscreen-qwerty-platinum.md": {
	id: "microsoft-surface-laptop-go-3-intel-core-i5-8gb-ram-256gb-ssd-12-4-inch-touchscreen-qwerty-platinum.md";
  slug: "microsoft-surface-laptop-go-3-intel-core-i5-8gb-ram-256gb-ssd-12-4-inch-touchscreen-qwerty-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-go-intel-core-i5-12-4-inch-128-gb-platinum.md": {
	id: "microsoft-surface-laptop-go-intel-core-i5-12-4-inch-128-gb-platinum.md";
  slug: "microsoft-surface-laptop-go-intel-core-i5-12-4-inch-128-gb-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-go-notebook-12-4-touchscreen-intel-core-i5-windows-11-pro-uk.md": {
	id: "microsoft-surface-laptop-go-notebook-12-4-touchscreen-intel-core-i5-windows-11-pro-uk.md";
  slug: "microsoft-surface-laptop-go-notebook-12-4-touchscreen-intel-core-i5-windows-11-pro-uk";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-studio-2-144-inch-intel-core-i7-16-gb-512-gb-1771755.md": {
	id: "microsoft-surface-laptop-studio-2-144-inch-intel-core-i7-16-gb-512-gb-1771755.md";
  slug: "microsoft-surface-laptop-studio-2-144-inch-intel-core-i7-16-gb-512-gb-1771755";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-studio-2-144-inch-intel-core-i7-32-gb-1-tb-geforce-rtx-4050-1771754.md": {
	id: "microsoft-surface-laptop-studio-2-144-inch-intel-core-i7-32-gb-1-tb-geforce-rtx-4050-1771754.md";
  slug: "microsoft-surface-laptop-studio-2-144-inch-intel-core-i7-32-gb-1-tb-geforce-rtx-4050-1771754";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-studio-2-i7-16gb-512gb-geforce-rtx-4050.md": {
	id: "microsoft-surface-laptop-studio-2-i7-16gb-512gb-geforce-rtx-4050.md";
  slug: "microsoft-surface-laptop-studio-2-i7-16gb-512gb-geforce-rtx-4050";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-studio-2-i7-16gb-512gb-intel-iris-xe.md": {
	id: "microsoft-surface-laptop-studio-2-i7-16gb-512gb-intel-iris-xe.md";
  slug: "microsoft-surface-laptop-studio-2-i7-16gb-512gb-intel-iris-xe";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-studio-2-i7-32gb-1tb-geforce-rtx-4050.md": {
	id: "microsoft-surface-laptop-studio-2-i7-32gb-1tb-geforce-rtx-4050.md";
  slug: "microsoft-surface-laptop-studio-2-i7-32gb-1tb-geforce-rtx-4050";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-studio-2-intel-core-i7-16gb-ram-512gb-ssd-igpu-14-4-inch-touchscreen-qwerty-platinum.md": {
	id: "microsoft-surface-laptop-studio-2-intel-core-i7-16gb-ram-512gb-ssd-igpu-14-4-inch-touchscreen-qwerty-platinum.md";
  slug: "microsoft-surface-laptop-studio-2-intel-core-i7-16gb-ram-512gb-ssd-igpu-14-4-inch-touchscreen-qwerty-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-studio-2-intel-core-i7-16gb-ram-512gb-ssd-rtx4050-14-4-inch-touchscreen-qwerty-platinum.md": {
	id: "microsoft-surface-laptop-studio-2-intel-core-i7-16gb-ram-512gb-ssd-rtx4050-14-4-inch-touchscreen-qwerty-platinum.md";
  slug: "microsoft-surface-laptop-studio-2-intel-core-i7-16gb-ram-512gb-ssd-rtx4050-14-4-inch-touchscreen-qwerty-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-studio-i5-16gb-256gb-platinum-1715532.md": {
	id: "microsoft-surface-laptop-studio-i5-16gb-256gb-platinum-1715532.md";
  slug: "microsoft-surface-laptop-studio-i5-16gb-256gb-platinum-1715532";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-studio-i5-16gb-256gb-ssd-platina-grijs.md": {
	id: "microsoft-surface-laptop-studio-i5-16gb-256gb-ssd-platina-grijs.md";
  slug: "microsoft-surface-laptop-studio-i5-16gb-256gb-ssd-platina-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-studio-i5-16gb-512gb-ssd-platina-grijs.md": {
	id: "microsoft-surface-laptop-studio-i5-16gb-512gb-ssd-platina-grijs.md";
  slug: "microsoft-surface-laptop-studio-i5-16gb-512gb-ssd-platina-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-laptop-studio-i7-16gb-512gb-platina-grijs.md": {
	id: "microsoft-surface-laptop-studio-i7-16gb-512gb-platina-grijs.md";
  slug: "microsoft-surface-laptop-studio-i7-16gb-512gb-platina-grijs";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-7-12-3-gebruikt-i5-1035g4-8gb-256gb-platinum-incl-uk-qwerty-keyboard-gebruikt-bevat-gebruikssporen.md": {
	id: "microsoft-surface-pro-7-12-3-gebruikt-i5-1035g4-8gb-256gb-platinum-incl-uk-qwerty-keyboard-gebruikt-bevat-gebruikssporen.md";
  slug: "microsoft-surface-pro-7-12-3-gebruikt-i5-1035g4-8gb-256gb-platinum-incl-uk-qwerty-keyboard-gebruikt-bevat-gebruikssporen";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-7-lte-i5-16-256-platinow10p-new.md": {
	id: "microsoft-surface-pro-7-lte-i5-16-256-platinow10p-new.md";
  slug: "microsoft-surface-pro-7-lte-i5-16-256-platinow10p-new";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-8-512-gb-platinum-1715537.md": {
	id: "microsoft-surface-pro-8-512-gb-platinum-1715537.md";
  slug: "microsoft-surface-pro-8-512-gb-platinum-1715537";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-8-i5-8gb-128gb-ssd-platinum.md": {
	id: "microsoft-surface-pro-8-i5-8gb-128gb-ssd-platinum.md";
  slug: "microsoft-surface-pro-8-i5-8gb-128gb-ssd-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-8-i5-8gb-512gb-ssd-graphite.md": {
	id: "microsoft-surface-pro-8-i5-8gb-512gb-ssd-graphite.md";
  slug: "microsoft-surface-pro-8-i5-8gb-512gb-ssd-graphite";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-8-i7-32gb-1tb-ssd-platinum.md": {
	id: "microsoft-surface-pro-8-i7-32gb-1tb-ssd-platinum.md";
  slug: "microsoft-surface-pro-8-i7-32gb-1tb-ssd-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-13-intel-core-i5-16gb-ram-256gb-ssd-graphite.md": {
	id: "microsoft-surface-pro-9-13-intel-core-i5-16gb-ram-256gb-ssd-graphite.md";
  slug: "microsoft-surface-pro-9-13-intel-core-i5-16gb-ram-256gb-ssd-graphite";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-13-intel-core-i5-16gb-ram-256gb-ssd-platinum.md": {
	id: "microsoft-surface-pro-9-13-intel-core-i5-16gb-ram-256gb-ssd-platinum.md";
  slug: "microsoft-surface-pro-9-13-intel-core-i5-16gb-ram-256gb-ssd-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-13-intel-core-i5-8gb-ram-256gb-ssd-forest.md": {
	id: "microsoft-surface-pro-9-13-intel-core-i5-8gb-ram-256gb-ssd-forest.md";
  slug: "microsoft-surface-pro-9-13-intel-core-i5-8gb-ram-256gb-ssd-forest";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-13-intel-core-i5-8gb-ram-256gb-ssd-graphite.md": {
	id: "microsoft-surface-pro-9-13-intel-core-i5-8gb-ram-256gb-ssd-graphite.md";
  slug: "microsoft-surface-pro-9-13-intel-core-i5-8gb-ram-256gb-ssd-graphite";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-13-intel-core-i5-8gb-ram-256gb-ssd-sapphire.md": {
	id: "microsoft-surface-pro-9-13-intel-core-i5-8gb-ram-256gb-ssd-sapphire.md";
  slug: "microsoft-surface-pro-9-13-intel-core-i5-8gb-ram-256gb-ssd-sapphire";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-13-intel-core-i7-16gb-ram-1tb-ssd-platinum.md": {
	id: "microsoft-surface-pro-9-13-intel-core-i7-16gb-ram-1tb-ssd-platinum.md";
  slug: "microsoft-surface-pro-9-13-intel-core-i7-16gb-ram-1tb-ssd-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-13-intel-core-i7-16gb-ram-256gb-ssd-graphite.md": {
	id: "microsoft-surface-pro-9-13-intel-core-i7-16gb-ram-256gb-ssd-graphite.md";
  slug: "microsoft-surface-pro-9-13-intel-core-i7-16gb-ram-256gb-ssd-graphite";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-13-intel-core-i7-16gb-ram-256gb-ssd-platinum.md": {
	id: "microsoft-surface-pro-9-13-intel-core-i7-16gb-ram-256gb-ssd-platinum.md";
  slug: "microsoft-surface-pro-9-13-intel-core-i7-16gb-ram-256gb-ssd-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-13-intel-core-i7-16gb-ram-512gb-ssd-platinum.md": {
	id: "microsoft-surface-pro-9-13-intel-core-i7-16gb-ram-512gb-ssd-platinum.md";
  slug: "microsoft-surface-pro-9-13-intel-core-i7-16gb-ram-512gb-ssd-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-2-in-1-touchscreen-i5-8gb-256gb-platinum-13-inch.md": {
	id: "microsoft-surface-pro-9-2-in-1-touchscreen-i5-8gb-256gb-platinum-13-inch.md";
  slug: "microsoft-surface-pro-9-2-in-1-touchscreen-i5-8gb-256gb-platinum-13-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-2-in-1-touchscreen-i5-8gb-256gb-sapphire-blauw-13-inch.md": {
	id: "microsoft-surface-pro-9-2-in-1-touchscreen-i5-8gb-256gb-sapphire-blauw-13-inch.md";
  slug: "microsoft-surface-pro-9-2-in-1-touchscreen-i5-8gb-256gb-sapphire-blauw-13-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-2-in-1-touchscreen-i5-8gb-256gb-zwart-13-inch.md": {
	id: "microsoft-surface-pro-9-2-in-1-touchscreen-i5-8gb-256gb-zwart-13-inch.md";
  slug: "microsoft-surface-pro-9-2-in-1-touchscreen-i5-8gb-256gb-zwart-13-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-2-in-1-touchscreen-i7-16gb-256gb-13-inch-signature-cover-qwerty-zwart.md": {
	id: "microsoft-surface-pro-9-2-in-1-touchscreen-i7-16gb-256gb-13-inch-signature-cover-qwerty-zwart.md";
  slug: "microsoft-surface-pro-9-2-in-1-touchscreen-i7-16gb-256gb-13-inch-signature-cover-qwerty-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-2-in-1-touchscreen-i7-16gb-256gb-platinum-13-inch.md": {
	id: "microsoft-surface-pro-9-2-in-1-touchscreen-i7-16gb-256gb-platinum-13-inch.md";
  slug: "microsoft-surface-pro-9-2-in-1-touchscreen-i7-16gb-256gb-platinum-13-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-2-in-1-touchscreen-i7-16gb-256gb-zwart-13-inch.md": {
	id: "microsoft-surface-pro-9-2-in-1-touchscreen-i7-16gb-256gb-zwart-13-inch.md";
  slug: "microsoft-surface-pro-9-2-in-1-touchscreen-i7-16gb-256gb-zwart-13-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-blauw-i5-8gb-256gb-1739090.md": {
	id: "microsoft-surface-pro-9-blauw-i5-8gb-256gb-1739090.md";
  slug: "microsoft-surface-pro-9-blauw-i5-8gb-256gb-1739090";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-groen-i5-8gb-256gb-1739091.md": {
	id: "microsoft-surface-pro-9-groen-i5-8gb-256gb-1739091.md";
  slug: "microsoft-surface-pro-9-groen-i5-8gb-256gb-1739091";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-platinum-i5-16gb-256gb-1739092.md": {
	id: "microsoft-surface-pro-9-platinum-i5-16gb-256gb-1739092.md";
  slug: "microsoft-surface-pro-9-platinum-i5-16gb-256gb-1739092";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-platinum-i5-8gb-256gb-1739088.md": {
	id: "microsoft-surface-pro-9-platinum-i5-8gb-256gb-1739088.md";
  slug: "microsoft-surface-pro-9-platinum-i5-8gb-256gb-1739088";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-platinum-i7-16gb-1tb-1739097.md": {
	id: "microsoft-surface-pro-9-platinum-i7-16gb-1tb-1739097.md";
  slug: "microsoft-surface-pro-9-platinum-i7-16gb-1tb-1739097";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-platinum-i7-16gb-256gb-1739094.md": {
	id: "microsoft-surface-pro-9-platinum-i7-16gb-256gb-1739094.md";
  slug: "microsoft-surface-pro-9-platinum-i7-16gb-256gb-1739094";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-graphite-signature-type-cover-pen-qwerty-platinum.md": {
	id: "microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-graphite-signature-type-cover-pen-qwerty-platinum.md";
  slug: "microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-graphite-signature-type-cover-pen-qwerty-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-graphite-signature-type-cover-pen-qwerty-poppy-red.md": {
	id: "microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-graphite-signature-type-cover-pen-qwerty-poppy-red.md";
  slug: "microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-graphite-signature-type-cover-pen-qwerty-poppy-red";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-graphite-signature-type-cover-qwerty-zwart.md": {
	id: "microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-graphite-signature-type-cover-qwerty-zwart.md";
  slug: "microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-graphite-signature-type-cover-qwerty-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-platinum-signature-type-cover-pen-qwerty-platinum.md": {
	id: "microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-platinum-signature-type-cover-pen-qwerty-platinum.md";
  slug: "microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-platinum-signature-type-cover-pen-qwerty-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-platinum-signature-type-cover-pen-qwerty-poppy-red.md": {
	id: "microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-platinum-signature-type-cover-pen-qwerty-poppy-red.md";
  slug: "microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-platinum-signature-type-cover-pen-qwerty-poppy-red";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-platinum-signature-type-cover-qwerty-zwart.md": {
	id: "microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-platinum-signature-type-cover-qwerty-zwart.md";
  slug: "microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-platinum-signature-type-cover-qwerty-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-sapphire-signature-type-cover-pen-qwerty-platinum.md": {
	id: "microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-sapphire-signature-type-cover-pen-qwerty-platinum.md";
  slug: "microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-sapphire-signature-type-cover-pen-qwerty-platinum";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-sapphire-signature-type-cover-pen-qwerty-poppy-red.md": {
	id: "microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-sapphire-signature-type-cover-pen-qwerty-poppy-red.md";
  slug: "microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-sapphire-signature-type-cover-pen-qwerty-poppy-red";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-sapphire-signature-type-cover-qwerty-zwart.md": {
	id: "microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-sapphire-signature-type-cover-qwerty-zwart.md";
  slug: "microsoft-surface-pro-9-touchscreen-i5-8gb-256gb-13-inch-sapphire-signature-type-cover-qwerty-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-zwart-i5-16gb-256gb-1739093.md": {
	id: "microsoft-surface-pro-9-zwart-i5-16gb-256gb-1739093.md";
  slug: "microsoft-surface-pro-9-zwart-i5-16gb-256gb-1739093";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9-zwart-i5-8gb-256gb-1739089.md": {
	id: "microsoft-surface-pro-9-zwart-i5-8gb-256gb-1739089.md";
  slug: "microsoft-surface-pro-9-zwart-i5-8gb-256gb-1739089";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"microsoft-surface-pro-9.md": {
	id: "microsoft-surface-pro-9.md";
  slug: "microsoft-surface-pro-9";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-alpha-17-c7vf-012nl-gaming-laptop-17-3-inch-240-hz-2.md": {
	id: "msi-alpha-17-c7vf-012nl-gaming-laptop-17-3-inch-240-hz-2.md";
  slug: "msi-alpha-17-c7vf-012nl-gaming-laptop-17-3-inch-240-hz-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-alpha-17-c7vf-012nl-gaming-laptop-17-3-inch-240-hz.md": {
	id: "msi-alpha-17-c7vf-012nl-gaming-laptop-17-3-inch-240-hz.md";
  slug: "msi-alpha-17-c7vf-012nl-gaming-laptop-17-3-inch-240-hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-alpha-17-c7vg-010nl-gaming-laptop-ryzen-9-7945hx-rtx-4070-16-gb-1-tb-ssd.md": {
	id: "msi-alpha-17-c7vg-010nl-gaming-laptop-ryzen-9-7945hx-rtx-4070-16-gb-1-tb-ssd.md";
  slug: "msi-alpha-17-c7vg-010nl-gaming-laptop-ryzen-9-7945hx-rtx-4070-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-creator-m16-b12udx-483nl-16-fhd-144hz-i7-12650h-3050-16gb-1tb.md": {
	id: "msi-creator-m16-b12udx-483nl-16-fhd-144hz-i7-12650h-3050-16gb-1tb.md";
  slug: "msi-creator-m16-b12udx-483nl-16-fhd-144hz-i7-12650h-3050-16gb-1tb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-creator-m16-b12udx-483nl-16-inch-wuxga-intel-core-i7-16-gb-1-tb-geforce-rtx-3050-1769377.md": {
	id: "msi-creator-m16-b12udx-483nl-16-inch-wuxga-intel-core-i7-16-gb-1-tb-geforce-rtx-3050-1769377.md";
  slug: "msi-creator-m16-b12udx-483nl-16-inch-wuxga-intel-core-i7-16-gb-1-tb-geforce-rtx-3050-1769377";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-creator-z16-a11ue-062nl-creator-laptop-16-inch-120hz.md": {
	id: "msi-creator-z16-a11ue-062nl-creator-laptop-16-inch-120hz.md";
  slug: "msi-creator-z16-a11ue-062nl-creator-laptop-16-inch-120hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-creator-z16-hx-studio-b13vfto-024nl-laptop-i7-13700hx-rtx-4060-32-gb-2-tb-ssd-touch.md": {
	id: "msi-creator-z16-hx-studio-b13vfto-024nl-laptop-i7-13700hx-rtx-4060-32-gb-2-tb-ssd-touch.md";
  slug: "msi-creator-z16-hx-studio-b13vfto-024nl-laptop-i7-13700hx-rtx-4060-32-gb-2-tb-ssd-touch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-creator-z16-hx-studio-b13vfto-024nl.md": {
	id: "msi-creator-z16-hx-studio-b13vfto-024nl.md";
  slug: "msi-creator-z16-hx-studio-b13vfto-024nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-creator-z16-hx-studio-b13vgto-022nl.md": {
	id: "msi-creator-z16-hx-studio-b13vgto-022nl.md";
  slug: "msi-creator-z16-hx-studio-b13vgto-022nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-creator-z16p-b12ugst-018nl-creator-laptop-16-inch-165hz.md": {
	id: "msi-creator-z16p-b12ugst-018nl-creator-laptop-16-inch-165hz.md";
  slug: "msi-creator-z16p-b12ugst-018nl-creator-laptop-16-inch-165hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-creator-z16p-b12ugst-020nl-creator-laptop-16-inch-165hz.md": {
	id: "msi-creator-z16p-b12ugst-020nl-creator-laptop-16-inch-165hz.md";
  slug: "msi-creator-z16p-b12ugst-020nl-creator-laptop-16-inch-165hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-creator-z17hx-studio-a13vft-070nl-17-inch-wqxga-intel-core-i7-16-gb-1-tb-geforce-rtx-4060-1757675.md": {
	id: "msi-creator-z17hx-studio-a13vft-070nl-17-inch-wqxga-intel-core-i7-16-gb-1-tb-geforce-rtx-4060-1757675.md";
  slug: "msi-creator-z17hx-studio-a13vft-070nl-17-inch-wqxga-intel-core-i7-16-gb-1-tb-geforce-rtx-4060-1757675";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-creator-z17hxstudio-a13vft-013nl.md": {
	id: "msi-creator-z17hxstudio-a13vft-013nl.md";
  slug: "msi-creator-z17hxstudio-a13vft-013nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-crosshair-15-c12vg-238nl-gaming-laptop-i7-12650h-rtx-4070-16-gb-1-tb-ssd.md": {
	id: "msi-crosshair-15-c12vg-238nl-gaming-laptop-i7-12650h-rtx-4070-16-gb-1-tb-ssd.md";
  slug: "msi-crosshair-15-c12vg-238nl-gaming-laptop-i7-12650h-rtx-4070-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-creator-m16-b13ve-482nl.md": {
	id: "msi-gaming-laptop-creator-m16-b13ve-482nl.md";
  slug: "msi-gaming-laptop-creator-m16-b13ve-482nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-creator-z16hxstudio-b13vfto-024nl.md": {
	id: "msi-gaming-laptop-creator-z16hxstudio-b13vfto-024nl.md";
  slug: "msi-gaming-laptop-creator-z16hxstudio-b13vfto-024nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-creator-z16hxstudio-b13vgto-022nl.md": {
	id: "msi-gaming-laptop-creator-z16hxstudio-b13vgto-022nl.md";
  slug: "msi-gaming-laptop-creator-z16hxstudio-b13vgto-022nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-creator-z17hxstudio-a13vft-013nl.md": {
	id: "msi-gaming-laptop-creator-z17hxstudio-a13vft-013nl.md";
  slug: "msi-gaming-laptop-creator-z17hxstudio-a13vft-013nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-gf63-thin-11uc-453nl.md": {
	id: "msi-gaming-laptop-gf63-thin-11uc-453nl.md";
  slug: "msi-gaming-laptop-gf63-thin-11uc-453nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-katana-15-b13vgk-1448nl.md": {
	id: "msi-gaming-laptop-katana-15-b13vgk-1448nl.md";
  slug: "msi-gaming-laptop-katana-15-b13vgk-1448nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-katana-17-b13vgk-832nl.md": {
	id: "msi-gaming-laptop-katana-17-b13vgk-832nl.md";
  slug: "msi-gaming-laptop-katana-17-b13vgk-832nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-modern-14-c12m-634nl.md": {
	id: "msi-gaming-laptop-modern-14-c12m-634nl.md";
  slug: "msi-gaming-laptop-modern-14-c12m-634nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-modern-14-c13m-420nl.md": {
	id: "msi-gaming-laptop-modern-14-c13m-420nl.md";
  slug: "msi-gaming-laptop-modern-14-c13m-420nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-modern-14-c13m-422nl.md": {
	id: "msi-gaming-laptop-modern-14-c13m-422nl.md";
  slug: "msi-gaming-laptop-modern-14-c13m-422nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-modern-14-c7m-046nl.md": {
	id: "msi-gaming-laptop-modern-14-c7m-046nl.md";
  slug: "msi-gaming-laptop-modern-14-c7m-046nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-modern-15-b13m-273nl.md": {
	id: "msi-gaming-laptop-modern-15-b13m-273nl.md";
  slug: "msi-gaming-laptop-modern-15-b13m-273nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-prestige-13evo-a13m-059nl.md": {
	id: "msi-gaming-laptop-prestige-13evo-a13m-059nl.md";
  slug: "msi-gaming-laptop-prestige-13evo-a13m-059nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-prestige-13evo-a13m-093nl.md": {
	id: "msi-gaming-laptop-prestige-13evo-a13m-093nl.md";
  slug: "msi-gaming-laptop-prestige-13evo-a13m-093nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-prestige-14evo-b13m-272nl.md": {
	id: "msi-gaming-laptop-prestige-14evo-b13m-272nl.md";
  slug: "msi-gaming-laptop-prestige-14evo-b13m-272nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-prestige-14evo-b13m-274nl.md": {
	id: "msi-gaming-laptop-prestige-14evo-b13m-274nl.md";
  slug: "msi-gaming-laptop-prestige-14evo-b13m-274nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-prestige-16studio-a13ve-051nl.md": {
	id: "msi-gaming-laptop-prestige-16studio-a13ve-051nl.md";
  slug: "msi-gaming-laptop-prestige-16studio-a13ve-051nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-prestige-16studio-a13vf-049nl.md": {
	id: "msi-gaming-laptop-prestige-16studio-a13vf-049nl.md";
  slug: "msi-gaming-laptop-prestige-16studio-a13vf-049nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-raider-ge68hx-13vg-084nl.md": {
	id: "msi-gaming-laptop-raider-ge68hx-13vg-084nl.md";
  slug: "msi-gaming-laptop-raider-ge68hx-13vg-084nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-raider-ge78hx-13vh-254nl.md": {
	id: "msi-gaming-laptop-raider-ge78hx-13vh-254nl.md";
  slug: "msi-gaming-laptop-raider-ge78hx-13vh-254nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-raider-ge78hx-13vi-242nl.md": {
	id: "msi-gaming-laptop-raider-ge78hx-13vi-242nl.md";
  slug: "msi-gaming-laptop-raider-ge78hx-13vi-242nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-summit-e13flipevo-a13mt-222nl.md": {
	id: "msi-gaming-laptop-summit-e13flipevo-a13mt-222nl.md";
  slug: "msi-gaming-laptop-summit-e13flipevo-a13mt-222nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-summit-e14evo-a12m-021nl.md": {
	id: "msi-gaming-laptop-summit-e14evo-a12m-021nl.md";
  slug: "msi-gaming-laptop-summit-e14evo-a12m-021nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-summit-e16flipevo-a12mt-014nl.md": {
	id: "msi-gaming-laptop-summit-e16flipevo-a12mt-014nl.md";
  slug: "msi-gaming-laptop-summit-e16flipevo-a12mt-014nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-thin-gf63-12uc-683nl.md": {
	id: "msi-gaming-laptop-thin-gf63-12uc-683nl.md";
  slug: "msi-gaming-laptop-thin-gf63-12uc-683nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-thin-gf63-12uc-685nl.md": {
	id: "msi-gaming-laptop-thin-gf63-12uc-685nl.md";
  slug: "msi-gaming-laptop-thin-gf63-12uc-685nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-thin-gf63-12vf-270nl.md": {
	id: "msi-gaming-laptop-thin-gf63-12vf-270nl.md";
  slug: "msi-gaming-laptop-thin-gf63-12vf-270nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-thin-gf63-12vf-272nl.md": {
	id: "msi-gaming-laptop-thin-gf63-12vf-272nl.md";
  slug: "msi-gaming-laptop-thin-gf63-12vf-272nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-vector-gp68hx-13vg-086nl.md": {
	id: "msi-gaming-laptop-vector-gp68hx-13vg-086nl.md";
  slug: "msi-gaming-laptop-vector-gp68hx-13vg-086nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gaming-laptop-vector-gp78hx-13vh-222nl.md": {
	id: "msi-gaming-laptop-vector-gp78hx-13vh-222nl.md";
  slug: "msi-gaming-laptop-vector-gp78hx-13vh-222nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-gf63-thin-11uc-873nl-gaming-laptop-15-6-inch-144hz.md": {
	id: "msi-gf63-thin-11uc-873nl-gaming-laptop-15-6-inch-144hz.md";
  slug: "msi-gf63-thin-11uc-873nl-gaming-laptop-15-6-inch-144hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-15-b12vgk-008nl-gaming-laptop-15-6-inch-144hz.md": {
	id: "msi-katana-15-b12vgk-008nl-gaming-laptop-15-6-inch-144hz.md";
  slug: "msi-katana-15-b12vgk-008nl-gaming-laptop-15-6-inch-144hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-15-b12vgk-008nl.md": {
	id: "msi-katana-15-b12vgk-008nl.md";
  slug: "msi-katana-15-b12vgk-008nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-15-b12vgk-653nl-15-inch-full-hd-1920x1080-intel-core-i7-16-gb-512-gb-geforce-rtx-4070-1757674.md": {
	id: "msi-katana-15-b12vgk-653nl-15-inch-full-hd-1920x1080-intel-core-i7-16-gb-512-gb-geforce-rtx-4070-1757674.md";
  slug: "msi-katana-15-b12vgk-653nl-15-inch-full-hd-1920x1080-intel-core-i7-16-gb-512-gb-geforce-rtx-4070-1757674";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-15-b13vek-010nl-156-inch-intel-core-i7-16-gb-1-tb-geforce-rtx-4050-1752310.md": {
	id: "msi-katana-15-b13vek-010nl-156-inch-intel-core-i7-16-gb-1-tb-geforce-rtx-4050-1752310.md";
  slug: "msi-katana-15-b13vek-010nl-156-inch-intel-core-i7-16-gb-1-tb-geforce-rtx-4050-1752310";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-15-b13vek-010nl-gaming-laptop-15-6-inch-144hz.md": {
	id: "msi-katana-15-b13vek-010nl-gaming-laptop-15-6-inch-144hz.md";
  slug: "msi-katana-15-b13vek-010nl-gaming-laptop-15-6-inch-144hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-15-b13vek-010nl.md": {
	id: "msi-katana-15-b13vek-010nl.md";
  slug: "msi-katana-15-b13vek-010nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-15-b13vfk-012nl-156-inch-intel-core-i7-16-gb-1-tb-geforce-rtx-4060-1752311.md": {
	id: "msi-katana-15-b13vfk-012nl-156-inch-intel-core-i7-16-gb-1-tb-geforce-rtx-4060-1752311.md";
  slug: "msi-katana-15-b13vfk-012nl-156-inch-intel-core-i7-16-gb-1-tb-geforce-rtx-4060-1752311";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-15-b13vfk-012nl-gaming-laptop-15-6-inch-144hz.md": {
	id: "msi-katana-15-b13vfk-012nl-gaming-laptop-15-6-inch-144hz.md";
  slug: "msi-katana-15-b13vfk-012nl-gaming-laptop-15-6-inch-144hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-15-b13vfk-012nl.md": {
	id: "msi-katana-15-b13vfk-012nl.md";
  slug: "msi-katana-15-b13vfk-012nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-15-b13vgk-1448nl-15-inch-full-hd-intel-core-i7-16-gb-1-tb-geforce-rtx-4070-1769369.md": {
	id: "msi-katana-15-b13vgk-1448nl-15-inch-full-hd-intel-core-i7-16-gb-1-tb-geforce-rtx-4070-1769369.md";
  slug: "msi-katana-15-b13vgk-1448nl-15-inch-full-hd-intel-core-i7-16-gb-1-tb-geforce-rtx-4070-1769369";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-15-b13vgk-1448nl-gaming-laptop-core-i7-13700h-rtx-4070-16-gb-1-tb-ssd.md": {
	id: "msi-katana-15-b13vgk-1448nl-gaming-laptop-core-i7-13700h-rtx-4070-16-gb-1-tb-ssd.md";
  slug: "msi-katana-15-b13vgk-1448nl-gaming-laptop-core-i7-13700h-rtx-4070-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-15-b13vgk-1448nl.md": {
	id: "msi-katana-15-b13vgk-1448nl.md";
  slug: "msi-katana-15-b13vgk-1448nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-17-b12ucxk-009nl-gaming-laptop-17-3-inch-144hz.md": {
	id: "msi-katana-17-b12ucxk-009nl-gaming-laptop-17-3-inch-144hz.md";
  slug: "msi-katana-17-b12ucxk-009nl-gaming-laptop-17-3-inch-144hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-17-b12vfk-635nl.md": {
	id: "msi-katana-17-b12vfk-635nl.md";
  slug: "msi-katana-17-b12vfk-635nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-17-b12vgk-013nl-gaming-laptop-17-3-inch-144hz.md": {
	id: "msi-katana-17-b12vgk-013nl-gaming-laptop-17-3-inch-144hz.md";
  slug: "msi-katana-17-b12vgk-013nl-gaming-laptop-17-3-inch-144hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-17-b12vgk-013nl.md": {
	id: "msi-katana-17-b12vgk-013nl.md";
  slug: "msi-katana-17-b12vgk-013nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-17-b13vek-017nl-gaming-laptop-17-3-inch-144hz.md": {
	id: "msi-katana-17-b13vek-017nl-gaming-laptop-17-3-inch-144hz.md";
  slug: "msi-katana-17-b13vek-017nl-gaming-laptop-17-3-inch-144hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-17-b13vek-017nl.md": {
	id: "msi-katana-17-b13vek-017nl.md";
  slug: "msi-katana-17-b13vek-017nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-17-b13vfk-020nl-gaming-laptop-17-3-inch-144hz.md": {
	id: "msi-katana-17-b13vfk-020nl-gaming-laptop-17-3-inch-144hz.md";
  slug: "msi-katana-17-b13vfk-020nl-gaming-laptop-17-3-inch-144hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-17-b13vgk-832nl-gaming-laptop-core-i7-13700h-rtx-4070-16-gb-1-tb-ssd.md": {
	id: "msi-katana-17-b13vgk-832nl-gaming-laptop-core-i7-13700h-rtx-4070-16-gb-1-tb-ssd.md";
  slug: "msi-katana-17-b13vgk-832nl-gaming-laptop-core-i7-13700h-rtx-4070-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-17-b13vgk-832nl.md": {
	id: "msi-katana-17-b13vgk-832nl.md";
  slug: "msi-katana-17-b13vgk-832nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-gf66-12uc-1010nl-156-inch-intel-core-i5-16-gb-512-gb-geforce-rtx-3050-1758130.md": {
	id: "msi-katana-gf66-12uc-1010nl-156-inch-intel-core-i5-16-gb-512-gb-geforce-rtx-3050-1758130.md";
  slug: "msi-katana-gf66-12uc-1010nl-156-inch-intel-core-i5-16-gb-512-gb-geforce-rtx-3050-1758130";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-katana-gf66-12ugszok-875nl-gaming-laptop-15-6-inch-144hz.md": {
	id: "msi-katana-gf66-12ugszok-875nl-gaming-laptop-15-6-inch-144hz.md";
  slug: "msi-katana-gf66-12ugszok-875nl-gaming-laptop-15-6-inch-144hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-laptop-modern-15-b12m-412nl-intel-core-i7-1255u-16gb-ddr4-512gb-ssd.md": {
	id: "msi-laptop-modern-15-b12m-412nl-intel-core-i7-1255u-16gb-ddr4-512gb-ssd.md";
  slug: "msi-laptop-modern-15-b12m-412nl-intel-core-i7-1255u-16gb-ddr4-512gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-laptop-modern-15-b12m-414nl-intel-core-i5-1235u-8gb-ddr4-512gb-ssd.md": {
	id: "msi-laptop-modern-15-b12m-414nl-intel-core-i5-1235u-8gb-ddr4-512gb-ssd.md";
  slug: "msi-laptop-modern-15-b12m-414nl-intel-core-i5-1235u-8gb-ddr4-512gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-modern-14-c12m-040nl-laptop-14-inch.md": {
	id: "msi-modern-14-c12m-040nl-laptop-14-inch.md";
  slug: "msi-modern-14-c12m-040nl-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-modern-14-c13m-422nl-1756093.md": {
	id: "msi-modern-14-c13m-422nl-1756093.md";
  slug: "msi-modern-14-c13m-422nl-1756093";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-modern-15-a11mu-1031nl-1719527.md": {
	id: "msi-modern-15-a11mu-1031nl-1719527.md";
  slug: "msi-modern-15-a11mu-1031nl-1719527";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-modern-15-b12m-414nl-156-inch-full-hd-1920-x-1080-intel-core-i5-8-gb-512-gb-1768655.md": {
	id: "msi-modern-15-b12m-414nl-156-inch-full-hd-1920-x-1080-intel-core-i5-8-gb-512-gb-1768655.md";
  slug: "msi-modern-15-b12m-414nl-156-inch-full-hd-1920-x-1080-intel-core-i5-8-gb-512-gb-1768655";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-modern-15-b13m-269nl.md": {
	id: "msi-modern-15-b13m-269nl.md";
  slug: "msi-modern-15-b13m-269nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-modern-15-b13m-271nl-1756090.md": {
	id: "msi-modern-15-b13m-271nl-1756090.md";
  slug: "msi-modern-15-b13m-271nl-1756090";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-modern-15-b13m-271nl.md": {
	id: "msi-modern-15-b13m-271nl.md";
  slug: "msi-modern-15-b13m-271nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-modern-15-b7m-047nl-15-60hz-r5-7530u-8gb-512gb.md": {
	id: "msi-modern-15-b7m-047nl-15-60hz-r5-7530u-8gb-512gb.md";
  slug: "msi-modern-15-b7m-047nl-15-60hz-r5-7530u-8gb-512gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-modern-15-b7m-049nl-laptop-15-6-inch.md": {
	id: "msi-modern-15-b7m-049nl-laptop-15-6-inch.md";
  slug: "msi-modern-15-b7m-049nl-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-modern-15-b7m-253nl.md": {
	id: "msi-modern-15-b7m-253nl.md";
  slug: "msi-modern-15-b7m-253nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-prestige-13-evo-a13m-059nl-13-inch-wuxga-intel-core-i7-16-gb-1-tb-1769375.md": {
	id: "msi-prestige-13-evo-a13m-059nl-13-inch-wuxga-intel-core-i7-16-gb-1-tb-1769375.md";
  slug: "msi-prestige-13-evo-a13m-059nl-13-inch-wuxga-intel-core-i7-16-gb-1-tb-1769375";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-prestige-13-evo-a13m-093nl.md": {
	id: "msi-prestige-13-evo-a13m-093nl.md";
  slug: "msi-prestige-13-evo-a13m-093nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-prestige-14-a12uc-014nl-creator-laptop-14-inch.md": {
	id: "msi-prestige-14-a12uc-014nl-creator-laptop-14-inch.md";
  slug: "msi-prestige-14-a12uc-014nl-creator-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-prestige-14-evo-a11m-430nl-laptop-14-inch.md": {
	id: "msi-prestige-14-evo-a11m-430nl-laptop-14-inch.md";
  slug: "msi-prestige-14-evo-a11m-430nl-laptop-14-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-prestige-14-evo-b13m-272nl-14-inch-wuxga-intel-core-i7-16-gb-1-tb-1769373.md": {
	id: "msi-prestige-14-evo-b13m-272nl-14-inch-wuxga-intel-core-i7-16-gb-1-tb-1769373.md";
  slug: "msi-prestige-14-evo-b13m-272nl-14-inch-wuxga-intel-core-i7-16-gb-1-tb-1769373";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-prestige-14-evo-b13m-274nl-14-inch-wuxga-intel-core-i5-16-gb-512-gb-1769374.md": {
	id: "msi-prestige-14-evo-b13m-274nl-14-inch-wuxga-intel-core-i5-16-gb-512-gb-1769374.md";
  slug: "msi-prestige-14-evo-b13m-274nl-14-inch-wuxga-intel-core-i5-16-gb-512-gb-1769374";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-prestige-16-evo-a13m-263nl.md": {
	id: "msi-prestige-16-evo-a13m-263nl.md";
  slug: "msi-prestige-16-evo-a13m-263nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-prestige-16-studio-a13ve-051nl-laptop-i7-13700h-rtx-4050-16-gb-1-tb-ssd.md": {
	id: "msi-prestige-16-studio-a13ve-051nl-laptop-i7-13700h-rtx-4050-16-gb-1-tb-ssd.md";
  slug: "msi-prestige-16-studio-a13ve-051nl-laptop-i7-13700h-rtx-4050-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-prestige-16-studio-a13ve-051nl.md": {
	id: "msi-prestige-16-studio-a13ve-051nl.md";
  slug: "msi-prestige-16-studio-a13ve-051nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-prestige-16-studio-a13vf-234fr-intel-core-i7-40-6-cm-2560-x-1600-pixels-32-gb-1-tb-windows-11-home.md": {
	id: "msi-prestige-16-studio-a13vf-234fr-intel-core-i7-40-6-cm-2560-x-1600-pixels-32-gb-1-tb-windows-11-home.md";
  slug: "msi-prestige-16-studio-a13vf-234fr-intel-core-i7-40-6-cm-2560-x-1600-pixels-32-gb-1-tb-windows-11-home";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-pulse-gl66-12uek-445nl-gaming-laptop-15-6-inch-165-hz.md": {
	id: "msi-pulse-gl66-12uek-445nl-gaming-laptop-15-6-inch-165-hz.md";
  slug: "msi-pulse-gl66-12uek-445nl-gaming-laptop-15-6-inch-165-hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-raider-ge66-12uh-035nl-1719512.md": {
	id: "msi-raider-ge66-12uh-035nl-1719512.md";
  slug: "msi-raider-ge66-12uh-035nl-1719512";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-raider-ge68hx-13vg-014nl-gaming-laptop-i7-13700hx-rtx-4070-32-gb-2-tb-ssd.md": {
	id: "msi-raider-ge68hx-13vg-014nl-gaming-laptop-i7-13700hx-rtx-4070-32-gb-2-tb-ssd.md";
  slug: "msi-raider-ge68hx-13vg-014nl-gaming-laptop-i7-13700hx-rtx-4070-32-gb-2-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-raider-ge68hx-13vg-084nl.md": {
	id: "msi-raider-ge68hx-13vg-084nl.md";
  slug: "msi-raider-ge68hx-13vg-084nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-summit-e14-flip-evo-a13mt-270nl.md": {
	id: "msi-summit-e14-flip-evo-a13mt-270nl.md";
  slug: "msi-summit-e14-flip-evo-a13mt-270nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-summit-e16-flip-a13vet-021nl-laptop-i7-1360p-rtx-4050-32-gb-2-tb-ssd.md": {
	id: "msi-summit-e16-flip-a13vet-021nl-laptop-i7-1360p-rtx-4050-32-gb-2-tb-ssd.md";
  slug: "msi-summit-e16-flip-a13vet-021nl-laptop-i7-1360p-rtx-4050-32-gb-2-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-summit-e16-flip-a13vft-019nl.md": {
	id: "msi-summit-e16-flip-a13vft-019nl.md";
  slug: "msi-summit-e16-flip-a13vft-019nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-thin-gf63-11uc-453nl.md": {
	id: "msi-thin-gf63-11uc-453nl.md";
  slug: "msi-thin-gf63-11uc-453nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-thin-gf63-12uc-683nl-156-inch-full-hd-intel-core-i7-16-gb-512-gb-geforce-rtx-3050-1769368.md": {
	id: "msi-thin-gf63-12uc-683nl-156-inch-full-hd-intel-core-i7-16-gb-512-gb-geforce-rtx-3050-1769368.md";
  slug: "msi-thin-gf63-12uc-683nl-156-inch-full-hd-intel-core-i7-16-gb-512-gb-geforce-rtx-3050-1769368";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-thin-gf63-12uc-683nl.md": {
	id: "msi-thin-gf63-12uc-683nl.md";
  slug: "msi-thin-gf63-12uc-683nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-thin-gf63-12uc-685nl-156-inch-full-hd-intel-core-i5-16-gb-512-gb-geforce-rtx-3050-1769367.md": {
	id: "msi-thin-gf63-12uc-685nl-156-inch-full-hd-intel-core-i5-16-gb-512-gb-geforce-rtx-3050-1769367.md";
  slug: "msi-thin-gf63-12uc-685nl-156-inch-full-hd-intel-core-i5-16-gb-512-gb-geforce-rtx-3050-1769367";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-thin-gf63-12uc-685nl.md": {
	id: "msi-thin-gf63-12uc-685nl.md";
  slug: "msi-thin-gf63-12uc-685nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-thin-gf63-12udx-610nl.md": {
	id: "msi-thin-gf63-12udx-610nl.md";
  slug: "msi-thin-gf63-12udx-610nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-thin-gf63-12ve-012nl-1tb-gaming-laptop.md": {
	id: "msi-thin-gf63-12ve-012nl-1tb-gaming-laptop.md";
  slug: "msi-thin-gf63-12ve-012nl-1tb-gaming-laptop";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-thin-gf63-12ve-012nl.md": {
	id: "msi-thin-gf63-12ve-012nl.md";
  slug: "msi-thin-gf63-12ve-012nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-thin-gf63-12ve-014nl.md": {
	id: "msi-thin-gf63-12ve-014nl.md";
  slug: "msi-thin-gf63-12ve-014nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-thin-gf63-12ve-612nl.md": {
	id: "msi-thin-gf63-12ve-612nl.md";
  slug: "msi-thin-gf63-12ve-612nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-thin-gf63-12vf-270nl-15-inch-full-hd-intel-core-i7-16-gb-512-gb-geforce-rtx-4060-1761302.md": {
	id: "msi-thin-gf63-12vf-270nl-15-inch-full-hd-intel-core-i7-16-gb-512-gb-geforce-rtx-4060-1761302.md";
  slug: "msi-thin-gf63-12vf-270nl-15-inch-full-hd-intel-core-i7-16-gb-512-gb-geforce-rtx-4060-1761302";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-thin-gf63-12vf-270nl-1tb-gaming-laptop-15-6-inch-144hz.md": {
	id: "msi-thin-gf63-12vf-270nl-1tb-gaming-laptop-15-6-inch-144hz.md";
  slug: "msi-thin-gf63-12vf-270nl-1tb-gaming-laptop-15-6-inch-144hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-thin-gf63-12vf-270nl-2tb-gaming-laptop-15-6-inch-144hz.md": {
	id: "msi-thin-gf63-12vf-270nl-2tb-gaming-laptop-15-6-inch-144hz.md";
  slug: "msi-thin-gf63-12vf-270nl-2tb-gaming-laptop-15-6-inch-144hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-thin-gf63-12vf-272nl-15-inch-full-hd-intel-core-i5-16-gb-512-gb-geforce-rtx-4060-1761301.md": {
	id: "msi-thin-gf63-12vf-272nl-15-inch-full-hd-intel-core-i5-16-gb-512-gb-geforce-rtx-4060-1761301.md";
  slug: "msi-thin-gf63-12vf-272nl-15-inch-full-hd-intel-core-i5-16-gb-512-gb-geforce-rtx-4060-1761301";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-titan-gt77-hx-13vi-009nl-gaming-laptop-17-3-inch.md": {
	id: "msi-titan-gt77-hx-13vi-009nl-gaming-laptop-17-3-inch.md";
  slug: "msi-titan-gt77-hx-13vi-009nl-gaming-laptop-17-3-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-vector-gp66-12ue-045nl-gaming-laptop-15-6-inch.md": {
	id: "msi-vector-gp66-12ue-045nl-gaming-laptop-15-6-inch.md";
  slug: "msi-vector-gp66-12ue-045nl-gaming-laptop-15-6-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-vector-gp66-12uh-442nl-gaming-laptop-15-6-inch-165hz.md": {
	id: "msi-vector-gp66-12uh-442nl-gaming-laptop-15-6-inch-165hz.md";
  slug: "msi-vector-gp66-12uh-442nl-gaming-laptop-15-6-inch-165hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-vector-gp68hx-13vg-086nl-16-inch-240-hz-intel-core-i9-16-gb-1-tb-geforce-rtx-4070-1761303.md": {
	id: "msi-vector-gp68hx-13vg-086nl-16-inch-240-hz-intel-core-i9-16-gb-1-tb-geforce-rtx-4070-1761303.md";
  slug: "msi-vector-gp68hx-13vg-086nl-16-inch-240-hz-intel-core-i9-16-gb-1-tb-geforce-rtx-4070-1761303";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-vector-gp68hx-13vg-086nl.md": {
	id: "msi-vector-gp68hx-13vg-086nl.md";
  slug: "msi-vector-gp68hx-13vg-086nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-vector-gp68hx-13vh-080nl-156-inch-144-hz-intel-core-i9-16-gb-1-tb-geforce-rtx-4080-1765288.md": {
	id: "msi-vector-gp68hx-13vh-080nl-156-inch-144-hz-intel-core-i9-16-gb-1-tb-geforce-rtx-4080-1765288.md";
  slug: "msi-vector-gp68hx-13vh-080nl-156-inch-144-hz-intel-core-i9-16-gb-1-tb-geforce-rtx-4080-1765288";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-vector-gp68hx-13vh-080nl.md": {
	id: "msi-vector-gp68hx-13vh-080nl.md";
  slug: "msi-vector-gp68hx-13vh-080nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-vector-gp78hx-13vh-222nl-17-inch-240-hz-intel-core-i9-32-gb-2-tb-geforce-rtx-4080-1761305.md": {
	id: "msi-vector-gp78hx-13vh-222nl-17-inch-240-hz-intel-core-i9-32-gb-2-tb-geforce-rtx-4080-1761305.md";
  slug: "msi-vector-gp78hx-13vh-222nl-17-inch-240-hz-intel-core-i9-32-gb-2-tb-geforce-rtx-4080-1761305";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-vector-gp78hx-13vh-222nl-gaming-laptop-i9-13950hx-rtx-4080-32-gb-2-tb-ssd.md": {
	id: "msi-vector-gp78hx-13vh-222nl-gaming-laptop-i9-13950hx-rtx-4080-32-gb-2-tb-ssd.md";
  slug: "msi-vector-gp78hx-13vh-222nl-gaming-laptop-i9-13950hx-rtx-4080-32-gb-2-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-vector-gp78hx-13vi-219nl-17-inch-240-hz-intel-core-i9-32-gb-2-tb-geforce-rtx-4090-1761306.md": {
	id: "msi-vector-gp78hx-13vi-219nl-17-inch-240-hz-intel-core-i9-32-gb-2-tb-geforce-rtx-4090-1761306.md";
  slug: "msi-vector-gp78hx-13vi-219nl-17-inch-240-hz-intel-core-i9-32-gb-2-tb-geforce-rtx-4090-1761306";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"msi-vector-gp78hx-13vi-219nl-gaming-laptop-17-inch-240hz.md": {
	id: "msi-vector-gp78hx-13vi-219nl-gaming-laptop-17-inch-240hz.md";
  slug: "msi-vector-gp78hx-13vi-219nl-gaming-laptop-17-inch-240hz";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"notebook-2-in-1-microsoft-surface-laptop-go-2-azerty-french-128-gb-ssd-8-gb-ram-intel-core-i5-12-4.md": {
	id: "notebook-2-in-1-microsoft-surface-laptop-go-2-azerty-french-128-gb-ssd-8-gb-ram-intel-core-i5-12-4.md";
  slug: "notebook-2-in-1-microsoft-surface-laptop-go-2-azerty-french-128-gb-ssd-8-gb-ram-intel-core-i5-12-4";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"omen-16-wf0395nd-laptop-16-1-qhd-intel-core-i7-13700hx-nvidia-geforce-rtx-4080-32-gb-ddr5-2-tb-ssd-windows-11-tsb-us-international-qwerty.md": {
	id: "omen-16-wf0395nd-laptop-16-1-qhd-intel-core-i7-13700hx-nvidia-geforce-rtx-4080-32-gb-ddr5-2-tb-ssd-windows-11-tsb-us-international-qwerty.md";
  slug: "omen-16-wf0395nd-laptop-16-1-qhd-intel-core-i7-13700hx-nvidia-geforce-rtx-4080-32-gb-ddr5-2-tb-ssd-windows-11-tsb-us-international-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"omen-by-hp-16-b0003nd-gaming-laptop.md": {
	id: "omen-by-hp-16-b0003nd-gaming-laptop.md";
  slug: "omen-by-hp-16-b0003nd-gaming-laptop";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"omen-by-hp-17-ck1495nd-i9-12900hx-notebook-43-9-cm-quad-hd-intel-core-i9-32-gb-ddr5-sdram-2000-gb-ssd-nvidia-geforce-rtx-3080-ti-wi-fi-6e-windows-11-home-zwart.md": {
	id: "omen-by-hp-17-ck1495nd-i9-12900hx-notebook-43-9-cm-quad-hd-intel-core-i9-32-gb-ddr5-sdram-2000-gb-ssd-nvidia-geforce-rtx-3080-ti-wi-fi-6e-windows-11-home-zwart.md";
  slug: "omen-by-hp-17-ck1495nd-i9-12900hx-notebook-43-9-cm-quad-hd-intel-core-i9-32-gb-ddr5-sdram-2000-gb-ssd-nvidia-geforce-rtx-3080-ti-wi-fi-6e-windows-11-home-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"omen-by-hp-laptop-16-b1000nd-i7-12700h-notebook-40-9-cm-quad-hd-intel-core-i7-32-gb-ddr5-sdram-1000-gb-ssd-nvidia-geforce-rtx-3070-ti-wi-fi-6-windows-11-home-zwart.md": {
	id: "omen-by-hp-laptop-16-b1000nd-i7-12700h-notebook-40-9-cm-quad-hd-intel-core-i7-32-gb-ddr5-sdram-1000-gb-ssd-nvidia-geforce-rtx-3070-ti-wi-fi-6-windows-11-home-zwart.md";
  slug: "omen-by-hp-laptop-16-b1000nd-i7-12700h-notebook-40-9-cm-quad-hd-intel-core-i7-32-gb-ddr5-sdram-1000-gb-ssd-nvidia-geforce-rtx-3070-ti-wi-fi-6-windows-11-home-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"omen-by-hp-laptop-16-b1001nd-i7-12700h-notebook-40-9-cm-quad-hd-intel-core-i7-16-gb-ddr5-sdram-1000-gb-ssd-nvidia-geforce-rtx-3070-ti-wi-fi-6-windows-11-home-zwart.md": {
	id: "omen-by-hp-laptop-16-b1001nd-i7-12700h-notebook-40-9-cm-quad-hd-intel-core-i7-16-gb-ddr5-sdram-1000-gb-ssd-nvidia-geforce-rtx-3070-ti-wi-fi-6-windows-11-home-zwart.md";
  slug: "omen-by-hp-laptop-16-b1001nd-i7-12700h-notebook-40-9-cm-quad-hd-intel-core-i7-16-gb-ddr5-sdram-1000-gb-ssd-nvidia-geforce-rtx-3070-ti-wi-fi-6-windows-11-home-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"omen-by-hp-laptop-17-ck2160nd-17-3-intel-core-i7-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4080-qhd-shadow-black.md": {
	id: "omen-by-hp-laptop-17-ck2160nd-17-3-intel-core-i7-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4080-qhd-shadow-black.md";
  slug: "omen-by-hp-laptop-17-ck2160nd-17-3-intel-core-i7-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4080-qhd-shadow-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"omen-by-hp-laptop-17-cm2130nd-windows-11-home-17-3-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-qhd-shadow-black.md": {
	id: "omen-by-hp-laptop-17-cm2130nd-windows-11-home-17-3-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-qhd-shadow-black.md";
  slug: "omen-by-hp-laptop-17-cm2130nd-windows-11-home-17-3-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-qhd-shadow-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"omen-by-hp-laptop-17-cm2320nd-windows-11-home-17-3-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-4060-fhd-shadow-black.md": {
	id: "omen-by-hp-laptop-17-cm2320nd-windows-11-home-17-3-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-4060-fhd-shadow-black.md";
  slug: "omen-by-hp-laptop-17-cm2320nd-windows-11-home-17-3-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-4060-fhd-shadow-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"omen-by-hp-laptop-17-cm2960nd-windows-11-home-17-3-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-4060-fhd-shadow-black.md": {
	id: "omen-by-hp-laptop-17-cm2960nd-windows-11-home-17-3-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-4060-fhd-shadow-black.md";
  slug: "omen-by-hp-laptop-17-cm2960nd-windows-11-home-17-3-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-4060-fhd-shadow-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"omen-gaming-laptop-16-wf0085nd-windows-11-home-16-1-intel-core-i7-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4070-fhd-shadow-black.md": {
	id: "omen-gaming-laptop-16-wf0085nd-windows-11-home-16-1-intel-core-i7-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4070-fhd-shadow-black.md";
  slug: "omen-gaming-laptop-16-wf0085nd-windows-11-home-16-1-intel-core-i7-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4070-fhd-shadow-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"omen-gaming-laptop-16-wf0089nd-windows-11-home-16-1-intel-core-i9-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4070-qhd-shadow-black.md": {
	id: "omen-gaming-laptop-16-wf0089nd-windows-11-home-16-1-intel-core-i9-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4070-qhd-shadow-black.md";
  slug: "omen-gaming-laptop-16-wf0089nd-windows-11-home-16-1-intel-core-i9-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4070-qhd-shadow-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"omen-gaming-laptop-16-wf0090nd-windows-11-home-16-1-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-4080-fhd-shadow-black.md": {
	id: "omen-gaming-laptop-16-wf0090nd-windows-11-home-16-1-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-4080-fhd-shadow-black.md";
  slug: "omen-gaming-laptop-16-wf0090nd-windows-11-home-16-1-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-4080-fhd-shadow-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"omen-gaming-laptop-16-wf0970nd-windows-11-home-16-1-intel-core-i7-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4060-fhd-shadow-black.md": {
	id: "omen-gaming-laptop-16-wf0970nd-windows-11-home-16-1-intel-core-i7-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4060-fhd-shadow-black.md";
  slug: "omen-gaming-laptop-16-wf0970nd-windows-11-home-16-1-intel-core-i7-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4060-fhd-shadow-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"omen-gaming-laptop-16-xf0075nd-windows-11-home-16-1-amd-ryzen-9-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4070-qhd-shadow-black.md": {
	id: "omen-gaming-laptop-16-xf0075nd-windows-11-home-16-1-amd-ryzen-9-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4070-qhd-shadow-black.md";
  slug: "omen-gaming-laptop-16-xf0075nd-windows-11-home-16-1-amd-ryzen-9-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4070-qhd-shadow-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"omen-transcend-laptop-16-u0190nd-windows-11-home-16-intel-core-i9-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4070-wqxga-shadow-black.md": {
	id: "omen-transcend-laptop-16-u0190nd-windows-11-home-16-intel-core-i9-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4070-wqxga-shadow-black.md";
  slug: "omen-transcend-laptop-16-u0190nd-windows-11-home-16-intel-core-i9-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4070-wqxga-shadow-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"omen-transcend-laptop-16-u0390nd-windows-11-home-16-intel-core-i9-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4070-wqxga-shadow-black.md": {
	id: "omen-transcend-laptop-16-u0390nd-windows-11-home-16-intel-core-i9-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4070-wqxga-shadow-black.md";
  slug: "omen-transcend-laptop-16-u0390nd-windows-11-home-16-intel-core-i9-32gb-ram-1tb-ssd-nvidia-geforce-rtx-4070-wqxga-shadow-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"pavilion-laptop-14-ec1004nd-windows-11-home-14-amd-ryzen-5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md": {
	id: "pavilion-laptop-14-ec1004nd-windows-11-home-14-amd-ryzen-5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md";
  slug: "pavilion-laptop-14-ec1004nd-windows-11-home-14-amd-ryzen-5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"pavilion-laptop-15-eg2270nd-windows-11-home-15-6-intel-core-i7-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md": {
	id: "pavilion-laptop-15-eg2270nd-windows-11-home-15-6-intel-core-i7-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md";
  slug: "pavilion-laptop-15-eg2270nd-windows-11-home-15-6-intel-core-i7-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"pavilion-laptop-15-eg2360nd-windows-11-home-15-6-intel-core-i5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md": {
	id: "pavilion-laptop-15-eg2360nd-windows-11-home-15-6-intel-core-i5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md";
  slug: "pavilion-laptop-15-eg2360nd-windows-11-home-15-6-intel-core-i5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"pavilion-laptop-15-eg2951nd-windows-11-home-15-6-intel-core-i5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md": {
	id: "pavilion-laptop-15-eg2951nd-windows-11-home-15-6-intel-core-i5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md";
  slug: "pavilion-laptop-15-eg2951nd-windows-11-home-15-6-intel-core-i5-8gb-ram-512gb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"pavilion-laptop-15-eg3070nd-windows-11-home-15-6-intel-core-i5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md": {
	id: "pavilion-laptop-15-eg3070nd-windows-11-home-15-6-intel-core-i5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md";
  slug: "pavilion-laptop-15-eg3070nd-windows-11-home-15-6-intel-core-i5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"pavilion-laptop-15-eg3080nd-windows-11-home-15-6-intel-core-i7-16gb-ram-1tb-ssd-fhd-natuurlijk-zilver.md": {
	id: "pavilion-laptop-15-eg3080nd-windows-11-home-15-6-intel-core-i7-16gb-ram-1tb-ssd-fhd-natuurlijk-zilver.md";
  slug: "pavilion-laptop-15-eg3080nd-windows-11-home-15-6-intel-core-i7-16gb-ram-1tb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"pavilion-laptop-15-eh3050nd-windows-11-home-15-6-amd-ryzen-5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md": {
	id: "pavilion-laptop-15-eh3050nd-windows-11-home-15-6-amd-ryzen-5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver.md";
  slug: "pavilion-laptop-15-eh3050nd-windows-11-home-15-6-amd-ryzen-5-16gb-ram-512gb-ssd-fhd-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"pavilion-laptop-15-eh3662nd-windows-11-home-15-6-amd-ryzen-5-16gb-ram-512gb-ssd-fhd-fog-blue.md": {
	id: "pavilion-laptop-15-eh3662nd-windows-11-home-15-6-amd-ryzen-5-16gb-ram-512gb-ssd-fhd-fog-blue.md";
  slug: "pavilion-laptop-15-eh3662nd-windows-11-home-15-6-amd-ryzen-5-16gb-ram-512gb-ssd-fhd-fog-blue";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"pavilion-plus-laptop-14-ew0035nd-windows-11-home-14-intel-core-i7-16gb-ram-1tb-ssd-2-8k-natuurlijk-zilver.md": {
	id: "pavilion-plus-laptop-14-ew0035nd-windows-11-home-14-intel-core-i7-16gb-ram-1tb-ssd-2-8k-natuurlijk-zilver.md";
  slug: "pavilion-plus-laptop-14-ew0035nd-windows-11-home-14-intel-core-i7-16gb-ram-1tb-ssd-2-8k-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"pavilion-plus-laptop-14-ey0010nd-windows-11-home-14-amd-ryzen-5-16gb-ram-512gb-ssd-wuxga-natuurlijk-zilver.md": {
	id: "pavilion-plus-laptop-14-ey0010nd-windows-11-home-14-amd-ryzen-5-16gb-ram-512gb-ssd-wuxga-natuurlijk-zilver.md";
  slug: "pavilion-plus-laptop-14-ey0010nd-windows-11-home-14-amd-ryzen-5-16gb-ram-512gb-ssd-wuxga-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"pavilion-plus-laptop-14-ey0025nd-windows-11-home-14-amd-ryzen-7-16gb-ram-512gb-ssd-2-8k-natuurlijk-zilver.md": {
	id: "pavilion-plus-laptop-14-ey0025nd-windows-11-home-14-amd-ryzen-7-16gb-ram-512gb-ssd-2-8k-natuurlijk-zilver.md";
  slug: "pavilion-plus-laptop-14-ey0025nd-windows-11-home-14-amd-ryzen-7-16gb-ram-512gb-ssd-2-8k-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"pavilion-plus-laptop-16-ab0060nd-windows-11-home-16-intel-core-i7-16gb-ram-1tb-ssd-wqxga-natuurlijk-zilver.md": {
	id: "pavilion-plus-laptop-16-ab0060nd-windows-11-home-16-intel-core-i7-16gb-ram-1tb-ssd-wqxga-natuurlijk-zilver.md";
  slug: "pavilion-plus-laptop-16-ab0060nd-windows-11-home-16-intel-core-i7-16gb-ram-1tb-ssd-wqxga-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"pavilion-plus-laptop-16-ab0070nd-windows-11-home-16-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-3050-wqxga-natuurlijk-zilver.md": {
	id: "pavilion-plus-laptop-16-ab0070nd-windows-11-home-16-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-3050-wqxga-natuurlijk-zilver.md";
  slug: "pavilion-plus-laptop-16-ab0070nd-windows-11-home-16-intel-core-i7-16gb-ram-1tb-ssd-nvidia-geforce-rtx-3050-wqxga-natuurlijk-zilver";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"pro-x360-435-13-3-inch-g10-notebook-pc-wolf-pro-security-edition-13-3-touchscreen-windows-11-pro-16gb-ram-512gb-ssd-fhd.md": {
	id: "pro-x360-435-13-3-inch-g10-notebook-pc-wolf-pro-security-edition-13-3-touchscreen-windows-11-pro-16gb-ram-512gb-ssd-fhd.md";
  slug: "pro-x360-435-13-3-inch-g10-notebook-pc-wolf-pro-security-edition-13-3-touchscreen-windows-11-pro-16gb-ram-512gb-ssd-fhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"probook-440-14-inch-g10-notebook-pc-wolf-pro-security-edition-14-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-fhd.md": {
	id: "probook-440-14-inch-g10-notebook-pc-wolf-pro-security-edition-14-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-fhd.md";
  slug: "probook-440-14-inch-g10-notebook-pc-wolf-pro-security-edition-14-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-fhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"probook-445-14-inch-g10-notebook-pc-wolf-pro-security-edition-14-windows-11-pro-amd-ryzen-5-16gb-ram-512gb-ssd-fhd.md": {
	id: "probook-445-14-inch-g10-notebook-pc-wolf-pro-security-edition-14-windows-11-pro-amd-ryzen-5-16gb-ram-512gb-ssd-fhd.md";
  slug: "probook-445-14-inch-g10-notebook-pc-wolf-pro-security-edition-14-windows-11-pro-amd-ryzen-5-16gb-ram-512gb-ssd-fhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"probook-450-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-fhd-2.md": {
	id: "probook-450-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-fhd-2.md";
  slug: "probook-450-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-fhd-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"probook-450-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-fhd.md": {
	id: "probook-450-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-fhd.md";
  slug: "probook-450-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i5-16gb-ram-512gb-ssd-fhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"probook-450-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i5-8gb-ram-256gb-ssd-fhd.md": {
	id: "probook-450-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i5-8gb-ram-256gb-ssd-fhd.md";
  slug: "probook-450-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i5-8gb-ram-256gb-ssd-fhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"probook-450-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-fhd.md": {
	id: "probook-450-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-fhd.md";
  slug: "probook-450-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-fhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"probook-455-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-amd-ryzen-5-16gb-ram-512gb-ssd-fhd.md": {
	id: "probook-455-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-amd-ryzen-5-16gb-ram-512gb-ssd-fhd.md";
  slug: "probook-455-15-6-inch-g10-notebook-pc-wolf-pro-security-edition-15-6-windows-11-pro-amd-ryzen-5-16gb-ram-512gb-ssd-fhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"s340-14iil-ci5-4-512gb-14in-w10h.md": {
	id: "s340-14iil-ci5-4-512gb-14in-w10h.md";
  slug: "s340-14iil-ci5-4-512gb-14in-w10h";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book-2-15-inch.md": {
	id: "samsung-galaxy-book-2-15-inch.md";
  slug: "samsung-galaxy-book-2-15-inch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book-3-ultra.md": {
	id: "samsung-galaxy-book-3-ultra.md";
  slug: "samsung-galaxy-book-3-ultra";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book2-15-i5-1721386.md": {
	id: "samsung-galaxy-book2-15-i5-1721386.md";
  slug: "samsung-galaxy-book2-15-i5-1721386";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book2-15-inch-8gb-256gb-zilver-notebook.md": {
	id: "samsung-galaxy-book2-15-inch-8gb-256gb-zilver-notebook.md";
  slug: "samsung-galaxy-book2-15-inch-8gb-256gb-zilver-notebook";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book2-15-np750xed-kb2nl.md": {
	id: "samsung-galaxy-book2-15-np750xed-kb2nl.md";
  slug: "samsung-galaxy-book2-15-np750xed-kb2nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book2-156-inch-intel-core-i7-8-gb-256-gb-1793925.md": {
	id: "samsung-galaxy-book2-156-inch-intel-core-i7-8-gb-256-gb-1793925.md";
  slug: "samsung-galaxy-book2-156-inch-intel-core-i7-8-gb-256-gb-1793925";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book2-business-np646bed-ka1nl-notebook-i5-1240p-35-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-11-pro-grafiet.md": {
	id: "samsung-galaxy-book2-business-np646bed-ka1nl-notebook-i5-1240p-35-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-11-pro-grafiet.md";
  slug: "samsung-galaxy-book2-business-np646bed-ka1nl-notebook-i5-1240p-35-6-cm-full-hd-intel-core-i5-16-gb-ddr4-sdram-256-gb-ssd-wi-fi-6e-windows-11-pro-grafiet";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book2-pro-13-16gb-512gb.md": {
	id: "samsung-galaxy-book2-pro-13-16gb-512gb.md";
  slug: "samsung-galaxy-book2-pro-13-16gb-512gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book2-pro-360-13-16gb-512gb.md": {
	id: "samsung-galaxy-book2-pro-360-13-16gb-512gb.md";
  slug: "samsung-galaxy-book2-pro-360-13-16gb-512gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book2-pro-360-13-np930qed-kb1nl.md": {
	id: "samsung-galaxy-book2-pro-360-13-np930qed-kb1nl.md";
  slug: "samsung-galaxy-book2-pro-360-13-np930qed-kb1nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book2-pro-360-15-np950qed-ka1nl.md": {
	id: "samsung-galaxy-book2-pro-360-15-np950qed-ka1nl.md";
  slug: "samsung-galaxy-book2-pro-360-15-np950qed-ka1nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-360-13-silver-1751882.md": {
	id: "samsung-galaxy-book3-360-13-silver-1751882.md";
  slug: "samsung-galaxy-book3-360-13-silver-1751882";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-360-15-fhd-touch-16gb-512gb.md": {
	id: "samsung-galaxy-book3-360-15-fhd-touch-16gb-512gb.md";
  slug: "samsung-galaxy-book3-360-15-fhd-touch-16gb-512gb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-360-15-silver-1751881.md": {
	id: "samsung-galaxy-book3-360-15-silver-1751881.md";
  slug: "samsung-galaxy-book3-360-15-silver-1751881";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-360-np730qfg-ka2nl.md": {
	id: "samsung-galaxy-book3-360-np730qfg-ka2nl.md";
  slug: "samsung-galaxy-book3-360-np730qfg-ka2nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-360-np730qfg-kb1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-512-gb-ssd-touch.md": {
	id: "samsung-galaxy-book3-360-np730qfg-kb1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-512-gb-ssd-touch.md";
  slug: "samsung-galaxy-book3-360-np730qfg-kb1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-512-gb-ssd-touch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-360-np730qfg-kb1nl-qwerty.md": {
	id: "samsung-galaxy-book3-360-np730qfg-kb1nl-qwerty.md";
  slug: "samsung-galaxy-book3-360-np730qfg-kb1nl-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-360-np730qfg-kb1nl.md": {
	id: "samsung-galaxy-book3-360-np730qfg-kb1nl.md";
  slug: "samsung-galaxy-book3-360-np730qfg-kb1nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-360-np750qfg-ka1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-512-gb-ssd-touch.md": {
	id: "samsung-galaxy-book3-360-np750qfg-ka1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-512-gb-ssd-touch.md";
  slug: "samsung-galaxy-book3-360-np750qfg-ka1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-512-gb-ssd-touch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-360-np750qfg-ka3nl.md": {
	id: "samsung-galaxy-book3-360-np750qfg-ka3nl.md";
  slug: "samsung-galaxy-book3-360-np750qfg-ka3nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-360.md": {
	id: "samsung-galaxy-book3-360.md";
  slug: "samsung-galaxy-book3-360";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-np750xfg-kb1nl-laptop-i5-1335u-iris-xe-graphics-16-gb-512-gb-ssd.md": {
	id: "samsung-galaxy-book3-np750xfg-kb1nl-laptop-i5-1335u-iris-xe-graphics-16-gb-512-gb-ssd.md";
  slug: "samsung-galaxy-book3-np750xfg-kb1nl-laptop-i5-1335u-iris-xe-graphics-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-np750xfg-kb1nl-qwerty.md": {
	id: "samsung-galaxy-book3-np750xfg-kb1nl-qwerty.md";
  slug: "samsung-galaxy-book3-np750xfg-kb1nl-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-np750xfg-kb1nl.md": {
	id: "samsung-galaxy-book3-np750xfg-kb1nl.md";
  slug: "samsung-galaxy-book3-np750xfg-kb1nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-np750xfg-kb2nl-laptop-i5-1335u-iris-xe-graphics-8-gb-512-gb-ssd.md": {
	id: "samsung-galaxy-book3-np750xfg-kb2nl-laptop-i5-1335u-iris-xe-graphics-8-gb-512-gb-ssd.md";
  slug: "samsung-galaxy-book3-np750xfg-kb2nl-laptop-i5-1335u-iris-xe-graphics-8-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-np750xfg-kb2nl-qwerty.md": {
	id: "samsung-galaxy-book3-np750xfg-kb2nl-qwerty.md";
  slug: "samsung-galaxy-book3-np750xfg-kb2nl-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-np750xfg-kb2nl.md": {
	id: "samsung-galaxy-book3-np750xfg-kb2nl.md";
  slug: "samsung-galaxy-book3-np750xfg-kb2nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-np750xfg-kb3nl-laptop-i7-1355u-iris-xe-graphics-16-gb-1-tb-ssd.md": {
	id: "samsung-galaxy-book3-np750xfg-kb3nl-laptop-i7-1355u-iris-xe-graphics-16-gb-1-tb-ssd.md";
  slug: "samsung-galaxy-book3-np750xfg-kb3nl-laptop-i7-1355u-iris-xe-graphics-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-np750xfg-kb3nl-qwerty.md": {
	id: "samsung-galaxy-book3-np750xfg-kb3nl-qwerty.md";
  slug: "samsung-galaxy-book3-np750xfg-kb3nl-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-np750xfh-xb1nl-laptop-i7-1360p-arc-a350m-16-gb-512-gb-ssd.md": {
	id: "samsung-galaxy-book3-np750xfh-xb1nl-laptop-i7-1360p-arc-a350m-16-gb-512-gb-ssd.md";
  slug: "samsung-galaxy-book3-np750xfh-xb1nl-laptop-i7-1360p-arc-a350m-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-np750xfh-xb1nl-qwerty.md": {
	id: "samsung-galaxy-book3-np750xfh-xb1nl-qwerty.md";
  slug: "samsung-galaxy-book3-np750xfh-xb1nl-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-np750xfh-xb1nl.md": {
	id: "samsung-galaxy-book3-np750xfh-xb1nl.md";
  slug: "samsung-galaxy-book3-np750xfh-xb1nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-14-graphite-1751878.md": {
	id: "samsung-galaxy-book3-pro-14-graphite-1751878.md";
  slug: "samsung-galaxy-book3-pro-14-graphite-1751878";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-14-graphite-1751887.md": {
	id: "samsung-galaxy-book3-pro-14-graphite-1751887.md";
  slug: "samsung-galaxy-book3-pro-14-graphite-1751887";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-14-silver-1751879.md": {
	id: "samsung-galaxy-book3-pro-14-silver-1751879.md";
  slug: "samsung-galaxy-book3-pro-14-silver-1751879";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-16-3k-16gb-1tb.md": {
	id: "samsung-galaxy-book3-pro-16-3k-16gb-1tb.md";
  slug: "samsung-galaxy-book3-pro-16-3k-16gb-1tb";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-16-graphite-1751876.md": {
	id: "samsung-galaxy-book3-pro-16-graphite-1751876.md";
  slug: "samsung-galaxy-book3-pro-16-graphite-1751876";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-16-graphite-1751886.md": {
	id: "samsung-galaxy-book3-pro-16-graphite-1751886.md";
  slug: "samsung-galaxy-book3-pro-16-graphite-1751886";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-16-silver-1751877.md": {
	id: "samsung-galaxy-book3-pro-16-silver-1751877.md";
  slug: "samsung-galaxy-book3-pro-16-silver-1751877";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-360-14-i7-1360p-16gb-512gb-w11.md": {
	id: "samsung-galaxy-book3-pro-360-14-i7-1360p-16gb-512gb-w11.md";
  slug: "samsung-galaxy-book3-pro-360-14-i7-1360p-16gb-512gb-w11";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-360-16-graphite-1751874.md": {
	id: "samsung-galaxy-book3-pro-360-16-graphite-1751874.md";
  slug: "samsung-galaxy-book3-pro-360-16-graphite-1751874";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-360-16-graphite-1751885.md": {
	id: "samsung-galaxy-book3-pro-360-16-graphite-1751885.md";
  slug: "samsung-galaxy-book3-pro-360-16-graphite-1751885";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-360-16-silver-1751875.md": {
	id: "samsung-galaxy-book3-pro-360-16-silver-1751875.md";
  slug: "samsung-galaxy-book3-pro-360-16-silver-1751875";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-360-np960qfg-ka1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd-touch.md": {
	id: "samsung-galaxy-book3-pro-360-np960qfg-ka1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd-touch.md";
  slug: "samsung-galaxy-book3-pro-360-np960qfg-ka1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd-touch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-360-np960qfg-ka1nl-qwerty.md": {
	id: "samsung-galaxy-book3-pro-360-np960qfg-ka1nl-qwerty.md";
  slug: "samsung-galaxy-book3-pro-360-np960qfg-ka1nl-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-360-np960qfg-ka1nl.md": {
	id: "samsung-galaxy-book3-pro-360-np960qfg-ka1nl.md";
  slug: "samsung-galaxy-book3-pro-360-np960qfg-ka1nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-360-np960qfg-ka3nl.md": {
	id: "samsung-galaxy-book3-pro-360-np960qfg-ka3nl.md";
  slug: "samsung-galaxy-book3-pro-360-np960qfg-ka3nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-360-np960qfg-kb1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd-touch.md": {
	id: "samsung-galaxy-book3-pro-360-np960qfg-kb1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd-touch.md";
  slug: "samsung-galaxy-book3-pro-360-np960qfg-kb1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd-touch";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-360-np960qfg-kb1nl-qwerty.md": {
	id: "samsung-galaxy-book3-pro-360-np960qfg-kb1nl-qwerty.md";
  slug: "samsung-galaxy-book3-pro-360-np960qfg-kb1nl-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-360-np960qfg-kb1nl.md": {
	id: "samsung-galaxy-book3-pro-360-np960qfg-kb1nl.md";
  slug: "samsung-galaxy-book3-pro-360-np960qfg-kb1nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-np940xfg-ka1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd.md": {
	id: "samsung-galaxy-book3-pro-np940xfg-ka1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd.md";
  slug: "samsung-galaxy-book3-pro-np940xfg-ka1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-np940xfg-ka1nl-qwerty.md": {
	id: "samsung-galaxy-book3-pro-np940xfg-ka1nl-qwerty.md";
  slug: "samsung-galaxy-book3-pro-np940xfg-ka1nl-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-np940xfg-ka1nl.md": {
	id: "samsung-galaxy-book3-pro-np940xfg-ka1nl.md";
  slug: "samsung-galaxy-book3-pro-np940xfg-ka1nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-np940xfg-kc1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd.md": {
	id: "samsung-galaxy-book3-pro-np940xfg-kc1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd.md";
  slug: "samsung-galaxy-book3-pro-np940xfg-kc1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-np940xfg-kc1nl-qwerty.md": {
	id: "samsung-galaxy-book3-pro-np940xfg-kc1nl-qwerty.md";
  slug: "samsung-galaxy-book3-pro-np940xfg-kc1nl-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-np940xfg-kc1nl.md": {
	id: "samsung-galaxy-book3-pro-np940xfg-kc1nl.md";
  slug: "samsung-galaxy-book3-pro-np940xfg-kc1nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-np940xfg-kc2nl-laptop-i7-1360p-iris-xe-graphics-16-gb-512gb-ssd.md": {
	id: "samsung-galaxy-book3-pro-np940xfg-kc2nl-laptop-i7-1360p-iris-xe-graphics-16-gb-512gb-ssd.md";
  slug: "samsung-galaxy-book3-pro-np940xfg-kc2nl-laptop-i7-1360p-iris-xe-graphics-16-gb-512gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-np940xfg-kc2nl.md": {
	id: "samsung-galaxy-book3-pro-np940xfg-kc2nl.md";
  slug: "samsung-galaxy-book3-pro-np940xfg-kc2nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-np940xfg-kc3nl.md": {
	id: "samsung-galaxy-book3-pro-np940xfg-kc3nl.md";
  slug: "samsung-galaxy-book3-pro-np940xfg-kc3nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-np960xfg-ka1nl-2.md": {
	id: "samsung-galaxy-book3-pro-np960xfg-ka1nl-2.md";
  slug: "samsung-galaxy-book3-pro-np960xfg-ka1nl-2";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-np960xfg-ka1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd.md": {
	id: "samsung-galaxy-book3-pro-np960xfg-ka1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd.md";
  slug: "samsung-galaxy-book3-pro-np960xfg-ka1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-np960xfg-ka1nl.md": {
	id: "samsung-galaxy-book3-pro-np960xfg-ka1nl.md";
  slug: "samsung-galaxy-book3-pro-np960xfg-ka1nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-np960xfg-kc1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd.md": {
	id: "samsung-galaxy-book3-pro-np960xfg-kc1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd.md";
  slug: "samsung-galaxy-book3-pro-np960xfg-kc1nl-laptop-i7-1360p-iris-xe-graphics-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-np960xfg-kc1nl.md": {
	id: "samsung-galaxy-book3-pro-np960xfg-kc1nl.md";
  slug: "samsung-galaxy-book3-pro-np960xfg-kc1nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-pro-np960xfg-kc3nl.md": {
	id: "samsung-galaxy-book3-pro-np960xfg-kc3nl.md";
  slug: "samsung-galaxy-book3-pro-np960xfg-kc3nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-ultra-16-graphite-1751767.md": {
	id: "samsung-galaxy-book3-ultra-16-graphite-1751767.md";
  slug: "samsung-galaxy-book3-ultra-16-graphite-1751767";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-ultra-np960xfh-xa1nl-galaxy-s23-ultra.md": {
	id: "samsung-galaxy-book3-ultra-np960xfh-xa1nl-galaxy-s23-ultra.md";
  slug: "samsung-galaxy-book3-ultra-np960xfh-xa1nl-galaxy-s23-ultra";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-ultra-np960xfh-xa1nl-laptop-i7-13700h-rtx-4050-16-gb-1-tb-ssd.md": {
	id: "samsung-galaxy-book3-ultra-np960xfh-xa1nl-laptop-i7-13700h-rtx-4050-16-gb-1-tb-ssd.md";
  slug: "samsung-galaxy-book3-ultra-np960xfh-xa1nl-laptop-i7-13700h-rtx-4050-16-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-ultra-np960xfh-xa1nl-qwerty.md": {
	id: "samsung-galaxy-book3-ultra-np960xfh-xa1nl-qwerty.md";
  slug: "samsung-galaxy-book3-ultra-np960xfh-xa1nl-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-ultra-np960xfh-xa3nl-16-inch-intel-core-i9-32-gb-1-tb-geforce-rtx-4070-1756760.md": {
	id: "samsung-galaxy-book3-ultra-np960xfh-xa3nl-16-inch-intel-core-i9-32-gb-1-tb-geforce-rtx-4070-1756760.md";
  slug: "samsung-galaxy-book3-ultra-np960xfh-xa3nl-16-inch-intel-core-i9-32-gb-1-tb-geforce-rtx-4070-1756760";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-ultra-np960xfh-xa3nl-laptop-i9-13900h-rtx-4070-32-gb-1-tb-ssd.md": {
	id: "samsung-galaxy-book3-ultra-np960xfh-xa3nl-laptop-i9-13900h-rtx-4070-32-gb-1-tb-ssd.md";
  slug: "samsung-galaxy-book3-ultra-np960xfh-xa3nl-laptop-i9-13900h-rtx-4070-32-gb-1-tb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-ultra-np960xfh-xa3nl-qwerty.md": {
	id: "samsung-galaxy-book3-ultra-np960xfh-xa3nl-qwerty.md";
  slug: "samsung-galaxy-book3-ultra-np960xfh-xa3nl-qwerty";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-ultra-np960xfh-xa3nl.md": {
	id: "samsung-galaxy-book3-ultra-np960xfh-xa3nl.md";
  slug: "samsung-galaxy-book3-ultra-np960xfh-xa3nl";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-zilver-156-inch-intel-core-i5-8-gb-512-gb-1751814.md": {
	id: "samsung-galaxy-book3-zilver-156-inch-intel-core-i5-8-gb-512-gb-1751814.md";
  slug: "samsung-galaxy-book3-zilver-156-inch-intel-core-i5-8-gb-512-gb-1751814";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-zilver-156-inch-intel-core-i7-16-gb-512-gb-1751812.md": {
	id: "samsung-galaxy-book3-zilver-156-inch-intel-core-i7-16-gb-512-gb-1751812.md";
  slug: "samsung-galaxy-book3-zilver-156-inch-intel-core-i7-16-gb-512-gb-1751812";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3-zilver-156-inch-intel-core-i7-16-gb-512-gb-intel-arc-a350m-1751883.md": {
	id: "samsung-galaxy-book3-zilver-156-inch-intel-core-i7-16-gb-512-gb-intel-arc-a350m-1751883.md";
  slug: "samsung-galaxy-book3-zilver-156-inch-intel-core-i7-16-gb-512-gb-intel-arc-a350m-1751883";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-galaxy-book3.md": {
	id: "samsung-galaxy-book3.md";
  slug: "samsung-galaxy-book3";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"samsung-samsung-galaxy-book2-pro-360-15-1721382.md": {
	id: "samsung-samsung-galaxy-book2-pro-360-15-1721382.md";
  slug: "samsung-samsung-galaxy-book2-pro-360-15-1721382";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"spectre-x360-2-in-1-laptop-14-ef2130nd-windows-11-home-13-5-touchscreen-intel-core-i7-16gb-ram-512gb-ssd-3k2k-nightfall-black.md": {
	id: "spectre-x360-2-in-1-laptop-14-ef2130nd-windows-11-home-13-5-touchscreen-intel-core-i7-16gb-ram-512gb-ssd-3k2k-nightfall-black.md";
  slug: "spectre-x360-2-in-1-laptop-14-ef2130nd-windows-11-home-13-5-touchscreen-intel-core-i7-16gb-ram-512gb-ssd-3k2k-nightfall-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"spectre-x360-2-in-1-laptop-14-ef2150nd-windows-11-home-13-5-touchscreen-intel-core-i7-32gb-ram-1tb-ssd-3k2k-nightfall-black.md": {
	id: "spectre-x360-2-in-1-laptop-14-ef2150nd-windows-11-home-13-5-touchscreen-intel-core-i7-32gb-ram-1tb-ssd-3k2k-nightfall-black.md";
  slug: "spectre-x360-2-in-1-laptop-14-ef2150nd-windows-11-home-13-5-touchscreen-intel-core-i7-32gb-ram-1tb-ssd-3k2k-nightfall-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"spectre-x360-2-in-1-laptop-14-ef2610nd-windows-11-home-13-5-touchscreen-intel-core-i7-16gb-ram-512gb-ssd-wuxga-nightfall-black.md": {
	id: "spectre-x360-2-in-1-laptop-14-ef2610nd-windows-11-home-13-5-touchscreen-intel-core-i7-16gb-ram-512gb-ssd-wuxga-nightfall-black.md";
  slug: "spectre-x360-2-in-1-laptop-14-ef2610nd-windows-11-home-13-5-touchscreen-intel-core-i7-16gb-ram-512gb-ssd-wuxga-nightfall-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"spectre-x360-2-in-1-laptop-16-f2615nd-windows-11-home-16-touchscreen-intel-core-i7-16gb-ram-512gb-ssd-3k-nightfall-black.md": {
	id: "spectre-x360-2-in-1-laptop-16-f2615nd-windows-11-home-16-touchscreen-intel-core-i7-16gb-ram-512gb-ssd-3k-nightfall-black.md";
  slug: "spectre-x360-2-in-1-laptop-16-f2615nd-windows-11-home-16-touchscreen-intel-core-i7-16gb-ram-512gb-ssd-3k-nightfall-black";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"studenten-pakket-samsung-galaxy-book2-pro-360-13-np930qed-kb1nl-qhd-monitor.md": {
	id: "studenten-pakket-samsung-galaxy-book2-pro-360-13-np930qed-kb1nl-qhd-monitor.md";
  slug: "studenten-pakket-samsung-galaxy-book2-pro-360-13-np930qed-kb1nl-qhd-monitor";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"surface-pro-9-graphite-microsoft-surface-pro-signature-type-cover-qwerty-zwart.md": {
	id: "surface-pro-9-graphite-microsoft-surface-pro-signature-type-cover-qwerty-zwart.md";
  slug: "surface-pro-9-graphite-microsoft-surface-pro-signature-type-cover-qwerty-zwart";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"tb-15-iili7-1065g716gb512gbw10p1-year.md": {
	id: "tb-15-iili7-1065g716gb512gbw10p1-year.md";
  slug: "tb-15-iili7-1065g716gb512gbw10p1-year";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"thinkpad-x1-yoga-gen6-intel-core-i7-1165g7-4c-up-to-4-7ghz-16gb-512gb-ssd-14inch-3840x2400-multitouch-ips-anti-reflection-intel-iris-xe-graphics-no-ethernet-4g-720p-ir-camera-windows-10-pro.md": {
	id: "thinkpad-x1-yoga-gen6-intel-core-i7-1165g7-4c-up-to-4-7ghz-16gb-512gb-ssd-14inch-3840x2400-multitouch-ips-anti-reflection-intel-iris-xe-graphics-no-ethernet-4g-720p-ir-camera-windows-10-pro.md";
  slug: "thinkpad-x1-yoga-gen6-intel-core-i7-1165g7-4c-up-to-4-7ghz-16gb-512gb-ssd-14inch-3840x2400-multitouch-ips-anti-reflection-intel-iris-xe-graphics-no-ethernet-4g-720p-ir-camera-windows-10-pro";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"victus-by-hp-15-fa0315nd-833m7ea-gaming-laptop-i7-12650h-rtx-3050-16-gb-512-gb-ssd.md": {
	id: "victus-by-hp-15-fa0315nd-833m7ea-gaming-laptop-i7-12650h-rtx-3050-16-gb-512-gb-ssd.md";
  slug: "victus-by-hp-15-fa0315nd-833m7ea-gaming-laptop-i7-12650h-rtx-3050-16-gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"victus-by-hp-15-fa1024nd-8y7m9ea-gaming-laptop-i7-12650h-rtx-4050-16gb-512-gb-ssd.md": {
	id: "victus-by-hp-15-fa1024nd-8y7m9ea-gaming-laptop-i7-12650h-rtx-4050-16gb-512-gb-ssd.md";
  slug: "victus-by-hp-15-fa1024nd-8y7m9ea-gaming-laptop-i7-12650h-rtx-4050-16gb-512-gb-ssd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"zbook-firefly-14-inch-g10-14-touchscreen-i7-1355u-16gb-ram-512gb-ssd-rtx-a500.md": {
	id: "zbook-firefly-14-inch-g10-14-touchscreen-i7-1355u-16gb-ram-512gb-ssd-rtx-a500.md";
  slug: "zbook-firefly-14-inch-g10-14-touchscreen-i7-1355u-16gb-ram-512gb-ssd-rtx-a500";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"zbook-firefly-16-inch-g10-mobiele-workstation-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i7-32gb-ram-1tb-ssd-rtx-a500-wuxga.md": {
	id: "zbook-firefly-16-inch-g10-mobiele-workstation-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i7-32gb-ram-1tb-ssd-rtx-a500-wuxga.md";
  slug: "zbook-firefly-16-inch-g10-mobiele-workstation-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i7-32gb-ram-1tb-ssd-rtx-a500-wuxga";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"zbook-fury-16-g10-mobile-workstation-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-nvidia-rtx-a1000-wuxga.md": {
	id: "zbook-fury-16-g10-mobile-workstation-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-nvidia-rtx-a1000-wuxga.md";
  slug: "zbook-fury-16-g10-mobile-workstation-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i7-16gb-ram-512gb-ssd-nvidia-rtx-a1000-wuxga";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"zbook-fury-16-g10-mobile-workstation-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i7-32gb-ram-1tb-ssd-nvidia-wuxga.md": {
	id: "zbook-fury-16-g10-mobile-workstation-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i7-32gb-ram-1tb-ssd-nvidia-wuxga.md";
  slug: "zbook-fury-16-g10-mobile-workstation-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i7-32gb-ram-1tb-ssd-nvidia-wuxga";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"zbook-fury-16-g10-mobile-workstation-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i7-32gb-ram-1tb-ssd-rtx-a2000-wuxga.md": {
	id: "zbook-fury-16-g10-mobile-workstation-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i7-32gb-ram-1tb-ssd-rtx-a2000-wuxga.md";
  slug: "zbook-fury-16-g10-mobile-workstation-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i7-32gb-ram-1tb-ssd-rtx-a2000-wuxga";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"zbook-fury-16-g10-mobile-workstation-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i7-32gb-ram-1tb-ssd-wuxga.md": {
	id: "zbook-fury-16-g10-mobile-workstation-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i7-32gb-ram-1tb-ssd-wuxga.md";
  slug: "zbook-fury-16-g10-mobile-workstation-pc-wolf-pro-security-edition-16-windows-11-pro-intel-core-i7-32gb-ram-1tb-ssd-wuxga";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"zbook-power-15-6-inch-g10-a-mobiele-workstation-pc-wolf-pro-security-edition-15-6-windows-11-pro-32gb-ram-1tb-ssd-nvidia-2000-fhd.md": {
	id: "zbook-power-15-6-inch-g10-a-mobiele-workstation-pc-wolf-pro-security-edition-15-6-windows-11-pro-32gb-ram-1tb-ssd-nvidia-2000-fhd.md";
  slug: "zbook-power-15-6-inch-g10-a-mobiele-workstation-pc-wolf-pro-security-edition-15-6-windows-11-pro-32gb-ram-1tb-ssd-nvidia-2000-fhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"zbook-power-15-6-inch-g10-mobile-workstation-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i7-32gb-ram-1tb-ssd-2000-fhd.md": {
	id: "zbook-power-15-6-inch-g10-mobile-workstation-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i7-32gb-ram-1tb-ssd-2000-fhd.md";
  slug: "zbook-power-15-6-inch-g10-mobile-workstation-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i7-32gb-ram-1tb-ssd-2000-fhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
"zbook-power-15-6-inch-g10-mobile-workstation-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i7-32gb-ram-512gb-ssd-nvidia-rtx-a1000-fhd.md": {
	id: "zbook-power-15-6-inch-g10-mobile-workstation-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i7-32gb-ram-512gb-ssd-nvidia-rtx-a1000-fhd.md";
  slug: "zbook-power-15-6-inch-g10-mobile-workstation-pc-wolf-pro-security-edition-15-6-windows-11-pro-intel-core-i7-32gb-ram-512gb-ssd-nvidia-rtx-a1000-fhd";
  body: string;
  collection: "product";
  data: any
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = typeof import("../src/content/config");
}
