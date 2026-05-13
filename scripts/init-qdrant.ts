import { QdrantClient } from '@qdrant/js-client-rest';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const COLLECTION_NAME = process.env.QDRANT_COLLECTION || 'my_collection';
const VECTOR_DIM = 384; // Matches the model sentence-transformers/all-MiniLM-L6-v2

async function init() {
  if (!QDRANT_URL) {
    console.error('QDRANT_URL is missing in .env.local');
    return;
  }

  const client = new QdrantClient({
    url: QDRANT_URL,
    apiKey: QDRANT_API_KEY,
  });

  console.log(`Checking for collection: ${COLLECTION_NAME}...`);
  try {
    const collections = await client.getCollections();
    const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

    if (exists) {
      console.log(`Collection ${COLLECTION_NAME} already exists.`);
    } else {
      console.log(`Creating collection ${COLLECTION_NAME}...`);
      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_DIM,
          distance: 'Cosine',
        },
      });
      console.log('Collection created successfully!');
    }
  } catch (error) {
    console.error('Failed to initialize Qdrant:', error);
  }
}

init();
