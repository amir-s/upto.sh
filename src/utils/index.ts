import qrcode from "qrcode-terminal";

export const generateQRCode = async (text: string) => {
  return new Promise<string>((resolve, reject) => {
    qrcode.generate(text, { small: true }, (qrcode: string) => {
      resolve(qrcode);
    });
  });
};

const CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const randomString = (length: number) => {
  let result = "";
  for (let i = length; i > 0; --i) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
};
