import { Pinecone } from '@pinecone-database/pinecone';
import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from '@/config/env';
import { HfInference } from '@huggingface/inference';
import { embeddingCache, retrievalCache } from '@/lib/cache';

type VectorDbProvider = 'pinecone' | 'qdrant';

const VECTOR_DIM = 384;
const MIN_SIMILARITY = 0.6;
const MAX_CONTEXT_ITEMS = 3;

export class MemoryService {
  private pc: Pinecone | null = null;
  private qc: QdrantClient | null = null;
  private hf: HfInference;
  private indexName: string;
  private provider: VectorDbProvider;

  constructor() {
    this.hf = new HfInference(config.huggingfaceApiKey);
    this.provider = (config.vectorDb as VectorDbProvider) || 'pinecone';
    this.indexName =
      this.provider === 'qdrant'
        ? config.qdrantCollection || 'my_collection'
        : config.pineconeIndex || 'mindcare-memory';

    if (this.provider === 'pinecone' && config.pineconeApiKey) {
      this.pc = new Pinecone({ apiKey: config.pineconeApiKey });
    } else if (this.provider === 'qdrant' && config.qdrantUrl) {
      this.qc = new QdrantClient({
        url: config.qdrantUrl,
        apiKey: config.qdrantApiKey,
      });
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const cached = embeddingCache.get(text);
    if (cached) return cached;

    if (!config.huggingfaceApiKey) {
      console.warn('[Memory] No HuggingFace API key. Embedding generation unavailable.');
      throw new Error('Embedding generation requires HUGGINGFACE_API_KEY');
    }
    try {
      const output = (await this.hf.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: text,
      })) as number[];
      embeddingCache.set(text, output);
      return output;
    } catch (err) {
      console.error('[Memory] Embedding generation failed:', err);
      throw new Error('Embedding generation failed');
    }
  }

  async storeInteraction(userId: string, text: string, type: 'user' | 'agent', metadata: any = {}) {
    if (!text.trim()) return;

    try {
      const vector = await this.generateEmbedding(text);
      const timestamp = new Date().toISOString();

      if (this.provider === 'qdrant' && this.qc) {
        await this.qc.upsert(this.indexName, {
          wait: false,
          points: {
            points: [
              {
                id: `${userId}-${Date.now()}`,
                vector,
                payload: { userId, text, type, timestamp, ...metadata },
              },
            ],
          },
        } as any);
        return;
      }

      if (this.provider === 'pinecone' && this.pc && config.pineconeApiKey) {
        const index = this.pc.Index(this.indexName);
        await index.upsert([
          {
            id: `${userId}-${Date.now()}`,
            values: vector,
            metadata: { userId, text, type, timestamp, ...metadata },
          },
        ] as any);
        return;
      }

      console.warn('[Memory] No vector DB configured, running in dry mode.');
    } catch (err) {
      console.error('[Memory] Failed to store interaction: ', err);
    }
  }

  async fetchRelevantContext(userId: string, queryText: string, topK = 3): Promise<string[]> {
    const cached = retrievalCache.get(userId, queryText);
    if (cached) return cached;

    try {
      const vector = await this.generateEmbedding(queryText);

      if (this.provider === 'qdrant' && this.qc) {
        const results = await this.qc.search(this.indexName, {
          vector,
          limit: topK,
          filter: {
            must: [{ key: 'userId', match: { value: userId } }],
          },
          with_payload: true,
        });

        const texts = results
          .filter(
            (m) => m.score > MIN_SIMILARITY && m.payload && typeof m.payload.text === 'string'
          )
          .slice(0, MAX_CONTEXT_ITEMS)
          .map((m) => m.payload?.text as string);

        retrievalCache.set(userId, queryText, texts);
        return texts;
      }

      if (this.provider === 'pinecone' && this.pc && config.pineconeApiKey) {
        const index = this.pc.Index(this.indexName);
        const results = await index.query({
          vector,
          topK,
          filter: { userId: { $eq: userId } },
          includeMetadata: true,
        });

        const texts = results.matches
          .filter(
            (m) =>
              m.score &&
              m.score > MIN_SIMILARITY &&
              m.metadata &&
              typeof m.metadata.text === 'string'
          )
          .slice(0, MAX_CONTEXT_ITEMS)
          .map((m) => m.metadata?.text as string);

        retrievalCache.set(userId, queryText, texts);
        return texts;
      }

      return [];
    } catch (err) {
      console.error('[Memory] Failed to fetch context:', err);
      return [];
    }
  }
}

export const memoryService = new MemoryService();
