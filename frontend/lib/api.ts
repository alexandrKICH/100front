const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async register(login: string, password: string, name: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ login, password, name }),
    });
  }

  async login(login: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    });
  }

  async logout(userId: string) {
    return this.request('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async updateUser(userId: string, updates: any) {
    return this.request(`/api/auth/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async searchUsers(query: string, userId: string) {
    return this.request(`/api/contacts/search?query=${encodeURIComponent(query)}&userId=${userId}`);
  }

  async addContact(userId: string, contactUserId: string) {
    return this.request('/api/contacts/add', {
      method: 'POST',
      body: JSON.stringify({ userId, contactUserId }),
    });
  }

  async getContacts(userId: string) {
    return this.request(`/api/contacts/${userId}`);
  }

  async removeContact(userId: string, contactUserId: string) {
    return this.request(`/api/contacts/${userId}/${contactUserId}`, {
      method: 'DELETE',
    });
  }

  async createGroup(name: string, description: string, adminId: string, participantIds: string[]) {
    return this.request('/api/groups/create', {
      method: 'POST',
      body: JSON.stringify({ name, description, adminId, participantIds }),
    });
  }

  async getUserGroups(userId: string) {
    return this.request(`/api/groups/${userId}`);
  }

  async updateGroup(groupId: string, updates: any) {
    return this.request(`/api/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async leaveGroup(groupId: string, userId: string) {
    return this.request(`/api/groups/${groupId}/${userId}`, {
      method: 'DELETE',
    });
  }

  async sendMessage(chatId: string, senderId: string, content: string, type = 'text', mediaUrl?: string, fileName?: string, fileSize?: number) {
    return this.request('/api/messages/send', {
      method: 'POST',
      body: JSON.stringify({ chatId, senderId, content, type, mediaUrl, fileName, fileSize }),
    });
  }

  async getMessages(chatId: string, userId: string) {
    return this.request(`/api/messages/${chatId}?userId=${userId}`);
  }

  async getChatId(user1Id: string, user2Id: string) {
    const data = await this.request(`/api/messages/chat-id/private/${user1Id}/${user2Id}`);
    return data.chatId;
  }

  async getGroupChatId(groupId: string) {
    const data = await this.request(`/api/messages/chat-id/group/${groupId}`);
    return data.chatId;
  }

  async getLastMessage(chatId: string) {
    return this.request(`/api/messages/last/${chatId}`);
  }

  async getBatchLastMessages(userId: string): Promise<Record<string, { text: string; time: Date; type: string }>> {
    const data = await this.request(`/api/messages/batch/last-messages/${userId}`);
    // Convert time strings back to Date objects
    const result: Record<string, { text: string; time: Date; type: string }> = {};
    for (const [contactId, message] of Object.entries(data)) {
      result[contactId] = {
        ...(message as any),
        time: new Date((message as any).time),
      };
    }
    return result;
  }

  async initiateCall(callerId: string, receiverId: string, type: 'voice' | 'video') {
    const data = await this.request('/api/calls/initiate', {
      method: 'POST',
      body: JSON.stringify({ callerId, receiverId, type }),
    });
    return data.callId;
  }

  async acceptCall(callId: string) {
    return this.request(`/api/calls/accept/${callId}`, {
      method: 'PUT',
    });
  }

  async declineCall(callId: string) {
    return this.request(`/api/calls/decline/${callId}`, {
      method: 'PUT',
    });
  }

  async endCall(callId: string) {
    return this.request(`/api/calls/end/${callId}`, {
      method: 'PUT',
    });
  }

  async getActiveCalls(userId: string) {
    return this.request(`/api/calls/active/${userId}`);
  }

  async uploadFile(file: string, userId: string, fileName: string, fileType: string) {
    const data = await this.request('/api/files/upload', {
      method: 'POST',
      body: JSON.stringify({ file, userId, fileName, fileType }),
    });
    return data.url;
  }

  async getFolders(userId: string) {
    return this.request(`/api/folders/${userId}`);
  }

  async createFolder(userId: string, name: string) {
    return this.request('/api/folders/create', {
      method: 'POST',
      body: JSON.stringify({ userId, name }),
    });
  }

  async updateFolder(folderId: string, name: string) {
    return this.request(`/api/folders/${folderId}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async deleteFolder(folderId: string) {
    return this.request(`/api/folders/${folderId}`, {
      method: 'DELETE',
    });
  }

  async addChatToFolder(folderId: string, chatId: string) {
    return this.request(`/api/folders/${folderId}/add-chat`, {
      method: 'POST',
      body: JSON.stringify({ chatId }),
    });
  }

  async removeChatFromFolder(folderId: string, chatId: string) {
    return this.request(`/api/folders/${folderId}/remove-chat`, {
      method: 'POST',
      body: JSON.stringify({ chatId }),
    });
  }
}

export const api = new ApiClient(API_URL);
