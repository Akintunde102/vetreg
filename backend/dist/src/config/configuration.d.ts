declare const _default: () => {
    port: number;
    nodeEnv: string;
    apiVersion: string;
    database: {
        url: string | undefined;
        directUrl: string | undefined;
    };
    supabase: {
        url: string | undefined;
        serviceRoleKey: string | undefined;
        jwtSecret: string | undefined;
    };
    frontend: {
        url: string;
    };
    email: {
        resendApiKey: string | undefined;
        sendgridApiKey: string | undefined;
    };
    sms: {
        twilioAccountSid: string | undefined;
        twilioAuthToken: string | undefined;
        twilioPhoneNumber: string | undefined;
        africasTalkingApiKey: string | undefined;
        africasTalkingUsername: string | undefined;
    };
    sentry: {
        dsn: string | undefined;
    };
    rateLimit: {
        ttl: number;
        limit: number;
    };
};
export default _default;
