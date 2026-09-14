import { createSurfaceAuth } from "./surface";
export const { handlers, auth, signIn, signOut } =
  createSurfaceAuth("platform");
