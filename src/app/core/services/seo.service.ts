import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Catalogue, Category, Destination, Tag } from '../models/catalogue';
import { slugify } from '../utils/slugify';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  update(path: string, catalogue: Catalogue | null): void {
    const parts = path.split('?')[0].split('/').filter(Boolean).map(decodeURIComponent);
    const route = parts[0] ?? '';
    const destination = route === 'blog' && parts[1]
      ? catalogue?.destinations.find((item) => item.slug === parts[1])
      : undefined;
    const category = route === 'categorias' && parts[1]
      ? catalogue?.categories.find((item) => slugify(item.name) === parts[1])
      : undefined;
    const tag = route === 'actividades' && parts[1]
      ? catalogue?.tags.find((item) => slugify(item.name) === parts[1])
      : undefined;

    const canonicalPath = path.split('?')[0] === '/descubrir' ? '/ranking' : path.split('?')[0] || '/';
    const url = `https://fusatour.osmanjimenez.dev${canonicalPath}`;
    const seo = this.resolveCopy(destination, category, tag, canonicalPath);
    const image = destination?.coverImage
      ? `https://fusatour.osmanjimenez.dev/images/${encodeURIComponent(destination.coverImage)}`
      : 'https://fusatour.osmanjimenez.dev/images/Fondo.jpg';

    this.title.setTitle(seo.title);
    this.meta.updateTag({ name: 'description', content: seo.description });
    this.meta.updateTag({ property: 'og:title', content: seo.title });
    this.meta.updateTag({ property: 'og:description', content: seo.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ name: 'twitter:title', content: seo.title });
    this.meta.updateTag({ name: 'twitter:description', content: seo.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    const canonical = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    canonical?.setAttribute('href', url);
    this.document.querySelectorAll('link[hreflang]').forEach((link) => link.setAttribute('href', url));
    this.setStructuredData(destination, url, seo.description, image);
  }

  private resolveCopy(
    destination: Destination | undefined,
    category: Category | undefined,
    tag: Tag | undefined,
    canonicalPath: string,
  ): { title: string; description: string } {
    if (destination) {
      return {
        title: `${destination.title} en Fusagasugá | FusaTour`,
        description: `${destination.summary} Conoce este lugar turístico de Fusagasugá, Cundinamarca.`,
      };
    }
    if (category) {
      return {
        title: `${category.name} en Fusagasugá: lugares para visitar | FusaTour`,
        description: `Descubre lugares de ${category.name.toLocaleLowerCase('es-CO')} en Fusagasugá: planes, rutas y sitios turísticos para recorrer la ciudad jardín.`,
      };
    }
    if (tag) {
      return {
        title: `${tag.name} en Fusagasugá: planes y lugares | FusaTour`,
        description: `Encuentra planes de ${tag.name.toLocaleLowerCase('es-CO')} en Fusagasugá y descubre lugares turísticos para visitar en la ciudad jardín.`,
      };
    }
    if (canonicalPath === '/categorias') {
      return {
        title: 'Lugares turísticos de Fusagasugá | FusaTour',
        description:
          'Encuentra lugares turísticos de Fusagasugá: parques, naturaleza, monumentos, murales y rutas para conocer la ciudad jardín.',
      };
    }
    if (canonicalPath === '/actividades') {
      return {
        title: 'Qué hacer en Fusagasugá: actividades y planes | FusaTour',
        description:
          'Busca planes y actividades en Fusagasugá: senderismo, caminatas, ciclopaseos, fotografía, naturaleza y cultura local.',
      };
    }
    if (canonicalPath === '/ranking') {
      return {
        title: 'Qué visitar en Fusagasugá: lugares recomendados | FusaTour',
        description: 'Una selección de lugares turísticos recomendados para visitar en Fusagasugá, Cundinamarca.',
      };
    }
    return {
      title: 'Fusagasugá: lugares turísticos, parques y planes | FusaTour',
      description:
        'Descubre qué hacer en Fusagasugá: lugares turísticos, parques, senderos, monumentos, murales y planes para recorrer la ciudad jardín de Colombia.',
    };
  }

  private setStructuredData(
    destination: Destination | undefined,
    url: string,
    description: string,
    image: string,
  ): void {
    const id = 'fusatour-structured-data';
    let script = this.document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = this.document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(
      destination
        ? {
            '@context': 'https://schema.org',
            '@type': 'TouristAttraction',
            name: destination.title,
            description,
            image,
            url,
            address: { '@type': 'PostalAddress', addressLocality: 'Fusagasugá', addressCountry: 'CO' },
          }
        : {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'FusaTour',
            url,
            inLanguage: 'es-CO',
            description,
          },
    );
  }
}
