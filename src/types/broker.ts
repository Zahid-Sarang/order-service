export interface MessageBroker {
  connectProducer: () => Promise<void>;
  disConnectProducer: () => Promise<void>;
  sendMessage: (topic: string, message: string, key?: string) => Promise<void>;
  connectConsumer: () => Promise<void>;
  disConnectConsumer: () => Promise<void>;
  consumeMessage: (topics: string[], fromBeginning: boolean) => Promise<void>;
}
