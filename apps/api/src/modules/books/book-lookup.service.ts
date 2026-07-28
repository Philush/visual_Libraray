import { Injectable } from '@nestjs/common';

export interface BookCandidate {
  title: string;
  author: string;
  isbn: string | null;
  pageCount: number | null;
  publishYear: number | null;
  coverUrl: string | null;
  description: string | null;
}

interface OpenLibraryDoc {
  title?: string;
  author_name?: string[];
  isbn?: string[];
  number_of_pages_median?: number;
  first_publish_year?: number;
  cover_i?: number;
}

interface OpenLibraryResponse {
  docs?: OpenLibraryDoc[];
}

@Injectable()
export class BookLookupService {
  async search(q: string): Promise<BookCandidate[]> {
    const params = new URLSearchParams({
      q,
      limit: '7',
      fields: 'title,author_name,isbn,number_of_pages_median,first_publish_year,cover_i',
    });

    const res = await fetch(`https://openlibrary.org/search.json?${params.toString()}`);
    if (!res.ok) return [];

    const data = (await res.json()) as OpenLibraryResponse;
    if (!data.docs?.length) return [];

    return data.docs
      .map((doc) => this.normalize(doc))
      .filter((b): b is BookCandidate => b !== null);
  }

  private normalize(doc: OpenLibraryDoc): BookCandidate | null {
    if (!doc.title) return null;

    const isbn13 = doc.isbn?.find((id) => id.length === 13) ?? null;
    const isbn10 = doc.isbn?.find((id) => id.length === 10) ?? null;

    const coverUrl = doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : null;

    return {
      title: doc.title,
      author: doc.author_name?.join(', ') ?? '',
      isbn: isbn13 ?? isbn10,
      pageCount: doc.number_of_pages_median ?? null,
      publishYear: doc.first_publish_year ?? null,
      coverUrl,
      description: null,
    };
  }
}
