import { Pinecone } from "@pinecone-database/pinecone";
import { config } from "@/config/env";

import { HfInference } from "@huggingface/inference";

export class MemoryService {
  private pc: Pinecone;
  private hf: HfInference;
  private indexName: string;

  constructor() {
    this.pc = new Pinecone({ apiKey: config.pineconeApiKey || "mock-key" });
    this.hf = new HfInference(config.huggingfaceApiKey);
    this.indexName = config.pineconeIndex || "mindcare-memory";
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      if (!config.huggingfaceApiKey) {
        return Array(384).fill(0).map(() => Math.random());
      }
      const output = await this.hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: text,
      });
      return output as number[];
    } catch (e) {
      console.error("[Memory] Embedding generation failed:", e);
      return Array(384).fill(0).map(() => Math.random());
    }
  }

  async storeInteraction(userId: string, text: string, type: "user" | "agent", metadata: any = {}) {
    try {
      if (!config.pineconeApiKey) {
        console.warn("[Memory] Pinecone API key missing, running in dry mode.");
        return;
      }
      
      const index = this.pc.Index(this.indexName);
      const vector = await this.generateEmbedding(text);
      
      await index.upsert([{
        id: `${userId}-${Date.now()}`,
        values: vector,
        metadata: {
          userId,
          text,
          type,
          timestamp: new Date().toISOString(),
          ...metadata
        }
      }] as any);
    } catch (e) {
      console.error("[Memory] Failed to store interaction: ", e);
    }
  }

  async fetchRelevantContext(userId: string, queryText: string, topK = 5): Promise<string[]> {
    try {
      if (!config.pineconeApiKey) return [];
      
      const index = this.pc.Index(this.indexName);
      const vector = await this.generateEmbedding(queryText);

      const results = await index.query({
        vector: vector,
        topK,
        filter: { userId: { $eq: userId } },
        includeMetadata: true
      });

      return results.matches
        .filter(m => m.metadata && typeof m.metadata.text === 'string')
        .map(m => m.metadata?.text as string);
    } catch (e) {
      console.error("[Memory] Failed to fetch context:", e);
      return [];
    }
  }
}

export const memoryService = new MemoryService();
