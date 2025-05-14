const authConfig = {
  providers: [
    {
      applicationID: "convex",
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
    }
  ],
};

export default authConfig;
