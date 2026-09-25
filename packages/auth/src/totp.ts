import * as otplib from "otplib";

function getGuardrails() {
  try {
    if (typeof (otplib as any).createGuardrails === "function") {
      return (otplib as any).createGuardrails({ MIN_SECRET_BYTES: 1 });
    }
  } catch {}
  return undefined;
}

/**
 * Generates a base32 TOTP secret compatible with authenticator apps.
 * Uses 20 bytes (32 Base32 characters) per RFC 6238 / RFC 4226 standards.
 */
export function generateTotpSecret(): string {
  try {
    if (typeof (otplib as any).generateSecret === "function") {
      return (otplib as any).generateSecret({ length: 20 });
    }
  } catch {}

  try {
    if ((otplib as any).authenticator && typeof (otplib as any).authenticator.generateSecret === "function") {
      return (otplib as any).authenticator.generateSecret(20);
    }
  } catch {}

  throw new Error("TOTP_SECRET_GENERATOR_UNAVAILABLE");
}

/**
 * Generates the otpauth:// URI for QR codes.
 */
export function generateTotpUri(options: { issuer: string; label: string; secret: string }): string {
  if (typeof (otplib as any).generateURI === "function") {
    return (otplib as any).generateURI({
      issuer: options.issuer,
      label: options.label,
      secret: options.secret,
    });
  }
  if ((otplib as any).authenticator && typeof (otplib as any).authenticator.keyuri === "function") {
    return (otplib as any).authenticator.keyuri(options.label, options.issuer, options.secret);
  }
  return `otpauth://totp/${encodeURIComponent(options.issuer)}:${encodeURIComponent(options.label)}?secret=${encodeURIComponent(options.secret)}&issuer=${encodeURIComponent(options.issuer)}`;
}

/**
 * Verifies a 6-digit TOTP token against a secret with +/- 60s drift tolerance.
 */
export function verifyTotp(options: { token: string; secret: string; tolerance?: number }): boolean {
  const token = options.token.trim().replace(/\s+/g, "");
  const secret = options.secret.trim();
  const tolerance = options.tolerance ?? 60; // +/- 60s tolerance (covers phone clock drift)
  const guardrails = getGuardrails();

  try {
    if (typeof (otplib as any).verifySync === "function") {
      const res = (otplib as any).verifySync({
        token,
        secret,
        epochTolerance: tolerance,
        guardrails,
      });
      if (res?.valid) return true;
    }

    if ((otplib as any).authenticator) {
      const auth = (otplib as any).authenticator;
      if (typeof auth.check === "function") {
        auth.options = {
          ...auth.options,
          window: 2, // +/- 60s
        };
        if (auth.check(token, secret)) return true;
      }
      if (typeof auth.verify === "function") {
        if (auth.verify({ token, secret })) return true;
      }
    }
  } catch (err) {
    console.error("[TOTP] Verify error:", err);
    return false;
  }

  return false;
}

/**
 * Generates a TOTP token (useful for scripts and automated testing).
 */
export function generateTotp(options: { secret: string }): string {
  const guardrails = getGuardrails();

  if (typeof (otplib as any).generateSync === "function") {
    return (otplib as any).generateSync({ secret: options.secret, guardrails });
  }
  if ((otplib as any).authenticator && typeof (otplib as any).authenticator.generate === "function") {
    return (otplib as any).authenticator.generate(options.secret);
  }
  throw new Error("TOTP_GENERATOR_UNAVAILABLE");
}
