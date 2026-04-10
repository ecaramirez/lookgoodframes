<?php
require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/src/SMTP.php';
require_once __DIR__ . '/PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/**
 * Send a 6-digit OTP to the given email address.
 *
 * @param  string $email     Recipient email
 * @param  string $code      The 6-digit OTP
 * @param  string $firstName Recipient first name (for personalisation)
 * @return bool              true on success, false on failure
 */
function sendOTP(string $email, string $code, string $firstName = 'there'): bool
{
    $mail = new PHPMailer(true);

    try {
        // ── Server ────────────────────────────────────────────────────────────
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'edriansedrikhalili.com';   // ← change
        $mail->Password   = 'zqgmrhsptdenkkyz';      // ← change (Gmail App Password)
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // ── From / To ─────────────────────────────────────────────────────────
        $mail->setFrom('edriansedrikhalili.com', 'LookGood');
        $mail->addAddress($email);

        // ── Content ───────────────────────────────────────────────────────────
        $mail->isHTML(true);
        $mail->Subject = 'Your LookGood verification code';
        $mail->Body    = buildOtpEmail($firstName, $code);
        $mail->AltBody = "Hi $firstName,\n\nWazzup my homie! Your LookGood verification code is: $code\n\nThis code expires in 15 minutes.\n\nIf you did not sign up, please ignore this email.";

        $mail->send();
        return true;

    } catch (Exception $e) {
        error_log('PHPMailer error: ' . $mail->ErrorInfo);
        return false;
    }
}

/**
 * Build the branded HTML email body.
 */
function buildOtpEmail(string $firstName, string $code): string
{
    // Split the OTP into individual digit spans for styling
    $digits = '';
    foreach (str_split($code) as $d) {
        $digits .= "<span style=\"
            display:inline-block;
            width:44px; height:52px;
            line-height:52px;
            text-align:center;
            font-size:26px;
            font-weight:700;
            letter-spacing:0;
            background:#f5f5f5;
            border:1.5px solid #e0e0e0;
            border-radius:8px;
            margin:0 4px;
            color:#111;
            font-family:'DM Sans', Arial, sans-serif;
        \">$d</span>";
    }

    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

          <!-- Header -->
          <tr>
            <td style="background:#111;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:26px;font-weight:700;color:#fff;letter-spacing:-0.5px;">
                LookGood
              </p>
              <p style="margin:6px 0 0;font-size:13px;color:#aaa;letter-spacing:0.5px;">
                LOOKING GOOD HAS NEVER BEEN THIS CLEAR
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#111;">
                Verify your email, {$firstName} 👋
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">
                Enter the 6-digit code below to complete your LookGood registration.
                This code expires in <strong>15 minutes</strong>.
              </p>

              <!-- OTP digits -->
              <div style="text-align:center;margin:0 0 28px;">
                {$digits}
              </div>

              <p style="margin:0 0 6px;font-size:13px;color:#888;text-align:center;">
                Didn't sign up? You can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f5f5f5;padding:20px 40px;border-top:1px solid #eee;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;">
                © 2025 LookGood · All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;
}