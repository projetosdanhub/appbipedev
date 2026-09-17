import axios from 'axios';

export interface SendTextDto {
  number: string;
  text: string;
  delayMessage?: number;
}

export interface SendMediaDto {
  number: string;
  mediatype: 'image' | 'video' | 'audio' | 'document';
  mimetype: string;
  caption?: string;
  media: string; // Base64 or URL
  fileName?: string;
  delayMessage?: number;
}

export interface SendWhatsAppAudioDto {
  number: string;
  audio: string; // Base64 or URL
  delayMessage?: number;
}

export class EvolutionClient {
  private apiUrl: string;
  private apiKey: string;
  private instanceName: string;

  constructor(apiUrl: string, apiKey: string, instanceName: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.instanceName = instanceName;
  }

  private get headers() {
    return {
      'apikey': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  async sendText(data: SendTextDto) {
    const url = `${this.apiUrl}/message/sendText/${this.instanceName}`;
    const response = await axios.post(url, data, { headers: this.headers });
    return response.data;
  }

  async sendMedia(data: SendMediaDto) {
    const url = `${this.apiUrl}/message/sendMedia/${this.instanceName}`;
    const response = await axios.post(url, data, { headers: this.headers });
    return response.data;
  }

  async sendWhatsAppAudio(data: SendWhatsAppAudioDto) {
    const url = `${this.apiUrl}/message/sendWhatsAppAudio/${this.instanceName}`;
    const response = await axios.post(url, data, { headers: this.headers });
    return response.data;
  }
}
