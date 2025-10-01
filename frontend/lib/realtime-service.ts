import { socketClient } from './socket';

type NotificationCallback = (notification: any) => void;

class RealtimeService {
  subscribe(userId: string, callback: NotificationCallback) {
    const socket = socketClient.connect();
    
    socket?.on('notification', callback);
    socket?.on('incoming_call', callback);
    
    return () => {
      socket?.off('notification', callback);
      socket?.off('incoming_call', callback);
    };
  }

  initiateCall(callerId: string, receiverId: string, type: 'voice' | 'video', callerInfo: any) {
    const socket = socketClient.getSocket();
    const callId = `call_${Date.now()}`;
    
    socket?.emit('initiate_call', {
      callId,
      callerId,
      receiverId,
      type,
      callerInfo,
    });
    
    return callId;
  }

  acceptCall(callId: string) {
    const socket = socketClient.getSocket();
    socket?.emit('accept_call', { callId });
  }

  declineCall(callId: string) {
    const socket = socketClient.getSocket();
    socket?.emit('decline_call', { callId });
  }

  endCall(callId: string) {
    const socket = socketClient.getSocket();
    socket?.emit('end_call', { callId });
  }
}

export const realtimeService = new RealtimeService();
