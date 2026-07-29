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

// ── Google Books ────────────────────────────────────────────────────────────

interface GoogleVolume {
  volumeInfo?: {
    title?: string;
    authors?: string[];
    industryIdentifiers?: { type: string; identifier: string }[];
    pageCount?: number;
    publishedDate?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    description?: string;
  };
}

interface GoogleBooksResponse {
  items?: GoogleVolume[];
}

// ── Open Library (fallback) ─────────────────────────────────────────────────

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

// ───────────────────────────────────────────────────────────────────────────

@Injectable()
export class BookLookupService {
  async search(q: string): Promise<BookCandidate[]> {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

    if (apiKey) {
      const results = await this.searchGoogleBooks(q, apiKey);
      if (results.length > 0) return results;
    }

    return this.searchOpenLibrary(q);
  }

  // ── Google Books ──────────────────────────────────────────────────────────

  private async searchGoogleBooks(q: string, apiKey: string): Promise<BookCandidate[]> {
    const params = new URLSearchParams({
      q,
      maxResults: '7',
      printType: 'books',
      key: apiKey,
    });

    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?${params.toString()}`);
      if (!res.ok) return [];

      const data = (await res.json()) as GoogleBooksResponse;
      return (data.items ?? [])
        .map((item) => this.normalizeGoogle(item))
        .filter((b): b is BookCandidate => b !== null);
    } catch {
      return [];
    }
  }

  private normalizeGoogle(item: GoogleVolume): BookCandidate | null {
    const info = item.volumeInfo;
    if (!info?.title) return null;

    const isbn =
      info.industryIdentifiers?.find((id) => id.type === 'ISBN_13')?.identifier ??
      info.industryIdentifiers?.find((id) => id.type === 'ISBN_10')?.identifier ??
      null;

    const publishYear = info.publishedDate
      ? parseInt(info.publishedDate.slice(0, 4), 10) || null
      : null;

    const rawCover = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail ?? null;
    const coverUrl = rawCover
      ? rawCover.replace('http://', 'https://').replace('&zoom=1', '')
      : null;

    return {
      title: info.title,
      author: info.authors?.join(', ') ?? '',
      isbn,
      pageCount: info.pageCount ?? null,
      publishYear: publishYear && publishYear > 999 ? publishYear : null,
      coverUrl,
      description: info.description ?? null,
    };
  }

  // ── Open Library (fallback) ───────────────────────────────────────────────

  private async searchOpenLibrary(q: string): Promise<BookCandidate[]> {
    const params = new URLSearchParams({
      q,
      limit: '7',
      fields: 'title,author_name,isbn,number_of_pages_median,first_publish_year,cover_i',
    });

    try {
      const res = await fetch(`https://openlibrary.org/search.json?${params.toString()}`);
      if (!res.ok) return [];

      const data = (await res.json()) as OpenLibraryResponse;
      return (data.docs ?? [])
        .map((doc) => this.normalizeOpenLibrary(doc))
        .filter((b): b is BookCandidate => b !== null);
    } catch {
      return [];
    }
  }

  private normalizeOpenLibrary(doc: OpenLibraryDoc): BookCandidate | null {
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
