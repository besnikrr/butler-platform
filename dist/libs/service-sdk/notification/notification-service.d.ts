declare type Notification = {
    senderId: string;
    message: string;
    phoneNumber: string;
};
declare class NotificationService {
    publish(notification: Notification): Promise<void>;
    private sendSMSNotification;
}
declare const _default: NotificationService;
export default _default;
