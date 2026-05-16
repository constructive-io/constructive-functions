export type ChunkStrategy = 'fixed' | 'sentence' | 'paragraph';

export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  strategy?: ChunkStrategy;
}

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

export function chunkText(
  text: string,
  options: ChunkOptions = {}
): string[] {
  const {
    chunkSize = DEFAULT_CHUNK_SIZE,
    chunkOverlap = DEFAULT_CHUNK_OVERLAP,
    strategy = 'fixed'
  } = options;

  if (!text || text.trim().length === 0) {
    return [];
  }

  switch (strategy) {
    case 'sentence':
      return chunkBySentence(text, chunkSize, chunkOverlap);
    case 'paragraph':
      return chunkByParagraph(text, chunkSize, chunkOverlap);
    case 'fixed':
    default:
      return chunkByFixed(text, chunkSize, chunkOverlap);
  }
}

export function chunkByFixed(
  text: string,
  chunkSize: number,
  chunkOverlap: number
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - chunkOverlap;
    if (chunkSize <= chunkOverlap) break;
  }

  return chunks;
}

export function chunkBySentence(
  text: string,
  chunkSize: number,
  chunkOverlap: number
): string[] {
  const sentenceMatches = text.match(/[^.!?]+[.!?]+/g) || [];
  const lastMatch = sentenceMatches.length > 0
    ? sentenceMatches[sentenceMatches.length - 1]
    : '';
  const lastIndex = lastMatch ? text.lastIndexOf(lastMatch) + lastMatch.length : 0;
  const trailing = text.slice(lastIndex).trim();
  const sentences = trailing ? [...sentenceMatches, trailing] : (sentenceMatches.length > 0 ? sentenceMatches : [text]);
  const chunks: string[] = [];
  let currentChunk = '';
  let overlapBuffer: string[] = [];

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if ((currentChunk + ' ' + trimmed).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = overlapBuffer.join(' ') + ' ' + trimmed;
      overlapBuffer = [];
    } else {
      currentChunk = currentChunk ? currentChunk + ' ' + trimmed : trimmed;
    }
    overlapBuffer.push(trimmed);
    while (overlapBuffer.join(' ').length > chunkOverlap && overlapBuffer.length > 1) {
      overlapBuffer.shift();
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

export function chunkByParagraph(
  text: string,
  chunkSize: number,
  chunkOverlap: number
): string[] {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if ((currentChunk + '\n\n' + trimmed).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmed;
    } else {
      currentChunk = currentChunk ? currentChunk + '\n\n' + trimmed : trimmed;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.flatMap(chunk =>
    chunk.length > chunkSize * 1.5 ? chunkByFixed(chunk, chunkSize, chunkOverlap) : [chunk]
  );
}
