import redis from 'redis';

function createClient() {
  const client = process.env.NODE_ENV === 'production' ? redis.createClient(6379, 'redis') : redis.createClient();

  return client;
}

const redisClient = createClient();

export default redisClient;

export {
  createClient,
};
