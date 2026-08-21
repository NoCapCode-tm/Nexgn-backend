import React from "react";
import { render } from "@react-email/render";

import SubAdminInviteEmail from "./InviteMail.jsx";
import WaitlistConfirmationEmail from "./Notified.jsx";
import ResetPasswordEmail from "./ResetPassword.jsx";
import VerifyEmail from "./E-Verification.jsx";

export const renderSubAdminInviteEmail = async (props) => {
    return await render(
        React.createElement(SubAdminInviteEmail, props)
    );
};

export const renderWaitlistEmail = async (props) => {
    return await render(
        React.createElement(WaitlistConfirmationEmail, props)
    );
};

export const renderResetPasswordEmail = async (props) => {
    return await render(
        React.createElement(ResetPasswordEmail, props)
    );
};

export const renderVerifyEmail = async (props) => {
    return await render(
        React.createElement(VerifyEmail, props)
    );
};