import { createMockContext } from '../../../tests/helpers/mock-context';

const loadHandler = () => {
  const mod = require('../handler');
  return mod.default ?? mod;
};

describe('simple-email handler', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.SIMPLE_EMAIL_DRY_RUN = 'false';
    process.env.EMAIL_SEND_USE_SMTP = 'false';
  });

  afterEach(() => {
    delete process.env.SIMPLE_EMAIL_DRY_RUN;
    delete process.env.EMAIL_SEND_USE_SMTP;
    delete process.env.MAILGUN_FROM;
    delete process.env.SMTP_FROM;
  });

  describe('validation', () => {
    it('throws on missing "to"', async () => {
      const handler = loadHandler();
      await expect(
        handler({ subject: 'test', html: '<p>hi</p>' }, createMockContext())
      ).rejects.toThrow("Missing required field 'to'");
    });

    it('throws on missing "subject"', async () => {
      const handler = loadHandler();
      await expect(
        handler({ to: 'a@b.com', html: '<p>hi</p>' }, createMockContext())
      ).rejects.toThrow("Missing required field 'subject'");
    });

    it('throws when neither html nor text provided', async () => {
      const handler = loadHandler();
      await expect(
        handler({ to: 'a@b.com', subject: 'hi' }, createMockContext())
      ).rejects.toThrow("Either 'html' or 'text' must be provided");
    });

    it('accepts text-only email (no html)', async () => {
      const handler = loadHandler();
      const result = await handler(
        { to: 'a@b.com', subject: 'Hi', text: 'hello' },
        createMockContext()
      );
      expect(result).toEqual({ complete: true });
    });
  });

  describe('sending', () => {
    it('returns { complete: true } on valid payload', async () => {
      const handler = loadHandler();
      const result = await handler(
        { to: 'a@b.com', subject: 'Hi', html: '<p>hi</p>' },
        createMockContext()
      );
      expect(result).toEqual({ complete: true });
    });

    it('calls postmaster.send by default (not SMTP)', async () => {
      const handler = loadHandler();
      await handler(
        { to: 'a@b.com', subject: 'Hi', html: '<p>hi</p>' },
        createMockContext()
      );
      const postmaster = require('@constructive-io/postmaster');
      expect(postmaster.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'a@b.com', subject: 'Hi' })
      );
    });

    it('uses SMTP when EMAIL_SEND_USE_SMTP=true', async () => {
      process.env.EMAIL_SEND_USE_SMTP = 'true';
      const handler = loadHandler();
      await handler(
        { to: 'a@b.com', subject: 'Hi', html: '<p>hi</p>' },
        createMockContext()
      );
      const smtp = require('simple-smtp-server');
      expect(smtp.send).toHaveBeenCalled();
    });

    it('uses MAILGUN_FROM as fallback when from not in payload', async () => {
      process.env.MAILGUN_FROM = 'noreply@example.com';
      const handler = loadHandler();
      await handler(
        { to: 'a@b.com', subject: 'Hi', html: '<p>hi</p>' },
        createMockContext()
      );
      const postmaster = require('@constructive-io/postmaster');
      expect(postmaster.send).toHaveBeenCalledWith(
        expect.objectContaining({ from: 'noreply@example.com' })
      );
    });

    it('prefers payload "from" over env fallback', async () => {
      process.env.MAILGUN_FROM = 'env@example.com';
      const handler = loadHandler();
      await handler(
        {
          to: 'a@b.com',
          subject: 'Hi',
          html: '<p>hi</p>',
          from: 'payload@example.com'
        },
        createMockContext()
      );
      const postmaster = require('@constructive-io/postmaster');
      expect(postmaster.send).toHaveBeenCalledWith(
        expect.objectContaining({ from: 'payload@example.com' })
      );
    });
  });

  describe('dry-run mode', () => {
    beforeEach(() => {
      process.env.SIMPLE_EMAIL_DRY_RUN = 'true';
    });

    it('returns { complete: true } without sending', async () => {
      const handler = loadHandler();
      const result = await handler(
        { to: 'a@b.com', subject: 'Hi', html: '<p>hi</p>' },
        createMockContext()
      );
      expect(result).toEqual({ complete: true });
      const postmaster = require('@constructive-io/postmaster');
      const smtp = require('simple-smtp-server');
      expect(postmaster.send).not.toHaveBeenCalled();
      expect(smtp.send).not.toHaveBeenCalled();
    });
  });
});
