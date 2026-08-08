import { closeShiftBlind } from '../shift.controller';
import { prisma } from '../../db';

// Mock Prisma & Telegram
jest.mock('../../db', () => ({
  prisma: {
    shift: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb({
      expense: {
        deleteMany: jest.fn().mockResolvedValue({}),
        createMany: jest.fn().mockResolvedValue({}),
      },
      shiftCashAudit: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'audit-123', ...data })),
      },
      shift: {
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'shift-1', status: 'CLOSED', ...data })),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
      }
    })),
  }
}));

jest.mock('../../utils/telegram', () => ({
  sendTelegramMessage: jest.fn(),
}));

describe('Shift Controller - Blind Reconciliation & Expenses Audit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates expected cash correctly including initial cash, sales, and expenses', async () => {
    const mockShift = {
      id: 'shift-1',
      cashierId: 'cashier-1',
      openedAt: new Date(),
      status: 'OPEN',
      initialCash: 100000,
      cashier: { fullName: 'Ali Kassir', phone: '+998901234567' },
      orders: [
        { paymentType: 'CASH', totalAmount: 50000 },
        { paymentType: 'CASH', totalAmount: 30000 },
        { paymentType: 'CARD', totalAmount: 40000 }
      ],
      expenses: []
    };

    (prisma.shift.findUnique as jest.Mock).mockResolvedValue(mockShift);

    const req = {
      body: {
        shiftId: 'shift-1',
        declaredCash: 130000, // Expected = 100k + 80k - 50k = 130k
        declaredCard: 40000,
        declaredQr: 0,
        notes: 'Hamma narsa to\'g\'ri',
        expenses: [{ amount: 50000, reason: 'Go\'sht xaridi' }]
      }
    } as any;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    } as any;

    await closeShiftBlind(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('muvaffaqiyatli yopildi'),
        audit: expect.objectContaining({
          expectedCash: 130000, // 100000 + 80000 - 50000
          declaredCash: 130000,
          difference: 0,
          status: 'BALANCED'
        })
      })
    );
  });

  it('detects shortage (kamomad) when declared cash is less than expected', async () => {
    const mockShift = {
      id: 'shift-2',
      cashierId: 'cashier-1',
      openedAt: new Date(),
      status: 'OPEN',
      initialCash: 50000,
      cashier: { fullName: 'Ali Kassir', phone: '+998901234567' },
      orders: [{ paymentType: 'CASH', totalAmount: 100000 }],
      expenses: []
    };

    (prisma.shift.findUnique as jest.Mock).mockResolvedValue(mockShift);

    const req = {
      body: {
        shiftId: 'shift-2',
        declaredCash: 120000, // Expected = 150k -> Difference = -30,000 (SHORTAGE)
        declaredCard: 0,
        declaredQr: 0,
        expenses: []
      }
    } as any;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    } as any;

    await closeShiftBlind(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        audit: expect.objectContaining({
          expectedCash: 150000,
          declaredCash: 120000,
          difference: -30000,
          status: 'SHORTAGE'
        })
      })
    );
  });
});
