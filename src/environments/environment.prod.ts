const env = (typeof window !== 'undefined' && (window as any).__ENV__) || {};

export const environment = {
  production: true,
  apiGatewayUrl: env.API_GATEWAY_URL || 'https://api.hdim.example.com',
  wsEndpoint: env.WS_ENDPOINT || 'wss://api.hdim.example.com/ws/evaluation-progress',
  tenantId: 'acme-health',
  authEnabled: true,
};
