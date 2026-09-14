export const state = { factories: [] }; export default function NextAuth(factory) { state.factories.push(factory); return {}; };
