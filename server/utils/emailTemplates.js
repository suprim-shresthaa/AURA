import transporter from "../config/nodemailer.js";

const emailTemplates = {
    // Initial OTP verification
    verifyEmail: (otp) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Welcome to AURA!</h2>
      <p>Please verify your email address to complete your registration.</p>
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h3 style="margin: 0; font-size: 24px; letter-spacing: 2px;">${otp}</h3>
      </div>
      <p>This code will expire in 3 minutes.</p>
      <p style="color: #64748b; font-size: 14px;">If you didn't request this, please ignore this email.</p>
    </div>
  `,

    // Resend OTP
    resendOtp: (otp) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Your New Verification Code</h2>
      <p>Here's your new verification code for AURA:</p>
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h3 style="margin: 0; font-size: 24px; letter-spacing: 2px;">${otp}</h3>
      </div>
      <p>This code will expire in 3 minutes.</p>
      <p style="color: #64748b; font-size: 14px;">If you didn't request this, please secure your account.</p>
    </div>
  `,

    // Password reset OTP
    passwordResetOtp: (otp) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Password Reset Request</h2>
      <p>We received a request to reset your AURA account password. Use this code to verify it's you:</p>
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h3 style="margin: 0; font-size: 24px; letter-spacing: 2px;">${otp}</h3>
      </div>
      <p>This code will expire in 5 minutes.</p>
      <p style="color: #ef4444; font-size: 14px;">If you didn't request a password reset, please secure your account immediately.</p>
    </div>
  `,

    // Password reset success confirmation
    passwordResetSuccess: () => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Password Changed Successfully</h2>
      <p>Your AURA account password has been successfully updated.</p>
      <p>If you made this change, no further action is needed.</p>
      <p style="color: #ef4444; font-size: 14px;">If you didn't make this change, please secure your account immediately.</p>
    </div>
  `,

    // Ban notification
    banNotification: (userName, remarks, adminEmail) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">Account Suspension Notice</h2>
      <p>Dear ${userName},</p>
      <p>Your AURA account has been temporarily suspended due to violation of our community guidelines.</p>
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; font-size: 18px;">Suspension Details:</h3>
        <p><strong>Reason:</strong> ${remarks || "Violation of terms of service"}</p>
        <p><strong>Action By:</strong> ${adminEmail}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>During this suspension, you won't be able to access your account.</p>
      <p>If you believe this was a mistake, please contact our support team.</p>
      <p style="color: #64748b; font-size: 14px;">This is an automated message. Please do not reply directly to this email.</p>
    </div>
  `,

    // Unban notification
    unbanNotification: (userName, adminEmail) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Account Access Restored</h2>
      <p>Dear ${userName},</p>
      <p>Your AURA account suspension has been lifted and full access has been restored.</p>
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Action By:</strong> ${adminEmail}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>You may now log in and use all platform features.</p>
      <p>Please review our community guidelines to ensure compliance.</p>
      <p style="color: #64748b; font-size: 14px;">This is an automated message. Please do not reply directly to this email.</p>
    </div>

  `,
  vendorApproved: (vendorName) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #10b981;">Vendor Approved</h2>
    <p>Dear ${vendorName},</p>
    <p>Your vendor application has been approved.</p>
  </div>
  `,
  vendorRejected: (vendorName, rejectionReason) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #ef4444;">Vendor Rejected</h2>
    <p>Dear ${vendorName},</p>
    <p>Your vendor application has been rejected.</p>
    ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ""}
    <p>You can update your application details and apply again at any time.</p>
  </div>
  `,
  // License notifications
  licenseUploaded: (userName, vehicleTypes) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f59e0b;">New License Upload Notification</h2>
    <p>Dear Admin,</p>
    <p>A new driving license has been uploaded and requires your review.</p>
    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; font-size: 18px;">License Details:</h3>
      <p><strong>User:</strong> ${userName}</p>
      <p><strong>Vehicle Type(s):</strong> ${vehicleTypes}</p>
      <p><strong>Uploaded:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <p>Please review the license in the admin dashboard and approve or reject it accordingly.</p>
    <p style="color: #64748b; font-size: 14px;">This is an automated notification. Please do not reply directly to this email.</p>
  </div>
  `,
  licenseApproved: (userName, vehicleTypes) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #10b981;">License Approved</h2>
    <p>Dear ${userName},</p>
    <p>Congratulations! Your driving license has been approved by our admin team.</p>
    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; font-size: 18px;">Approved License Details:</h3>
      <p><strong>Vehicle Type(s):</strong> ${vehicleTypes}</p>
      <p><strong>Approved On:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <p>You can now rent vehicles of the approved type(s) on our platform.</p>
    <p>Thank you for using AURA!</p>
    <p style="color: #64748b; font-size: 14px;">This is an automated message. Please do not reply directly to this email.</p>
  </div>
  `,
  licenseRejected: (userName, vehicleTypes, rejectionReason) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #ef4444;">License Rejected</h2>
    <p>Dear ${userName},</p>
    <p>We regret to inform you that your driving license has been rejected.</p>
    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; font-size: 18px;">License Details:</h3>
      <p><strong>Vehicle Type(s):</strong> ${vehicleTypes}</p>
      <p><strong>Rejection Reason:</strong> ${rejectionReason || "Please contact support for more information."}</p>
      <p><strong>Rejected On:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <p>You can upload a new license document with the required corrections and apply again.</p>
    <p>If you have any questions, please contact our support team.</p>
    <p style="color: #64748b; font-size: 14px;">This is an automated message. Please do not reply directly to this email.</p>
  </div>
  `,
  // Vehicle notifications
  vehicleUploaded: (vendorName, vehicleName, link) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f59e0b;">New Vehicle Upload Notification</h2>
    <p>Dear Admin,</p>
    <p>A new vehicle has been uploaded and requires your verification.</p>
     <p style="margin-top: 16px;">
        <a href="${link}" style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">View Vehicle</a>
      </p>
    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; font-size: 18px;">Vehicle Details:</h3>
      <p><strong>Vendor:</strong> ${vendorName}</p>
      <p><strong>Vehicle Name:</strong> ${vehicleName}</p>
      <p><strong>Uploaded:</strong> ${new Date().toLocaleString()}</p>
     
    </div>
    <p>Please review the vehicle in the admin dashboard and approve or reject it accordingly.</p>
    <p style="color: #64748b; font-size: 14px;">This is an automated notification. Please do not reply directly to this email.</p>
  </div>
  `,
  vehicleApproved: (vendorName, vehicleName, link) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #10b981;">Vehicle Approved</h2>
    <p>Dear ${vendorName},</p>
    <p>Congratulations! Your vehicle listing has been approved by our admin team.</p>
    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; font-size: 18px;">Vehicle Details:</h3>
      <p><strong>Vehicle Name:</strong> ${vehicleName}</p>
      <p><strong>Approved On:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <p>Your vehicle is now live and available for rent on our platform.</p>
    <p style="margin-top: 16px;">
        <a href="${link}" style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">View Vehicle</a>
      </p>
    <p>Thank you for using AURA!</p>
    <p style="color: #64748b; font-size: 14px;">This is an automated message. Please do not reply directly to this email.</p>
  </div>
  `,
  vehicleRejected: (vendorName, vehicleName, rejectionReason, link) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #ef4444;">Vehicle Rejected</h2>
    <p>Dear ${vendorName},</p>
    <p>We regret to inform you that your vehicle listing has been rejected.</p>
    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; font-size: 18px;">Vehicle Details:</h3>
      <p><strong>Vehicle Name:</strong> ${vehicleName}</p>
      <p><strong>Rejection Reason:</strong> ${rejectionReason || "Please contact support for more information."}</p>
      <p><strong>Rejected On:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <p>You can update your vehicle details and upload again.</p>
    <p style="margin-top: 16px;">
        <a href="${link}" style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">View Vehicle</a>
      </p>
    <p>If you have any questions, please contact our support team.</p>
    <p style="color: #64748b; font-size: 14px;">This is an automated message. Please do not reply directly to this email.</p>
  </div>
  `,

  bookingConfirmationUser: (userName, vehicleName, startDate, endDate, totalAmount, totalDays, pickupLocation, bookingId, vendorContact) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #10b981; margin: 0;">🎉 Booking Confirmed!</h1>
    </div>
    <p>Dear <strong>${userName}</strong>,</p>
    <p>Great news! Your vehicle rental booking has been confirmed and payment has been successfully processed.</p>
    
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; border-left: 4px solid #10b981; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #047857;">Booking Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Booking ID:</strong></td>
          <td style="padding: 8px 0;">${bookingId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Vehicle:</strong></td>
          <td style="padding: 8px 0;">${vehicleName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Rental Period:</strong></td>
          <td style="padding: 8px 0;">${startDate} to ${endDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Total Days:</strong></td>
          <td style="padding: 8px 0;">${totalDays} day(s)</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Total Amount Paid:</strong></td>
          <td style="padding: 8px 0; font-weight: bold; color: #10b981;">NPR ${totalAmount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Pickup Location:</strong></td>
          <td style="padding: 8px 0;">${pickupLocation}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Vendor Contact:</strong></td>
          <td style="padding: 8px 0;">${vendorContact}</td>
        </tr>
      </table>
    </div>

    <p>You can view your booking details in your dashboard. If you need to make any changes or have questions, please contact our support team.</p>
    <p>Thank you for choosing AURA! We hope you have a great rental experience.</p>
    <p style="color: #64748b; font-size: 14px; margin-top: 20px;">This is an automated message. Please do not reply directly to this email.</p>
  </div>
  `,

  bookingConfirmationVendor: (vendorName, vehicleName, userName, userContact, startDate, endDate, totalAmount, totalDays, pickupLocation, bookingId) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #3b82f6; margin: 0;">📦 New Booking Received!</h1>
    </div>
    <p>Dear <strong>${vendorName}</strong>,</p>
    <p>You have received a new confirmed booking for your vehicle. Payment has been successfully processed.</p>
    
    <div style="background-color: #eff6ff; padding: 20px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e40af;">Booking Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Booking ID:</strong></td>
          <td style="padding: 8px 0;">${bookingId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Vehicle:</strong></td>
          <td style="padding: 8px 0;">${vehicleName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Customer Name:</strong></td>
          <td style="padding: 8px 0;">${userName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Customer Contact:</strong></td>
          <td style="padding: 8px 0;">${userContact}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Rental Period:</strong></td>
          <td style="padding: 8px 0;">${startDate} to ${endDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Total Days:</strong></td>
          <td style="padding: 8px 0;">${totalDays} day(s)</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Total Amount:</strong></td>
          <td style="padding: 8px 0; font-weight: bold; color: #10b981;">NPR ${totalAmount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Pickup Location:</strong></td>
          <td style="padding: 8px 0;">${pickupLocation}</td>
        </tr>
      </table>
    </div>

    <p>Please log in to your vendor dashboard to view complete booking details and manage this reservation.</p>
    <p>If you have any questions or concerns, please contact our support team.</p>
    <p style="color: #64748b; font-size: 14px; margin-top: 20px;">This is an automated message. Please do not reply directly to this email.</p>
  </div>
  `,

  orderConfirmationUser: (userName, orderId, items, totalAmount, deliveryAddress, paymentMethod, transactionId) => {
    const itemsList = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.partName || 'Unknown Part'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">Rs. ${item.unitPrice?.toLocaleString('en-NP') || '0'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">Rs. ${item.totalPrice?.toLocaleString('en-NP') || '0'}</td>
      </tr>
    `).join('');
    
    const deliveryAddressStr = deliveryAddress 
      ? `${deliveryAddress.street || ''}, ${deliveryAddress.city || ''}, ${deliveryAddress.province || ''}${deliveryAddress.postalCode ? ' - ' + deliveryAddress.postalCode : ''}${deliveryAddress.phone ? ' | Phone: ' + deliveryAddress.phone : ''}`
      : 'N/A';

    return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #10b981; margin: 0;">🎉 Order Confirmed!</h1>
    </div>
    <p>Dear <strong>${userName}</strong>,</p>
    <p>Great news! Your spare parts order has been confirmed and payment has been successfully processed.</p>
    
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; border-left: 4px solid #10b981; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #047857;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Order ID:</strong></td>
          <td style="padding: 8px 0;">#${orderId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Payment Method:</strong></td>
          <td style="padding: 8px 0;">${paymentMethod === 'esewa' ? 'eSewa' : paymentMethod || 'N/A'}</td>
        </tr>
        ${transactionId ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Transaction ID:</strong></td>
          <td style="padding: 8px 0;">${transactionId}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Delivery Address:</strong></td>
          <td style="padding: 8px 0;">${deliveryAddressStr}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #111827;">Order Items</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
            <th style="padding: 8px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantity</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 12px 8px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">Total Amount:</td>
            <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #10b981; border-top: 2px solid #e5e7eb;">Rs. ${totalAmount?.toLocaleString('en-NP') || '0'}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <p>Your order is being processed and will be shipped to the delivery address provided. You can track your order status in your account dashboard.</p>
    <p>If you have any questions or need to make changes, please contact our support team.</p>
    <p>Thank you for choosing AURA!</p>
    <p style="color: #64748b; font-size: 14px; margin-top: 20px;">This is an automated message. Please do not reply directly to this email.</p>
  </div>
  `;
  },

  orderConfirmationAdmin: (orderId, userName, userEmail, userContact, items, totalAmount, deliveryAddress, paymentMethod, transactionId) => {
    const itemsList = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.partName || 'Unknown Part'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">Rs. ${item.unitPrice?.toLocaleString('en-NP') || '0'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">Rs. ${item.totalPrice?.toLocaleString('en-NP') || '0'}</td>
      </tr>
    `).join('');
    
    const deliveryAddressStr = deliveryAddress 
      ? `${deliveryAddress.street || ''}, ${deliveryAddress.city || ''}, ${deliveryAddress.province || ''}${deliveryAddress.postalCode ? ' - ' + deliveryAddress.postalCode : ''}${deliveryAddress.phone ? ' | Phone: ' + deliveryAddress.phone : ''}`
      : 'N/A';

    return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #3b82f6; margin: 0;">📦 New Order Received!</h1>
    </div>
    <p>Dear Admin,</p>
    <p>A new spare parts order has been placed and payment has been successfully processed.</p>
    
    <div style="background-color: #eff6ff; padding: 20px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e40af;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Order ID:</strong></td>
          <td style="padding: 8px 0;">#${orderId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Customer Name:</strong></td>
          <td style="padding: 8px 0;">${userName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Customer Email:</strong></td>
          <td style="padding: 8px 0;">${userEmail}</td>
        </tr>
        ${userContact ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Customer Contact:</strong></td>
          <td style="padding: 8px 0;">${userContact}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Payment Method:</strong></td>
          <td style="padding: 8px 0;">${paymentMethod === 'esewa' ? 'eSewa' : paymentMethod || 'N/A'}</td>
        </tr>
        ${transactionId ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Transaction ID:</strong></td>
          <td style="padding: 8px 0;">${transactionId}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Delivery Address:</strong></td>
          <td style="padding: 8px 0;">${deliveryAddressStr}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #111827;">Order Items</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
            <th style="padding: 8px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantity</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 12px 8px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">Total Amount:</td>
            <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #10b981; border-top: 2px solid #e5e7eb;">Rs. ${totalAmount?.toLocaleString('en-NP') || '0'}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <p>Please log in to the admin dashboard to view complete order details and manage this order.</p>
    <p style="color: #64748b; font-size: 14px; margin-top: 20px;">This is an automated notification. Please do not reply directly to this email.</p>
  </div>
  `
  }
};

const sendEmail = async (email, type, data) => {
    const templateConfig = {
        // Verification emails
        'verify-email': {
            subject: 'Verify Your Email',
            template: emailTemplates.verifyEmail(data.otp)
        },
        'resend-otp': {
            subject: 'Your New Verification Code',
            template: emailTemplates.resendOtp(data.otp)
        },

        // Password related emails
        'password-reset-otp': {
            subject: 'Password Reset Verification',
            template: emailTemplates.passwordResetOtp(data.otp)
        },
        'password-reset-success': {
            subject: 'Password Changed Successfully',
            template: emailTemplates.passwordResetSuccess()
        },

        'account-banned': {
            subject: 'Account Suspension Notice',
            template: emailTemplates.banNotification(data.userName, data.remarks, data.adminEmail)
        },
        'account-unbanned': {
            subject: 'Account Access Restored',
            template: emailTemplates.unbanNotification(data.userName, data.adminEmail)
        },
        'vendor-approved': {
            subject: 'Vendor Approved',
            template: emailTemplates.vendorApproved(data.vendorName)
        },
        'vendor-rejected': {
            subject: 'Vendor Rejected',
            template: emailTemplates.vendorRejected(data.vendorName, data.rejectionReason)
        },
        // License notifications
        'license-uploaded': {
            subject: 'New License Upload - Action Required',
            template: emailTemplates.licenseUploaded(data.userName, data.vehicleTypes)
        },
        'license-approved': {
            subject: 'License Approved',
            template: emailTemplates.licenseApproved(data.userName, data.vehicleTypes)
        },
        'license-rejected': {
            subject: 'License Rejected',
            template: emailTemplates.licenseRejected(data.userName, data.vehicleTypes, data.rejectionReason)
        },
        // Vehicle notifications
        'vehicle-uploaded': {
            subject: 'New Vehicle Upload - Action Required',
            template: emailTemplates.vehicleUploaded(data.vendorName, data.vehicleName, data.link)
        },
        'vehicle-approved': {
            subject: 'Vehicle Approved',
            template: emailTemplates.vehicleApproved(data.vendorName, data.vehicleName, data.link)
        },
        'vehicle-rejected': {
            subject: 'Vehicle Rejected',
            template: emailTemplates.vehicleRejected(data.vendorName, data.vehicleName, data.rejectionReason, data.link)
        },
        // Booking notifications
        'booking-confirmation-user': {
            subject: 'Booking Confirmed - Your Rental is Ready!',
            template: emailTemplates.bookingConfirmationUser(data.userName, data.vehicleName, data.startDate, data.endDate, data.totalAmount, data.totalDays, data.pickupLocation, data.bookingId, data.vendorContact)
        },
        'booking-confirmation-vendor': {
            subject: 'New Booking Received',
            template: emailTemplates.bookingConfirmationVendor(data.vendorName, data.vehicleName, data.userName, data.userContact, data.startDate, data.endDate, data.totalAmount, data.totalDays, data.pickupLocation, data.bookingId)
        },
        // Order notifications
        'order-confirmation-user': {
            subject: 'Order Confirmed - Your Spare Parts Order is Processing!',
            template: emailTemplates.orderConfirmationUser(data.userName, data.orderId, data.items, data.totalAmount, data.deliveryAddress, data.paymentMethod, data.transactionId)
        },
        'order-confirmation-admin': {
            subject: 'New Spare Parts Order Received',
            template: emailTemplates.orderConfirmationAdmin(data.orderId, data.userName, data.userEmail, data.userContact, data.items, data.totalAmount, data.deliveryAddress, data.paymentMethod, data.transactionId)
        }
    };

    if (!templateConfig[type]) {
        throw new Error('Invalid email type');
    }

    const mailOptions = {
        from: `"AURA" <${process.env.SENDER_EMAIL}>`,
        to: email,
        subject: templateConfig[type].subject,
        html: templateConfig[type].template
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error(`Failed to send ${type} email`);
    }
};



export default sendEmail;