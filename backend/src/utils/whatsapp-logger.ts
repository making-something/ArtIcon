/**
 * WhatsApp Service Logger
 * Comprehensive logging utility for WhatsApp Cloud API operations
 */

export enum LogLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

interface LogContext {
  function?: string;
  phoneNumber?: string;
  templateName?: string;
  messageId?: string;
  participantName?: string;
  [key: string]: unknown;
}

class WhatsAppLogger {
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = this.formatTimestamp();
    const emoji = this.getEmoji(level);
    let log = `[${timestamp}] ${emoji} [WHATSAPP-${level}] ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      log += `\n   Context: ${JSON.stringify(context, null, 2)}`;
    }
    
    return log;
  }

  private getEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.INFO:
        return 'ℹ️';
      case LogLevel.SUCCESS:
        return '✅';
      case LogLevel.WARNING:
        return '⚠️';
      case LogLevel.ERROR:
        return '❌';
      case LogLevel.DEBUG:
        return '🔍';
      default:
        return '📝';
    }
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatLog(LogLevel.INFO, message, context));
  }

  success(message: string, context?: LogContext): void {
    console.log(this.formatLog(LogLevel.SUCCESS, message, context));
  }

  warning(message: string, context?: LogContext): void {
    console.warn(this.formatLog(LogLevel.WARNING, message, context));
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatLog(LogLevel.ERROR, message, context));
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development' || process.env.WHATSAPP_DEBUG === 'true') {
      console.log(this.formatLog(LogLevel.DEBUG, message, context));
    }
  }

  // Specialized logging methods for WhatsApp operations
  
  logApiRequest(endpoint: string, payload: unknown, headers?: Record<string, string>): void {
    this.info('Outgoing API Request to Meta', {
      function: 'API_REQUEST',
      endpoint,
      payload,
      headers: this.sanitizeHeaders(headers),
    });
  }

  logApiResponse(endpoint: string, status: number, data: unknown): void {
    this.success('API Response from Meta', {
      function: 'API_RESPONSE',
      endpoint,
      status,
      data,
    });
  }

  logApiError(endpoint: string, error: unknown): void {
    const errorDetails = this.extractErrorDetails(error);
    this.error('API Error from Meta', {
      function: 'API_ERROR',
      endpoint,
      ...errorDetails,
    });
  }

  logFunctionEntry(functionName: string, params?: Record<string, unknown>): void {
    this.debug(`Entering function: ${functionName}`, {
      function: functionName,
      params,
    });
  }

  logFunctionExit(functionName: string, result?: unknown): void {
    this.debug(`Exiting function: ${functionName}`, {
      function: functionName,
      result,
    });
  }

  logPhoneNumberFormatting(original: string, formatted: string): void {
    this.debug('Phone number formatted', {
      function: 'formatPhoneNumber',
      original,
      formatted,
    });
  }

  logMessageSent(messageId: string, to: string, templateName: string): void {
    this.success('WhatsApp message sent successfully', {
      function: 'sendTemplate',
      messageId,
      to,
      templateName,
    });
  }

  logConfigurationStatus(isConfigured: boolean, details?: Record<string, unknown>): void {
    if (isConfigured) {
      this.success('WhatsApp Cloud API configured', details);
    } else {
      this.warning('WhatsApp Cloud API not configured', details);
    }
  }

  private sanitizeHeaders(headers?: Record<string, string>): Record<string, string> {
    if (!headers) return {};
    
    const sanitized = { ...headers };
    // Mask sensitive information
    if (sanitized.Authorization) {
      sanitized.Authorization = 'Bearer ***REDACTED***';
    }
    return sanitized;
  }

  private extractErrorDetails(error: unknown): Record<string, unknown> {
    if (error && typeof error === 'object') {
      const err = error as any;
      
      return {
        message: err.message || 'Unknown error',
        code: err.code,
        status: err.response?.status,
        statusText: err.response?.statusText,
        metaError: err.response?.data?.error,
        metaErrorCode: err.response?.data?.error?.code,
        metaErrorMessage: err.response?.data?.error?.message,
        metaErrorType: err.response?.data?.error?.type,
        metaErrorFbtraceId: err.response?.data?.error?.fbtrace_id,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      };
    }
    
    return { error: String(error) };
  }
}

export const whatsappLogger = new WhatsAppLogger();

