# AI Personas

A web tool meant to assist marketing researchers by creating, managing and conversing with artificial personas tailored to the researcher's needs.

## Stack

- [React](https://react.dev/)
- [Tailwind](https://tailwindcss.com/)
- [Tanstack](https://tanstack.com/)
- [Shadcn](https://ui.shadcn.com/)
- [Convex](https://www.convex.dev/)
- [Clerk](https://clerk.com/)

## Running the app

Before running, you will need a convex and a clerk account and project for the app. 

Fill in .env.local file with:

```dotenv
CONVEX_DEPLOYMENT=""
VITE_CONVEX_URL=""
VITE_CLERK_PUBLISHABLE_KEY=""
VITE_CLERK_FRONTEND_API_URL=""
CLERK_JWT_ISSUER_DOMAIN=""
CLERK_SECRET_KEY=""
OPENAI_API_KEY=""
```

Run `npm run dev`

If it's the first time running the app, convex will prompt you some to do some configuration, just follow the CLI.

## Project structure

There are Users and Organizations at the clerk level.

Each user is a member of one organization.

There are Projects, Personas, Experiments, Messages at the application level.

The base entities are personas and projects, which have a "many to many" relationship. Each project can have many personas and each persona can be in multiple projects. Projects and personas are specific to organizations.

A project can have many Experiments which are the chats with the personas. For each experiment, you may assign any number of personas from the project.

The experiment has many messages from users and each message has many replies, being one for each persona in the experiment.

All aspects of the project are based around managing those four entities, and it's basically a CRUD app. The only exception would be the message entity, which is managed through async workflows.

## Considerations

This is my first convex app and I do not have much experience modeling data in nosql, so I believe the implementation of the data model has much to improve.