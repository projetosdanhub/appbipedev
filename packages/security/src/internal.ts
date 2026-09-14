import { SignJWT, jwtVerify } from "jose";

/**
 * Generates an internal symmetric JWT used for service-to-service authentication.
 * 
 * @param payload Data to encode in the JWT
 * @param secret The shared secret for internal APIs (e.g. process.env.INTERNAL_API_SECRET)
 * @param expiresIn Expiration string, defaults to "5m" for short-lived tokens
 */
export async function signInternalToken(
  payload: Record<string, unknown>,
  secret: string,
  expiresIn = "5m"
): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("urn:bipesend:internal")
    .setAudience("urn:bipesend:api")
    .setExpirationTime(expiresIn)
    .sign(key);
}

/**
 * Verifies an internal symmetric JWT and returns its payload.
 * 
 * @param token The JWT token to verify
 * @param secret The shared secret for internal APIs
 */
export async function verifyInternalToken(
  token: string,
  secret: string
): Promise<Record<string, unknown>> {
  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key, {
    issuer: "urn:bipesend:internal",
    audience: "urn:bipesend:api",
    algorithms: ["HS256"],
  });
  return payload;
}
