import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useHasura } from '@nhost/react-hasura';
import { Link } from 'react-router-dom';

const ChatList = () => {
  const hasura = useHasura();

  const { data: chats, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const result = await hasura.query({
        query: `
          query GetChats {
            chats {
              id
              title
              created_at
              messages(limit: 1, order_by: {created_at: desc}) {
                content
              }
            }
          }
        `
      });
      return result.data.chats;
    },
  });

  const handleCreateChat = async () => {
    const result = await hasura.mutation({
      mutation: `
        mutation CreateChat($title: String!) {
          insert_chats_one(object: {title: $title}) {
            id
          }
        }
      `,
      variables: { title: 'New Chat' }
    });
    if (result.data?.insert_chats_one?.id) {
      window.location.href = `/chat/${result.data.insert_chats_one.id}`;
    }
  };

  if (isLoading) {
    return <div>Loading chats...</div>;
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chats</h1>
        <button
          onClick={handleCreateChat}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          New Chat
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {chats.map((chat) => (
          <Link
            key={chat.id}
            to={`/chat/${chat.id}`}
            className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{chat.title}</h2>
            <p className="text-gray-600">
              {chat.messages?.[0]?.content?.slice(0, 100)}...
            </p>
            <div className="mt-2 text-sm text-gray-500">
              Last updated: {new Date(chat.created_at).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
