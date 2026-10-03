import { getDemandForecast, uploadProductImage } from './api';

describe('API request helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  test('keeps the bearer token on multipart product uploads', async () => {
    localStorage.setItem('farmdirect_token', 'access-token');

    await uploadProductImage(12, new File(['image'], 'tomato.png', { type: 'image/png' }));

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer access-token');
    expect(options.headers['Content-Type']).toBeUndefined();
  });

  test('sends both crop and location to the demand forecast endpoint', async () => {
    await getDemandForecast('Tomato', 'Guntur');

    const [url] = global.fetch.mock.calls[0];
    expect(new URL(url).searchParams.get('crop')).toBe('Tomato');
    expect(new URL(url).searchParams.get('location')).toBe('Guntur');
  });
});