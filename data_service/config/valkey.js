import { GlideClient } from "@valkey/valkey-glide";

let glideClient = null;

export const connectValkey = async () => {
  if(glideClient) return glideClient;

  try {
    const addresses = [
      {
        host: process.env.VALKEY_HOST,
        port: Number(process.env.VALKEY_PORT),
      }
    ];

    glideClient = await GlideClient.createClient({
      addresses: addresses,
      requestTimeout: 1000,
      reconnectStrategy: { numberOfRetries: 3, factor: 2 },
    });

    const pong = await glideClient.ping();

    if(pong !== 'PONG'){
      throw new Error('Valkey connection failed');
    }

    console.log('✅ Valkey GLIDE: Connection established successfully');
    return glideClient;
  } catch (error) {
    glideClient = null;
    console.error('❌ Valkey GLIDE: Connection failed', error);
    throw error;
  }
};

export const getValkeyClient = () => {
  if(!glideClient){
    throw new Error('Valkey not connected');
  }
  return glideClient;
};

export const closeValkeyConnection = async () => {
  if(!glideClient) return;

  try {
    await glideClient.close();
    glideClient = null;
    console.log('✅ Valkey GLIDE: Connection closed successfully');
  } catch (error) {
    console.error('❌ Valkey GLIDE: Failed to close connection', error);
    throw error;
  }
};