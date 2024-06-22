export interface MessageBroker {
  connectConsumer: () => Promise<void>;
  disConnectConsumer: () => Promise<void>;
  consumeMessage: (topics: string[], fromBeginning: boolean) => Promise<void>;
}
