import { Category, Destination, Tag } from '../models/catalogue';
import { slugify } from './slugify';

export function categoryLink(category: Category): string[] {
  return ['/categorias', slugify(category.name)];
}

export function tagLink(tag: Tag): string[] {
  return ['/actividades', slugify(tag.name)];
}

export function destinationLink(destination: Destination): string[] {
  return ['/blog', destination.slug];
}
