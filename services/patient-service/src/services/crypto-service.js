import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const algorithm = process.env.ALGORITHM;
const secretKey = process.env.ENCRYPTION_KEY;
const ivLength = 16;

export const encrypt = (text) => {
    if (text === null || text === undefined || text === '') {
        return text;
    }

    const iv = randomBytes(ivLength);
    const cipher = createCipheriv(algorithm, Buffer.from(secretKey), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
};

export const decrypt = (text) => {
    if (!text || !text.includes(':')) {
        return text;
    }

    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = parts.join(':');

    const decipher = createDecipheriv(algorithm, Buffer.from(secretKey), iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};