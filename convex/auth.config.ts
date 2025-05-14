const authConfig = {
  providers: [
    {
      applicationID: "convex",
      domain: process.env.VITE_CLERK_FRONTEND_API_URL,
    }
  ],
};

export default authConfig;
