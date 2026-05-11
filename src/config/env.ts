export const config = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  pineconeApiKey: process.env.PINECONE_API_KEY,
  huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
  pineconeIndex: process.env.PINECONE_INDEX,
  mongodbUri: process.env.MONGODB_URI,
  authSecret: process.env.AUTH_SECRET,
  qdrantUrl: process.env.QDRANT_URL,
  qdrantApiKey: process.env.QDRANT_API_KEY,
  qdrantCollection: process.env.QDRANT_COLLECTION,
  vectorDb: process.env.VECTOR_DB || 'pinecone',
};
