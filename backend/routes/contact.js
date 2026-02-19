const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

// Create reusable transporter using Gmail SMTP
const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });
};

// POST /api/contact — Send contact form email
router.post("/", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                error: "All fields (name, email, message) are required.",
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: "Please provide a valid email address.",
            });
        }

        const transporter = createTransporter();
        const timestamp = new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "full",
            timeStyle: "short",
        });

        const mailOptions = {
            from: `"CampVerse Contact" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            replyTo: email,
            subject: `📩 New Contact Form Submission from ${name}`,
            html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 24px 32px;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🎓 CampVerse — Contact Form</h1>
          </div>
          <div style="padding: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 16px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; width: 120px;">Name</td>
                <td style="padding: 12px 16px; color: #1e293b; border-bottom: 1px solid #e2e8f0;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">Email</td>
                <td style="padding: 12px 16px; color: #1e293b; border-bottom: 1px solid #e2e8f0;">
                  <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; font-weight: 600; color: #475569; vertical-align: top;">Message</td>
                <td style="padding: 12px 16px; color: #1e293b; line-height: 1.6;">${message.replace(/\n/g, "<br>")}</td>
              </tr>
            </table>
            <div style="margin-top: 24px; padding: 12px 16px; background: #f1f5f9; border-radius: 8px; font-size: 13px; color: #64748b;">
              📅 Submitted on: ${timestamp}
            </div>
          </div>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: "Your message has been sent successfully!",
        });
    } catch (error) {
        console.error("Contact email error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to send message. Please try again later.",
        });
    }
});

module.exports = router;
