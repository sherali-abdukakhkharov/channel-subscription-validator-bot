import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type ErrorType =
  | 'RATE_LIMIT'
  | 'CHANNEL_PRIVATE'
  | 'NETWORK_ERROR'
  | 'NOT_MEMBER'
  | 'UNKNOWN';

@Injectable()
export class ErrorHandlerService {
  constructor(private readonly configService: ConfigService) {}

  identifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase();

    if (message.includes('rate limit') || message.includes('too many requests')) {
      return 'RATE_LIMIT';
    }
    if (message.includes('chat not found') || message.includes('private')) {
      return 'CHANNEL_PRIVATE';
    }
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('econnreset')
    ) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('forbidden') || message.includes('not member') || message.includes('not a member')) {
      return 'NOT_MEMBER';
    }
    return 'UNKNOWN';
  }

  getErrorMessage(errorType: ErrorType): string {
    const messages: Record<ErrorType, string> = {
      RATE_LIMIT: '⏱️ Too many requests! Please wait 2 seconds and try again.',
      CHANNEL_PRIVATE: "🔒 The channel is private. Please make sure you can access it first.",
      NOT_MEMBER: "📢 You're not a channel member yet. Please subscribe and try again.",
      NETWORK_ERROR: '🌐 Connection issue. Please check your internet and try again.',
      UNKNOWN: '❌ Something went wrong. Please try again or contact support.',
    };
    return messages[errorType] || messages.UNKNOWN;
  }

  getRecoveryInstructions(errorType: ErrorType): string {
    const supportUsername = this.configService.get<string>('app.supportUsername') || '@support';
    const instructions: Record<ErrorType, string> = {
      RATE_LIMIT: '\n\n💡 Wait a moment, then tap "Validate Subscription" again.',
      CHANNEL_PRIVATE: '\n\n💡 Make sure the channel is public or you have access to it.',
      NOT_MEMBER: '\n\n💡 Join the channel first, then come back and validate.',
      NETWORK_ERROR: '\n\n💡 Check your connection and retry.',
      UNKNOWN: `\n\n🆘 If problems persist, contact ${supportUsername}`,
    };
    return instructions[errorType] || instructions.UNKNOWN;
  }

  getFullErrorMessage(error: Error): string {
    const errorType = this.identifyError(error);
    const errorMessage = this.getErrorMessage(errorType);
    const recoveryInstructions = this.getRecoveryInstructions(errorType);

    return errorMessage + recoveryInstructions;
  }
}
