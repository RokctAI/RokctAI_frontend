"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyPayment = VerifyPayment;
function VerifyPayment(_a) {
    var hasCompletedPayment = _a.result.hasCompletedPayment;
    return (<div>
      {hasCompletedPayment
            ? "Your payment transaction has been verified!"
            : "Unable to verify your payment, please try again!"}
    </div>);
}
