export function imageUrl(image: string | null): string {
  if (!image) {
    return '/images/Fondo.webp';
  }

  const path = image
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `/images/${path}`;
}
