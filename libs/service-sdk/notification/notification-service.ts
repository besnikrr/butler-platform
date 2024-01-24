import { SNS } from "aws-sdk";

type Notification = {
  senderId: string;
  message: string;
  phoneNumber: string;
};

const sns = new SNS({ apiVersion: "2010-03-31", region: process.env.AWS_REGION });

class NotificationService {
  async publish(notification: Notification) {
    await this.sendSMSNotification(notification);
  }

  private async sendSMSNotification(notification: Notification) {
    const params = {
      MessageAttributes: {
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: notification.senderId
        }
      },
      Message: notification.message,
      PhoneNumber: notification.phoneNumber
    };
    return await sns.publish(params).promise();
  }
}

export default new NotificationService();
