const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  // Set CORS headers for all requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight (OPTIONS) request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const { name, email, subject, message } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.GMAIL_USER,
      subject: ${subject},
      text:
        Name: ${name}\n\n +
        Email: ${email}\n\n +
        Subject: ${subject}\n\n +
        Message: ${message}\n,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: "Email sent successfully!" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, message: "Failed to send email." });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
};