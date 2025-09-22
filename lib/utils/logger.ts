// Enhanced logging utility for the medical system
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogContext {
  userId?: string;
  action?: string;
  resource?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
    return `[${timestamp}] [${level.toUpperCase()}]${contextStr} ${message}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const formattedMessage = this.formatMessage(level, message, context);
    
    if (error) {
      console[level](formattedMessage, error);
    } else {
      console[level](formattedMessage);
    }

    // In production, you might want to send logs to an external service
    if (!this.isDevelopment && level === LogLevel.ERROR) {
      // Send to external logging service (e.g., Sentry, LogRocket, etc.)
      this.sendToExternalService(level, message, context, error);
    }
  }

  private sendToExternalService(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    // Implement external logging service integration
    // Example: Sentry.captureException(error);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  // Medical system specific logging methods
  logApiRequest(method: string, endpoint: string, userId?: string, metadata?: Record<string, any>): void {
    this.info(`API Request: ${method} ${endpoint}`, {
      userId,
      action: 'api_request',
      resource: endpoint,
      metadata: { method, ...metadata }
    });
  }

  logApiError(method: string, endpoint: string, error: Error, userId?: string, metadata?: Record<string, any>): void {
    this.error(`API Error: ${method} ${endpoint}`, {
      userId,
      action: 'api_error',
      resource: endpoint,
      metadata: { method, ...metadata }
    }, error);
  }

  logUserAction(action: string, userId: string, resource?: string, metadata?: Record<string, any>): void {
    this.info(`User Action: ${action}`, {
      userId,
      action,
      resource,
      metadata
    });
  }

  logSecurityEvent(event: string, userId?: string, metadata?: Record<string, any>): void {
    this.warn(`Security Event: ${event}`, {
      userId,
      action: 'security_event',
      metadata
    });
  }

  logMedicalRecordAccess(recordId: string, userId: string, action: 'view' | 'create' | 'update' | 'delete'): void {
    this.info(`Medical Record ${action}: ${recordId}`, {
      userId,
      action: `medical_record_${action}`,
      resource: recordId
    });
  }

  logDiagnosisRequest(patientId: string, userId: string, symptoms: string[]): void {
    this.info(`Diagnosis Request for Patient: ${patientId}`, {
      userId,
      action: 'diagnosis_request',
      resource: patientId,
      metadata: { symptoms }
    });
  }
}

export const logger = new Logger();
