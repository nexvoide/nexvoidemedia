declare module '@emailjs/browser' {
    interface EmailJSResponseStatus {
      status: number;
      text: string;
    }
  
    interface EmailJS {
      send: (
        serviceId: string,
        templateId: string,
        templateParams: Record<string, unknown>,
        publicKey: string
      ) => Promise<EmailJSResponseStatus>;
    }
  
    const emailjs: EmailJS;
    export default emailjs;
  }