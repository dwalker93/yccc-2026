/**
 * Base class for all domain/service level errors.
 * Carries an HTTP status code and machine-readable error code for API response mapping.
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = "INTERNAL_SERVER_ERROR"
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

/** 404 Not Found Errors */
export class NotFoundError extends ServiceError {
  constructor(message: string, code: string = "NOT_FOUND") {
    super(message, 404, code)
  }
}

export class MemberNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Member not found: ${id}`, "MEMBER_NOT_FOUND")
  }
}

export class EducationNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Member education record not found: ${id}`, "EDUCATION_NOT_FOUND")
  }
}

export class ProfessionNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Member profession record not found: ${id}`, "PROFESSION_NOT_FOUND")
  }
}

export class PlanNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Plan not found: ${id}`, "PLAN_NOT_FOUND")
  }
}

export class InvoiceNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`No open invoice found for member: ${id}`, "INVOICE_NOT_FOUND")
  }
}

/** 400 Bad Request / Validation / Business Rule Errors */
export class ValidationError extends ServiceError {
  constructor(message: string, code: string = "BAD_REQUEST") {
    super(message, 400, code)
  }
}

export class InvalidStatusTransitionError extends ValidationError {
  constructor(message: string) {
    super(message, "INVALID_STATUS_TRANSITION")
  }
}

export class MemberPlanNotAssignedError extends ValidationError {
  constructor(memberId: string) {
    super(`Member has no plan assigned: ${memberId}`, "PLAN_NOT_ASSIGNED")
  }
}

export class BulkActionLimitExceededError extends ValidationError {
  constructor(maxLimit: number = 10) {
    super(`Maximum ${maxLimit} members per bulk action`, "BULK_LIMIT_EXCEEDED")
  }
}

export class NoMembersSelectedError extends ValidationError {
  constructor() {
    super("No members selected", "NO_MEMBERS_SELECTED")
  }
}

/** Type guard to check if an error is a ServiceError */
export function isServiceError(error: unknown): error is ServiceError {
  return error instanceof ServiceError
}
