import config from "./index.js";
import { logger } from "../logger/logger.logger.js";

class RabbitMQManager {
  private connection: any = null;
  private channel: any = null;
  private initialized = false;

  async connect(): Promise<void> {
    if (this.initialized) return;

    if (!config.USE_RABBITMQ) {
      logger.info(
        "RabbitMQ service is disabled in configuration (USE_RABBITMQ=false)",
      );
      return;
    }

    this.initialized = true;

    try {
      logger.info("RabbitMQ Connecting...");
      // RabbitMQ amqplib integration placeholder:
      // const amqp = await import("amqplib");
      // this.connection = await amqp.connect(config.RABBITMQ_URL || "amqp://localhost");
      // this.channel = await this.connection.createChannel();
      // logger.success("RabbitMQ Connected");
    } catch (error: any) {
      logger.error("RabbitMQ Connection Error", error);
    }
  }

  isReady(): boolean {
    return Boolean(config.USE_RABBITMQ && this.channel);
  }

  getChannel(): any | null {
    if (!config.USE_RABBITMQ) return null;
    return this.channel;
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;

    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch {
      // Ignore cleanup error
    } finally {
      this.connection = null;
      this.channel = null;
      this.initialized = false;
    }
  }
}

export const rabbitMQManager = new RabbitMQManager();
