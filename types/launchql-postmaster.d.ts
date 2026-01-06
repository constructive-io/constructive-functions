declare module '@launchql/postmaster' {
  export function send(opts: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    from?: string;
    replyTo?: string;
  }): Promise<void>;
}
