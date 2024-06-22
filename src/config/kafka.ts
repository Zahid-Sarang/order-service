import { Consumer, EachMessagePayload, Kafka } from "kafkajs";
import { MessageBroker } from "../types/broker";
import { handleProductUpdate } from "../productCache/productUpdateHandler";

export class KafkaBroker implements MessageBroker {
  private consumer: Consumer;

  constructor(clientId: string, brokers: string[]) {
    const kafka = new Kafka({ clientId, brokers });

    this.consumer = kafka.consumer({ groupId: clientId });
  }

  /**
   * Connect the consumer
   */
  async connectConsumer() {
    await this.consumer.connect();
  }

  /**
   * Disconnect the consumer
   */
  async disConnectConsumer() {
    await this.consumer.disconnect();
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
        // logic to handle incoming messages

        switch (topic) {
          case "product":
            await handleProductUpdate(message.value.toString());
            return;
          default:
            console.log("Doing nothing");
        }

        console.log({
          value: message.value.toString(),
          topic: topic,
          partition: partition,
        });
      },
    });
  }
}
