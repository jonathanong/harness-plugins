export interface Notifications {
  enqueue(kind: string, payload: Record<string, string>): Promise<void>
}
