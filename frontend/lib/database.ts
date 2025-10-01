import { api } from './api';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const authService = {
  async register(login: string, password: string, name: string) {
    return api.register(login, password, name);
  },

  async login(login: string, password: string) {
    return api.login(login, password);
  },

  async logout(userId: string) {
    return api.logout(userId);
  },

  async updateUser(userId: string, updates: { login?: string; name?: string; avatar?: string; status?: string }) {
    return api.updateUser(userId, updates);
  },
};

export const contactService = {
  async searchUsers(query: string, currentUserId: string) {
    return api.searchUsers(query, currentUserId);
  },

  async addContact(userId: string, contactUserId: string) {
    return api.addContact(userId, contactUserId);
  },

  async getContacts(userId: string) {
    return api.getContacts(userId);
  },

  async createPrivateChat(user1Id: string, user2Id: string) {
    const result = await api.addContact(user1Id, user2Id);
    return result.chatId;
  },

  async removeContact(userId: string, contactUserId: string) {
    return api.removeContact(userId, contactUserId);
  },
};

export const groupService = {
  async createGroup(name: string, description: string, adminId: string, participantIds: string[]) {
    return api.createGroup(name, description, adminId, participantIds);
  },

  async getUserGroups(userId: string) {
    return api.getUserGroups(userId);
  },

  async updateGroup(groupId: string, updates: any) {
    return api.updateGroup(groupId, updates);
  },

  async leaveGroup(groupId: string, userId: string) {
    return api.leaveGroup(groupId, userId);
  },
};

export const messageService = {
  async sendMessage(chatId: string, senderId: string, content: string, type = 'text', mediaUrl?: string, fileName?: string, fileSize?: number) {
    return api.sendMessage(chatId, senderId, content, type, mediaUrl, fileName, fileSize);
  },

  async getMessages(chatId: string, currentUserId: string) {
    return api.getMessages(chatId, currentUserId);
  },

  async getChatId(user1Id: string, user2Id: string) {
    return api.getChatId(user1Id, user2Id);
  },

  async getGroupChatId(groupId: string) {
    return api.getGroupChatId(groupId);
  },

  async getLastMessage(chatId: string) {
    return api.getLastMessage(chatId);
  },

  async getBatchLastMessages(userId: string) {
    return api.getBatchLastMessages(userId);
  },
};

export const callService = {
  async initiateCall(callerId: string, receiverId: string, type: 'voice' | 'video') {
    return api.initiateCall(callerId, receiverId, type);
  },

  async acceptCall(callId: string) {
    return api.acceptCall(callId);
  },

  async declineCall(callId: string) {
    return api.declineCall(callId);
  },

  async endCall(callId: string) {
    return api.endCall(callId);
  },

  async getActiveCalls(userId: string) {
    return api.getActiveCalls(userId);
  },
};

export const fileService = {
  async uploadFile(file: File, userId: string): Promise<string> {
    try {
      const base64 = await fileToBase64(file);
      return api.uploadFile(base64, userId, file.name, file.type);
    } catch (error) {
      console.error('❌ File upload failed:', error);
      const fallbackBase64 = await fileToBase64(file);
      return fallbackBase64;
    }
  },
};

export const mediaService = {
  async uploadFile(file: File, userId: string): Promise<string> {
    return fileService.uploadFile(file, userId);
  },

  async uploadImage(file: File, userId: string): Promise<string> {
    return fileService.uploadFile(file, userId);
  },

  async uploadAudio(audioBlob: Blob, userId: string): Promise<string> {
    const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
    return fileService.uploadFile(file, userId);
  },

  async uploadVideo(videoBlob: Blob, userId: string): Promise<string> {
    const file = new File([videoBlob], 'video.webm', { type: 'video/webm' });
    return fileService.uploadFile(file, userId);
  },
};

export const folderService = {
  async getFolders(userId: string) {
    return api.getFolders(userId);
  },

  async createFolder(userId: string, name: string) {
    return api.createFolder(userId, name);
  },

  async updateFolder(folderId: string, name: string) {
    return api.updateFolder(folderId, name);
  },

  async deleteFolder(folderId: string) {
    return api.deleteFolder(folderId);
  },

  async addChatToFolder(folderId: string, chatId: string) {
    return api.addChatToFolder(folderId, chatId);
  },

  async removeChatFromFolder(folderId: string, chatId: string) {
    return api.removeChatFromFolder(folderId, chatId);
  },
};
