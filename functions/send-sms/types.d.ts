declare module 'simple-smtp-server' {
  export function send(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void>;
}
