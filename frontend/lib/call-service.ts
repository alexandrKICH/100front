// Улучшенный сервис для управления звонками между пользователями
interface CallData {
  id: string
  callerId: string
  receiverId: string
  type: "voice" | "video"
  status: "calling" | "ringing" | "accepted" | "declined" | "ended"
  timestamp: number
  callerInfo?: {
    login: string
    name: string
    avatar: string
  }
}

class CallService {
  private activeCall: CallData | null = null
  private callListeners: ((call: CallData | null) => void)[] = []
  private incomingCallListeners: ((call: CallData | null) => void)[] = []

  // Подписка на изменения звонков
  onCallUpdate(callback: (call: CallData | null) => void) {
    this.callListeners.push(callback)
    return () => {
      this.callListeners = this.callListeners.filter((cb) => cb !== callback)
    }
  }

  // Подписка на входящие звонки
  onIncomingCall(callback: (call: CallData | null) => void) {
    this.incomingCallListeners.push(callback)
    return () => {
      this.incomingCallListeners = this.incomingCallListeners.filter((cb) => cb !== callback)
    }
  }

  // Уведомление всех слушателей
  private notifyListeners() {
    this.callListeners.forEach((callback) => callback(this.activeCall))
  }

  // Уведомление о входящих звонках
  private notifyIncomingCall(call: CallData | null) {
    this.incomingCallListeners.forEach((callback) => callback(call))
  }

  // Инициация звонка
  async initiateCall(callerId: string, receiverId: string, type: "voice" | "video", callerInfo?: any): Promise<string> {
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    this.activeCall = {
      id: callId,
      callerId,
      receiverId,
      type,
      status: "calling",
      timestamp: Date.now(),
      callerInfo,
    }

    console.log("📞 Initiating call:", this.activeCall)
    this.notifyListeners()

    // Через 1 секунду меняем статус на ringing и уведомляем получателя
    setTimeout(() => {
      if (this.activeCall?.id === callId) {
        this.activeCall.status = "ringing"
        console.log("📞 Call status changed to ringing:", callId)
        this.notifyListeners()

        // Уведомляем получателя о входящем звонке
        this.notifyIncomingCall(this.activeCall)
      }
    }, 1000)

    // Автоматически завершаем звонок через 30 секунд если не отвечают
    setTimeout(() => {
      if (this.activeCall?.id === callId && this.activeCall.status === "ringing") {
        console.log("📞 Call timeout, ending call:", callId)
        this.endCall(callId)
      }
    }, 30000)

    return callId
  }

  // Принятие звонка
  acceptCall(callId: string) {
    if (this.activeCall?.id === callId) {
      this.activeCall.status = "accepted"
      console.log("✅ Call accepted:", callId)
      this.notifyListeners()
      this.notifyIncomingCall(null) // Убираем уведомление о входящем звонке
    }
  }

  // Отклонение звонка
  declineCall(callId: string) {
    if (this.activeCall?.id === callId) {
      this.activeCall.status = "declined"
      console.log("❌ Call declined:", callId)
      this.notifyListeners()
      this.notifyIncomingCall(null) // Убираем уведомление о входящем звонке

      // Убираем звонок через секунду
      setTimeout(() => {
        this.activeCall = null
        this.notifyListeners()
      }, 1000)
    }
  }

  // Завершение звонка
  endCall(callId: string) {
    if (this.activeCall?.id === callId) {
      this.activeCall.status = "ended"
      console.log("📞 Call ended:", callId)
      this.notifyListeners()
      this.notifyIncomingCall(null) // Убираем уведомление о входящем звонке

      // Убираем звонок через секунду
      setTimeout(() => {
        this.activeCall = null
        this.notifyListeners()
      }, 1000)
    }
  }

  // Получение текущего звонка
  getCurrentCall(): CallData | null {
    return this.activeCall
  }

  // Проверка, есть ли активный звонок для пользователя
  hasActiveCallForUser(userId: string): boolean {
    return this.activeCall !== null && (this.activeCall.callerId === userId || this.activeCall.receiverId === userId)
  }

  // Получение входящего звонка для пользователя
  getIncomingCallForUser(userId: string): CallData | null {
    if (this.activeCall && this.activeCall.receiverId === userId && this.activeCall.status === "ringing") {
      return this.activeCall
    }
    return null
  }

  // Симуляция входящего звонка (для тестирования)
  simulateIncomingCall(receiverId: string, type: "voice" | "video", callerInfo: any) {
    const callId = `sim_call_${Date.now()}`

    const incomingCall: CallData = {
      id: callId,
      callerId: "test_caller",
      receiverId,
      type,
      status: "ringing",
      timestamp: Date.now(),
      callerInfo,
    }

    this.activeCall = incomingCall
    console.log("📞 Simulating incoming call:", incomingCall)
    this.notifyIncomingCall(incomingCall)
    this.notifyListeners()

    // Автоматически завершаем через 30 секунд
    setTimeout(() => {
      if (this.activeCall?.id === callId) {
        this.endCall(callId)
      }
    }, 30000)

    return callId
  }
}

export const localCallService = new CallService()
