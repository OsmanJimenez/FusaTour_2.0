import { Category, Destination, Tag } from '../models/catalogue';

export function categoryName(categories: Category[], categoryId: number): string {
  return categories.find((category) => category.id === categoryId)?.name ?? 'Fusagasugá';
}

export function categoryFor(categories: Category[], categoryId: number): Category | undefined {
  return categories.find((category) => category.id === categoryId);
}

export function categoryDestinationCount(destinations: Destination[], categoryId: number): number {
  return destinations.filter((destination) => destination.categoryId === categoryId).length;
}

export function destinationTags(tags: Tag[], destination: Destination): Tag[] {
  return tags.filter((tag) => destination.tagIds.includes(tag.id));
}

export function tagNames(tags: Tag[], destination: Destination): string {
  return destinationTags(tags, destination)
    .slice(0, 2)
    .map((tag) => tag.name)
    .join(' · ');
}

export function destinationImages(destination: Destination): string[] {
  return Array.from(
    new Set(
      [destination.coverImage, ...destination.gallery.map((image) => image.fileName)].filter(
        (image): image is string => Boolean(image),
      ),
    ),
  );
}

export function filterDestinations(
  destinations: Destination[],
  options: {
    query?: string;
    categoryId?: number | null;
    tagId?: number | null;
    sortByRating?: boolean;
    limit?: number | null;
    categories?: Category[];
    tags?: Tag[];
  } = {},
): Destination[] {
  const query = options.query?.trim().toLocaleLowerCase('es-CO') ?? '';
  let list = destinations;

  if (options.categoryId != null) {
    list = list.filter((item) => item.categoryId === options.categoryId);
  }
  if (options.tagId != null) {
    list = list.filter((item) => item.tagIds.includes(options.tagId!));
  }
  if (options.sortByRating) {
    list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }
  if (query) {
    const categories = options.categories ?? [];
    const tags = options.tags ?? [];
    list = list.filter((item) =>
      [
        item.title,
        item.summary,
        categoryName(categories, item.categoryId),
        ...destinationTags(tags, item).map((tag) => tag.name),
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('es-CO')
        .includes(query),
    );
  }
  if (options.limit != null && !query) {
    list = list.slice(0, options.limit);
  }
  return list;
}

export function latestDestinations(destinations: Destination[], limit = 3): Destination[] {
  return [...destinations]
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
    .slice(0, limit);
}
