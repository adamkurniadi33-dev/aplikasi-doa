
export interface Prayer {
  id: number;
  title: string;
  arabic: string;
  latin: string;
  meaning: string;
  category: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum AppView {
  LIST = 'LIST',
  DETAIL = 'DETAIL',
  AI_CHAT = 'AI_CHAT'
}
