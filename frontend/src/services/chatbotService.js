import api from "./api";

class ChatbotService {
  // Send a message to the chatbot
  async sendMessage(message) {
    try {
      const response = await api.post("/chatbot/", { message });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get chatbot conversation history
  async getHistory() {
    try {
      const response = await api.get("/chatbot/history/");
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ChatbotService();
