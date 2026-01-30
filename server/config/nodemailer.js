import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // Using Gmail's service
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SMTP_PASS,
    },
});

export default transporter;
