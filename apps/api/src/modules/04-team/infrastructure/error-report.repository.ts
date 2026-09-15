import { Database } from "../../00-shared/infrastructure/database.js";

interface CreateErrorReportDTO {
  tenantId?: string;
  actorId?: string;
  requestId: string;
  errorCode: string;
  context?: any;
}

export class ErrorReportRepository {
  constructor(private readonly db: Database) {}

  async create(data: CreateErrorReportDTO) {
    return this.db.client.errorReport.create({
      data,
    });
  }
}
