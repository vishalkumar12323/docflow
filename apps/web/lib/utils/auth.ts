export function generateSlug(name: string): string {
    return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 50) // Limit length
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
};

export function generateInviteUrl(token: string, bashUrl: string): string {
    return `${bashUrl}/invite/${token}`;
};

export function formateUserName(user: {name?: string, email: string}): string {
    return user.name || user.email.split("@")[0];
};

export function getInitials(name: string): string {
    return name.split(" ").map(part => part[0]).join('').toUpperCase().substring(0, 2);
};