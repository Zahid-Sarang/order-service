import { Consumer, EachMessagePayload, Kafka, Producer } from "kafkajs";
import config from "config";
import { MessageBroker } from "../types/broker";
import { handleProductUpdate } from "../productCache/productUpdateHandler";
import { handleToppingUpdate } from "../toppingCache/toppingUpdateHandler";

export class KafkaBroker implements MessageBroker {
  private consumer: Consumer;
  private producer: Producer;

  constructor(clientId: string, brokers: string[]) {
    const kafka = new Kafka({ clientId, brokers });

    this.producer = kafka.producer();
    this.consumer = kafka.consumer({ groupId: clientId });
  }

  /**
   * Connect the consumer
   */
  async connectConsumer() {
    await this.consumer.connect();
  }

  /**
   * Connect the producer
   */
  async connectProducer() {
    await this.producer.connect();
  }

  /**
   * Disconnect the consumer
   */
  async disConnectConsumer() {
    await this.consumer.disconnect();
  }

  /**
   * Disconnect the producer
   */
  async disConnectProducer() {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }

  /**
   *
   * @param topic - The topic to send messages to
   * @param message - The message to send
   * @throws {Error} - When the producer is not connected
   */
  async sendMessage(topic: string, message: string) {
    await this.producer.send({
      topic,
      messages: [{ value: message }],
    });
  }

  /**
   * Consume a message from the from the producer
   */
  async consumeMessage(topics: string[], fromBeginning: boolean = false) {
    await this.consumer.subscribe({ topics, fromBeginning });

    await this.consumer.run({
      eachMessage: async ({
        topic,
        partition,
        message,
      }: EachMessagePayload) => {
        console.log({
          value: message.value.toString(),
          topic: topic,
          partition: partition,
        });

        // logic to handle incoming messages

        switch (topic) {
          case config.get("topic.productTopic"):
            await handleProductUpdate(message.value.toString());
            return;
          case config.get("topic.toppingTopic"):
            await handleToppingUpdate(message.value.toString());
            return;
          default:
            console.log("Doing nothing");
        }
      },
    });
  }
}
