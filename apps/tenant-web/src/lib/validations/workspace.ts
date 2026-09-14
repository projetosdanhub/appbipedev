import * as z from "zod";

export const inviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email({
    message: "Digite um endereço de e-mail válido.",
  }),
  role: z.enum(["owner", "admin", "member"]).default("member"),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
