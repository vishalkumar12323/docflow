export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class InsufficientPermissionsError extends AuthError {
  constructor(requiredRole?: string) {
    super(
      requiredRole
        ? `Insufficient permissions. Required role: ${requiredRole}`
        : "Insufficient permissions",
      "INSUFFICIENT_PERMISSIONS"
    );
  }
}

export class OrganizationNotFoundError extends AuthError {
  constructor() {
    super("Organization not found", "ORG_NOT_FOUND");
  }
}

export class UserNotFoundError extends AuthError {
  constructor() {
    super("User not found", "USER_NOT_FOUND");
  }
}

export class InvitationExpiredError extends AuthError {
  constructor() {
    super("Invitation has expired", "INVITATION_EXPIRED");
  }
}

export class InvitationAlreadyAcceptedError extends AuthError {
  constructor() {
    super(
      "Invitation has already been accepted",
      "INVITATION_ALREADY_ACCEPTED"
    );
  }
}
