declare module '@launchql/mjml' {
  const generate: (props: {
    title?: string;
    link?: string;
    linkText?: string;
    message?: string;
    subMessage?: string;
    bodyBgColor?: string;
    headerBgColor?: string;
    messageBgColor?: string;
    messageTextColor?: string;
    messageButtonBgColor?: string;
    messageButtonTextColor?: string;
    companyName?: string;
    supportEmail?: string;
    website?: string;
    logo?: string;
    headerImageProps?: {
      alt?: string;
      align?: string;
      border?: string;
      width?: string;
      paddingLeft?: string;
      paddingRight?: string;
      paddingBottom?: string;
      paddingTop?: string;
    };
  }) => string;
  export { generate };
}
