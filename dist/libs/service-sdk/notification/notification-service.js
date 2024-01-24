"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const aws_sdk_1 = require("aws-sdk");
const sns = new aws_sdk_1.SNS({ apiVersion: "2010-03-31", region: process.env.AWS_REGION });
class NotificationService {
    publish(notification) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.sendSMSNotification(notification);
        });
    }
    sendSMSNotification(notification) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
            return yield sns.publish(params).promise();
        });
    }
}
exports.default = new NotificationService();
//# sourceMappingURL=notification-service.js.map