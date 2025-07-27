const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const {
      firstName,
      lastName,
      email,
      phone,
      highestEducation = "N/A",
      preferredCountry = "N/A",
      intendedCourse = "N/A",
      subject,
      message,
    } = req.body;

    // Create a transporter object using the Gmail SMTP service
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_PASS, // Your Gmail password or app-specific password
      },
    });

    // Email options
    const mailOptions = {
      from: email,
      to: process.env.GMAIL_USER, // Your Gmail address to receive the emails
      subject: `${subject}`,
      text:
        `Name: ${firstName + " " + lastName}\n` +
        `Email: ${email}\n` +
        `Subject: ${subject}\n` +
        `Phone: ${phone}\n` +
        `Highest Education: ${highestEducation}\n` +
        `Preferred Country: ${preferredCountry}\n` +
        `Intended Course: ${intendedCourse}\n` +
        `Message: ${message}\n`,
    };

    // Send the email
    try {
      await transporter.sendMail(mailOptions);
      res
        .status(200)
        .json({ success: true, message: "Email sent successfully!" });
    } catch (error) {
      console.error("Error sending email:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to send email." });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
};
