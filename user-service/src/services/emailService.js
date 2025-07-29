const nodemailer = require('nodemailer')
const path = require('path')
const fs = require('fs').promises

class EmailService {
  constructor() {
    this.transporter = null
    this.isInitialized = false
    this.initializeTransporter()
  }

  // Initialize email transporter
  async initializeTransporter() {
    try {
      const config = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      }

      // Create transporter based on service
      if (process.env.EMAIL_SERVICE === 'gmail') {
        config.service = 'gmail'
      }

      this.transporter = nodemailer.createTransporter(config)

      // Verify connection
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await this.transporter.verify()
        console.log('Email service initialized successfully')
      } else {
        console.warn('Email credentials not provided. Email service will not function.')
      }

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize email service:', error.message)
      this.isInitialized = false
    }
  }

  // Check if email service is available
  isAvailable() {
    return this.isInitialized && this.transporter && process.env.EMAIL_USER
  }

  // Send raw email
  async sendEmail({ to, subject, html, text, attachments = [] }) {
    if (!this.isAvailable()) {
      throw new Error('Email service is not available')
    }

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'ERP System'} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text,
      attachments
    }

    try {
      const result = await this.transporter.sendMail(mailOptions)
      console.log(`Email sent successfully to ${to}:`, result.messageId)
      return result
    } catch (error) {
      console.error('Failed to send email:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }
  }

  // Load email template
  async loadTemplate(templateName, variables = {}) {
    try {
      const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`)
      let template = await fs.readFile(templatePath, 'utf8')

      // Replace variables in template
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        template = template.replace(regex, variables[key])
      })

      return template
    } catch (error) {
      console.error(`Failed to load email template ${templateName}:`, error)
      // Return basic template if file doesn't exist
      return this.getBasicTemplate(templateName, variables)
    }
  }

  // Get basic template (fallback)
  getBasicTemplate(templateName, variables) {
    const baseStyles = `
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6b7280; }
        .code { background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 18px; text-align: center; margin: 20px 0; }
      </style>
    `

    const templates = {
      verification: `
        ${baseStyles}
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <h2>Hello ${variables.firstName || 'User'}!</h2>
          <p>Welcome to our ERP System. Please verify your email address by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="${variables.verificationUrl}" class="button">Verify Email</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">
            ${variables.verificationUrl}
          </p>
          <p><strong>This link will expire in 24 hours.</strong></p>
        </div>
        <div class="footer">
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `,
      
      passwordReset: `
        ${baseStyles}
        <div class="header">
          <h1>Password Reset</h1>
        </div>
        <div class="content">
          <h2>Hello ${variables.firstName || 'User'}!</h2>
          <p>You requested a password reset for your account. Click the button below to reset your password:</p>
          <p style="text-align: center;">
            <a href="${variables.resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">
            ${variables.resetUrl}
          </p>
          <p><strong>This link will expire in 1 hour.</strong></p>
        </div>
        <div class="footer">
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
      `,

      welcome: `
        ${baseStyles}
        <div class="header">
          <h1>Welcome to ERP System!</h1>
        </div>
        <div class="content">
          <h2>Hello ${variables.firstName || 'User'}!</h2>
          <p>Your account has been successfully created and verified. You can now log in to access the system.</p>
          <p style="text-align: center;">
            <a href="${variables.loginUrl}" class="button">Login to Dashboard</a>
          </p>
          <h3>Your Account Details:</h3>
          <ul>
            <li><strong>Username:</strong> ${variables.username}</li>
            <li><strong>Email:</strong> ${variables.email}</li>
            <li><strong>Role:</strong> ${variables.role}</li>
          </ul>
        </div>
        <div class="footer">
          <p>Thank you for joining us!</p>
        </div>
      `,

      twoFactorEnabled: `
        ${baseStyles}
        <div class="header">
          <h1>Two-Factor Authentication Enabled</h1>
        </div>
        <div class="content">
          <h2>Hello ${variables.firstName || 'User'}!</h2>
          <p>Two-factor authentication has been successfully enabled for your account.</p>
          <p>Your account is now more secure. You'll need your authenticator app to log in.</p>
          <p><strong>Backup Codes:</strong></p>
          <div class="code">
            ${variables.backupCodes ? variables.backupCodes.join('<br>') : ''}
          </div>
          <p><strong>Important:</strong> Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.</p>
        </div>
        <div class="footer">
          <p>If you didn't enable 2FA, please contact support immediately.</p>
        </div>
      `,

      securityAlert: `
        ${baseStyles}
        <div class="header" style="background: #dc2626;">
          <h1>Security Alert</h1>
        </div>
        <div class="content">
          <h2>Hello ${variables.firstName || 'User'}!</h2>
          <p><strong>Security Alert:</strong> ${variables.alertMessage}</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li><strong>Time:</strong> ${variables.timestamp}</li>
            <li><strong>IP Address:</strong> ${variables.ipAddress}</li>
            <li><strong>Location:</strong> ${variables.location || 'Unknown'}</li>
            <li><strong>Device:</strong> ${variables.device || 'Unknown'}</li>
          </ul>
          <p>If this was you, no action is needed. If this wasn't you, please secure your account immediately:</p>
          <p style="text-align: center;">
            <a href="${variables.secureAccountUrl}" class="button" style="background: #dc2626;">Secure My Account</a>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated security notification.</p>
        </div>
      `
    }

    return templates[templateName] || `
      ${baseStyles}
      <div class="header">
        <h1>Notification</h1>
      </div>
      <div class="content">
        <h2>Hello ${variables.firstName || 'User'}!</h2>
        <p>You have a new notification from the ERP System.</p>
      </div>
    `
  }

  // Send verification email
  async sendVerificationEmail(email, token, firstName) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`
    
    const html = await this.loadTemplate('verification', {
      firstName,
      verificationUrl,
      token
    })

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email Address',
      html,
      text: `Hello ${firstName}! Please verify your email by visiting: ${verificationUrl}`
    })
  }

  // Send password reset email
  async sendPasswordResetEmail(email, token, firstName) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`
    
    const html = await this.loadTemplate('passwordReset', {
      firstName,
      resetUrl,
      token
    })

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html,
      text: `Hello ${firstName}! Reset your password by visiting: ${resetUrl}`
    })
  }

  // Send welcome email
  async sendWelcomeEmail(email, userInfo) {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`
    
    const html = await this.loadTemplate('welcome', {
      ...userInfo,
      loginUrl
    })

    return this.sendEmail({
      to: email,
      subject: 'Welcome to ERP System!',
      html,
      text: `Welcome ${userInfo.firstName}! Your account has been created successfully.`
    })
  }

  // Send two-factor authentication enabled notification
  async sendTwoFactorEnabledEmail(email, firstName, backupCodes) {
    const html = await this.loadTemplate('twoFactorEnabled', {
      firstName,
      backupCodes
    })

    return this.sendEmail({
      to: email,
      subject: 'Two-Factor Authentication Enabled',
      html,
      text: `Hello ${firstName}! Two-factor authentication has been enabled for your account.`
    })
  }

  // Send security alert email
  async sendSecurityAlert(email, alertInfo) {
    const secureAccountUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/security`
    
    const html = await this.loadTemplate('securityAlert', {
      ...alertInfo,
      secureAccountUrl
    })

    return this.sendEmail({
      to: email,
      subject: 'Security Alert - Account Activity',
      html,
      text: `Security Alert: ${alertInfo.alertMessage}. If this wasn't you, please secure your account immediately.`
    })
  }

  // Send password changed notification
  async sendPasswordChangedEmail(email, firstName, ipAddress, timestamp) {
    await this.sendSecurityAlert(email, {
      firstName,
      alertMessage: 'Your password has been changed',
      timestamp: timestamp.toLocaleString(),
      ipAddress,
      device: 'Unknown'
    })
  }

  // Send login notification (for suspicious activity)
  async sendLoginNotification(email, firstName, loginInfo) {
    await this.sendSecurityAlert(email, {
      firstName,
      alertMessage: 'New login to your account',
      timestamp: loginInfo.timestamp.toLocaleString(),
      ipAddress: loginInfo.ipAddress,
      location: loginInfo.location,
      device: loginInfo.device
    })
  }

  // Send account locked notification
  async sendAccountLockedEmail(email, firstName, reason) {
    const html = await this.loadTemplate('securityAlert', {
      firstName,
      alertMessage: `Your account has been locked. Reason: ${reason}`,
      timestamp: new Date().toLocaleString(),
      secureAccountUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/support`
    })

    return this.sendEmail({
      to: email,
      subject: 'Account Locked - Security Alert',
      html,
      text: `Hello ${firstName}! Your account has been locked due to: ${reason}. Please contact support.`
    })
  }

  // Send bulk email (for admin notifications)
  async sendBulkEmail(recipients, subject, template, variables) {
    const promises = recipients.map(recipient => {
      const personalizedVariables = {
        ...variables,
        ...recipient
      }
      
      const html = this.loadTemplate(template, personalizedVariables)
      
      return this.sendEmail({
        to: recipient.email,
        subject,
        html
      }).catch(error => {
        console.error(`Failed to send email to ${recipient.email}:`, error)
        return { error: error.message, email: recipient.email }
      })
    })

    const results = await Promise.allSettled(promises)
    
    return {
      total: recipients.length,
      successful: results.filter(r => r.status === 'fulfilled' && !r.value.error).length,
      failed: results.filter(r => r.status === 'rejected' || r.value?.error).length,
      errors: results
        .filter(r => r.status === 'rejected' || r.value?.error)
        .map(r => r.status === 'rejected' ? r.reason : r.value)
    }
  }

  // Test email configuration
  async testEmailConfig() {
    if (!this.isAvailable()) {
      throw new Error('Email service is not properly configured')
    }

    try {
      await this.transporter.verify()
      return { success: true, message: 'Email configuration is valid' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  // Send test email
  async sendTestEmail(to) {
    const html = `
      <h1>Test Email</h1>
      <p>This is a test email from the ERP System.</p>
      <p>If you received this email, the email service is working correctly.</p>
      <p>Sent at: ${new Date().toISOString()}</p>
    `

    return this.sendEmail({
      to,
      subject: 'Test Email - ERP System',
      html,
      text: 'This is a test email from the ERP System. If you received this, the email service is working correctly.'
    })
  }
}

module.exports = new EmailService()
