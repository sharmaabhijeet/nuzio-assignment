export function serializeUser(user) {
  return { id: String(user._id), name: user.name, email: user.email, interests: user.interests };
}
