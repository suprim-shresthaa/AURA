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

// console.log(process.env.SENDER_EMAIL, process.env.SMTP_PASS);


export default transporter;


// Helper function to send email
export const sendAdoptionStatusEmail = async (userEmail, petName, status) => {
    const subject = status === 'Approved'
        ? 'Congratulations! Your Adoption Request Has Been Approved'
        : 'Update on Your Adoption Request';

    const text = status === 'Approved'
        ? `We're thrilled to inform you that your adoption request for ${petName} has been approved! Please contact us to arrange the next steps.`
        : `We regret to inform you that your adoption request for ${petName} has not been approved at this time. We appreciate your interest and encourage you to consider other pets available for adoption.`;

    try {
        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: userEmail,
            subject,
            text,
            // You can also add html version if you want
        });
        console.log(`Adoption status email sent to ${userEmail}`);
    } catch (error) {
        console.error(`Error sending email to ${userEmail}:`, error);
        // Don't throw error here as we don't want email failure to affect the adoption process
    }
};