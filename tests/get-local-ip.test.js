import { getLocalIp } from '../utils/get-local-ip.js';

describe('getLocalIp', () => {
  it('should return a valid IPv4 address', () => {
    const ip = getLocalIp();
    expect(typeof ip).toBe('string');
    expect(ip).toMatch(/^\d{1,3}(\.\d{1,3}){3}$/);
  });
});
