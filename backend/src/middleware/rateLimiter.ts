import rateLimit from 'express-rate-limit';

export const loginRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes window
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: 'Chaqiruvlar soni oshib ketdi! Noto\'g\'ri PIN kod sababli 5 daqiqa bloklandiz.'
  }
});
