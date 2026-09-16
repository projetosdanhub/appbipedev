import { z } from "zod";

export const WEB_DOCUMENT_LIMITS = Object.freeze({
  maxBytes: 1024 * 1024, maxNodes: 500, maxDepth: 12,
});

/** Bound untrusted JSON BEFORE the recursive Zod schema runs. */
export const boundedWebJsonSchema = z.unknown().superRefine((input, ctx) => {
  const pending = [{ value: input, depth: 0 }];
  const seen = new WeakSet<object>();
  let entries = 0;
  let characters = 0;
  const fail = () => ctx.addIssue({ code: "custom", message: "Documento inválido ou acima dos limites técnicos." });
  while (pending.length) {
    const { value, depth } = pending.pop()!;
    if (++entries > 30000 || depth > 64) return fail();
    if (typeof value === "string") characters += value.length;
    else if (value !== null && typeof value === "object") {
      if (seen.has(value)) return fail();
      seen.add(value);
      const prototype = Object.getPrototypeOf(value);
      if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) return fail();
      const keys = Reflect.ownKeys(value);
      if (keys.length > 30000) return fail();
      for (const key of keys) {
        if (Array.isArray(value) && key === "length") continue;
        if (typeof key !== "string" || ["__proto__", "constructor", "prototype"].includes(key)) return fail();
        characters += key.length;
        const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
        if (!descriptor.enumerable || !("value" in descriptor)) return fail();
        pending.push({ value: descriptor.value, depth: depth + 1 });
      }
    } else if (value !== null && typeof value !== "boolean" && !(typeof value === "number" && Number.isFinite(value))) return fail();
    if (characters > WEB_DOCUMENT_LIMITS.maxBytes) return fail();
  }
  const serialized = JSON.stringify(input);
  if (serialized === undefined || new TextEncoder().encode(serialized).byteLength > WEB_DOCUMENT_LIMITS.maxBytes) fail();
});
