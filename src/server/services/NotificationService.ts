import { WebClient } from '@slack/web-api';
import nodemailer from 'nodemailer';
import type { ValidationLog, AIExtraction } from '../db';
import type { NextAction } from '../types/validation.types';

/**
 * NotificationService
 *
 * Handles Slack and Email notifications for validation events
 */
export class NotificationService {
  private slackClient: WebClient;
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    // Initialize Slack client
    this.slackClient = new WebClient(process.env.SLACK_API_TOKEN);

    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Send validation notification based on next action
   */
  async sendValidationNotification(
    validation: ValidationLog,
    extraction: AIExtraction,
    nextAction: NextAction
  ): Promise<void> {
    switch (nextAction) {
      case 'BLOCK':
        await this.sendBlockNotification(validation, extraction);
        break;

      case 'ROUTE_TO_SALES_OPS':
        await this.sendSalesOpsReviewNotification(validation, extraction);
        break;

      case 'PROCEED_TO_CONTRACT':
        await this.sendPassNotification(validation, extraction);
        break;
    }
  }

  /**
   * Send notification for blocked validation (missing fields)
   */
  private async sendBlockNotification(
    validation: ValidationLog,
    extraction: AIExtraction
  ): Promise<void> {
    const missingFieldsList = validation.missing_fields?.join(', ') || 'Unknown';

    // Slack notification to Sales Manager
    await this.slackClient.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_SALES_MANAGER || '#sales-manager',
      text: `⛔ Validation Blocked - Merchant ${extraction.merchant_id}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '⛔ Validation Blocked: Missing Required Fields',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Merchant ID:*\n${extraction.merchant_id}`,
            },
            {
              type: 'mrkdwn',
              text: `*Extraction ID:*\n${extraction.extraction_id}`,
            },
            {
              type: 'mrkdwn',
              text: `*Missing Fields:*\n${missingFieldsList}`,
            },
            {
              type: 'mrkdwn',
              text: `*Status:*\n${validation.validation_status}`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Details',
              },
              url: `${process.env.APP_URL}/validation/${validation.validation_id}`,
              style: 'danger',
            },
          ],
        },
      ],
    });

    // Email notification
    await this.sendEmail({
      to: process.env.SALES_MANAGER_EMAIL || 'sales-manager@bolt.eu',
      subject: `⛔ Validation Blocked - Merchant ${extraction.merchant_id}`,
      html: `
        <h2>Validation Blocked: Missing Required Fields</h2>
        <p><strong>Merchant ID:</strong> ${extraction.merchant_id}</p>
        <p><strong>Extraction ID:</strong> ${extraction.extraction_id}</p>
        <p><strong>Missing Fields:</strong> ${missingFieldsList}</p>
        <p><strong>Status:</strong> ${validation.validation_status}</p>
        <p><a href="${process.env.APP_URL}/validation/${validation.validation_id}">View Details</a></p>
      `,
    });
  }

  /**
   * Send notification for manual review (low confidence)
   */
  private async sendSalesOpsReviewNotification(
    validation: ValidationLog,
    extraction: AIExtraction
  ): Promise<void> {
    const lowConfidenceFieldsList = validation.low_confidence_fields?.join(', ') || 'None';
    const confidenceScore = Number(extraction.confidence_score_overall);

    // Slack notification to Sales Ops (2h SLA)
    await this.slackClient.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_SALES_OPS || '#sales-ops',
      text: `🟡 Manual Review Required - Merchant ${extraction.merchant_id}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🟡 Manual Review Required: Low Confidence Score',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Merchant ID:*\n${extraction.merchant_id}`,
            },
            {
              type: 'mrkdwn',
              text: `*Confidence Score:*\n${confidenceScore}% (threshold: 90%)`,
            },
            {
              type: 'mrkdwn',
              text: `*Low Confidence Fields:*\n${lowConfidenceFieldsList}`,
            },
            {
              type: 'mrkdwn',
              text: `*SLA:*\n2 hours`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Review Now',
              },
              url: `${process.env.APP_URL}/manual-review/${validation.validation_id}`,
              style: 'primary',
            },
          ],
        },
      ],
    });

    // Email notification
    await this.sendEmail({
      to: process.env.SALES_OPS_EMAIL || 'sales-ops@bolt.eu',
      subject: `🟡 Manual Review Required - Merchant ${extraction.merchant_id}`,
      html: `
        <h2>Manual Review Required: Low Confidence Score</h2>
        <p><strong>Merchant ID:</strong> ${extraction.merchant_id}</p>
        <p><strong>Confidence Score:</strong> ${confidenceScore}% (threshold: 90%)</p>
        <p><strong>Low Confidence Fields:</strong> ${lowConfidenceFieldsList}</p>
        <p><strong>SLA:</strong> 2 hours</p>
        <p><a href="${process.env.APP_URL}/manual-review/${validation.validation_id}">Review Now</a></p>
      `,
    });
  }

  /**
   * Send notification for passed validation
   */
  private async sendPassNotification(
    validation: ValidationLog,
    extraction: AIExtraction
  ): Promise<void> {
    const confidenceScore = Number(extraction.confidence_score_overall);

    // Slack notification (success)
    await this.slackClient.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_SALES_OPS || '#sales-ops',
      text: `✅ Validation Passed - Merchant ${extraction.merchant_id}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `✅ *Validation Passed* - Merchant ${extraction.merchant_id} (Confidence: ${confidenceScore}%)`,
          },
        },
      ],
    });
  }

  /**
   * Send override notification
   */
  async sendOverrideNotification(validation: ValidationLog, overrideBy: string): Promise<void> {
    await this.slackClient.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_SALES_OPS || '#sales-ops',
      text: `🔓 Validation Overridden - ${validation.merchant_id}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🔓 Validation Overridden',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Merchant ID:*\n${validation.merchant_id}`,
            },
            {
              type: 'mrkdwn',
              text: `*Overridden By:*\n${overrideBy}`,
            },
            {
              type: 'mrkdwn',
              text: `*Justification:*\n${validation.override_justification}`,
            },
          ],
        },
      ],
    });
  }

  /**
   * Helper: Send email
   */
  private async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    await this.emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@bolt.eu',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }

  /**
   * Public: Send generic Slack notification to a channel
   * Used by ContractAuditService and other services
   */
  async sendSlackNotification(
    channel: string,
    message: string
  ): Promise<void> {
    await this.slackClient.chat.postMessage({
      channel,
      text: message,
    });
  }
}
