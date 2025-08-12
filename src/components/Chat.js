import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useHasura } from '@nhost/react-hasura';
import { useParams } from 'react-router-dom';

const Chat = () => {
  const hasura = useHasura();
  const { chatId } = useParams();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { data: chat, isLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const result = await hasura.query({
        query: `
          query GetChat($id: uuid!) {
            chats_by_pk(id: $id) {
              id
              title
              messages(order_by: {created_at: asc}) {
                id
                content
                is_bot
                created_at
              }
            }
          }
        `,
        variables: { id: chatId }
      });
      return result.data.chats_by_pk;
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      const result = await hasura.mutation({
        mutation: `
          mutation SendMessage($chatId: uuid!, $content: String!) {
            insert_messages_one(object: {
              chat_id: $chatId,
              content: $content,
              is_bot: false
            }) {
              id
            }
          }
        `,
        variables: { chatId, content }
      });
      return result.data.insert_messages_one.id;
    },
    onSuccess: () => {
      setMessage('');
      scrollToBottom();
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMessageMutation.mutateAsync(message);
    // The chatbot response will be handled by the Hasura Action and subscription
  };

  if (isLoading) {
    return <div>Loading chat...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.is_bot ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-4 rounded-lg ${
                msg.is_bot
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            disabled={message.length === 0}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
