"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketProvider = exports.WebSocketActionTypes = void 0;
// SQU5-428
exports.WebSocketActionTypes = {
    "order-paid": {
        key: "order-paid",
        label: "Order Paid"
    },
    "order-updated": {
        key: "order-updated",
        label: "Order Updated"
    },
    "order-created": {
        key: "order-created",
        label: "Order Created"
    },
    "order-cancelled": {
        key: "order-cancelled",
        label: "Order Cancelled"
    },
    "order-delivered": {
        key: "order-delivered",
        label: "Order Delivered"
    },
    "order-received": {
        key: "order-received",
        label: "Order Received"
    },
    "order-refunden": {
        key: "order-refunden",
        label: "Order Refunden"
    },
    "order-confirmed": {
        key: "order-confirmed",
        label: "Order Confirmed"
    },
    "order-rejected": {
        key: "order-rejected",
        label: "Order Rejected"
    },
    "order-comment": {
        key: "order-comment",
        label: "Order Comment"
    },
    "order-assinged": {
        key: "order-assinged",
        label: "Order Assinged"
    },
    "order-merged": {
        key: "order-merged",
        label: "Order Merged"
    },
    "mark-order-as-read": {
        key: "mark-order-as-read",
        label: "Mark Order As Read"
    },
    "order-update-tip": {
        key: "order-update-tip",
        label: "Order Update Tip"
    },
    "order-update-kitchen-confirm-date": {
        key: "order-update-kitchen-confirm-date",
        label: "Order Update Kitchen Confirm Date"
    }
};
var WebSocketProvider;
(function (WebSocketProvider) {
    WebSocketProvider[WebSocketProvider["APIGATEWAY"] = 0] = "APIGATEWAY";
})(WebSocketProvider = exports.WebSocketProvider || (exports.WebSocketProvider = {}));
//# sourceMappingURL=interfaces.js.map