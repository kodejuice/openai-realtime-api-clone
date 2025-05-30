import { RealtimeClient } from "@openai/realtime-api-beta";
import { WebSocket } from "ws";
function createRealtimeClient(options) {
  const params = new URLSearchParams({
    call_type: options.call.type,
    call_id: options.call.id,
    api_key: options.streamApiKey
  });
  const url = `${options.baseUrl.replace(
    "https://",
    "wss://"
  )}/video/connect_agent?${params.toString()}`;
  const client = new RealtimeClient({
    url,
    apiKey: options.openAiApiKey,
    dangerouslyAllowAPIKeyInBrowser: true,
    debug: options.debug ?? false
  });
  client.realtime.streamToken = options.streamUserToken;
  client.realtime.model = options.model;
  patchRealtimeApi(client.realtime);
  return client;
}
function patchRealtimeApi(realtime) {
  realtime.connect = async function({ model } = {}) {
    if (this.isConnected()) {
      throw new Error(`Already connected`);
    }
    const modelToUse = model || this.model;
    // console.log(`Connecting with model ${modelToUse}`);
    const ws = new WebSocket(`${this.url}${modelToUse ? `&model=${modelToUse}` : ""}`, [], {
      finishRequest: (_request) => {
        const request = _request;
        request.setHeader("Authorization", `Bearer ${this.apiKey}`);
        request.setHeader("OpenAI-Beta", "realtime=v1");
        request.setHeader("Stream-Authorization", this.streamToken);
        request.end();
      }
    });
    return new Promise((resolve, reject) => {
      ws.on("message", (data) => {
        const message = JSON.parse(data.toString());
        // console.log("Received message:", message);
        if (message.type === "error") {
          this.disconnect(ws);
          reject(message);
        }
        this.receive(message.type, message);
        resolve(true);
      });
      const connectionErrorHandler = () => {
        // console.log("Connection error:", ws.readyState);
        this.disconnect(ws);
        reject(new Error(`Could not connect to "${this.url}"`));
      };
      ws.on("error", connectionErrorHandler);
      ws.on("open", () => {
        // console.log("Connected to:", this.url);
        this.log(`Connected to "${this.url}"`);
        ws.removeListener("error", connectionErrorHandler);
        ws.on("error", () => {
          this.disconnect(ws);
          this.log(`Error, disconnected from "${this.url}"`);
          this.dispatch("close", { error: true });
        });
        ws.on("close", () => {
          this.disconnect(ws);
          // console.log("Disconnected from:", this.url);
          this.log(`Disconnected from "${this.url}"`);
          this.dispatch("close", { error: false });
          reject(new Error("Closed without any messages"));
        });
        this.ws = ws;
      });
    });
  };
}
export {
  createRealtimeClient
};
