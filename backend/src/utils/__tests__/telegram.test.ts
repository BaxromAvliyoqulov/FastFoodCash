import { sendTelegramMessage } from '../telegram';

// Store original fetch and env
const originalFetch = global.fetch;
const originalEnv = process.env;

describe('Telegram Util', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
  });

  it('returns false when tokens are missing', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    
    const result = await sendTelegramMessage('Test Message');
    expect(result).toBe(false);
  });

  it('sends message successfully when tokens are valid', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test_token';
    process.env.TELEGRAM_CHAT_ID = 'test_chat_id';
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('ok')
    } as unknown as Response);

    const result = await sendTelegramMessage('Test Message');
    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottest_token/sendMessage',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          chat_id: 'test_chat_id',
          text: 'Test Message',
          parse_mode: 'HTML'
        })
      })
    );
  });
});
