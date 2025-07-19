<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = filter_var(trim($_POST["newsletterEmail"]), FILTER_SANITIZE_EMAIL);

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid email address.";
        exit;
    }

    $to = "shahk020032003@gmail.com"; // 🔁 Change this to your email address
    $subject = "New Newsletter Subscription";
    $body = "You have a new newsletter subscriber:\n\nEmail: $email";
    $headers = "From: Newsletter Signup <no-reply@yourdomain.com>";

    if (mail($to, $subject, $body, $headers)) {
        echo "Success";
    } else {
        echo "Error sending email.";
    }
} else {
    echo "Invalid request.";
}
?>
