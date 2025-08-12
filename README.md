# Chatbot Application with Nhost Auth, Hasura GraphQL, and OpenRouter

A modern chatbot application featuring email authentication, real-time chat, and AI-powered responses.

## Features

- Email-based authentication using Nhost Auth
- Real-time chat interface
- AI-powered chatbot responses via OpenRouter
- Secure database operations with Hasura GraphQL
- n8n integration for workflow automation

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - NHOST_URL
   - NHOST_JWT_SECRET
   - HASURA_GRAPHQL_ENDPOINT
   - OPENROUTER_API_KEY

4. Run the development server:
   ```bash
   npm run dev
   ```

## Tech Stack

- Frontend: React
- Authentication: Nhost Auth
- Database: Hasura GraphQL
- AI Integration: OpenRouter via n8n
- Real-time: GraphQL Subscriptions

## Security

- All database operations are protected by Row-Level Security
- Authentication required for all features
- Secure API key management in n8n
