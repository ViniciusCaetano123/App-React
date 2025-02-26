"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

interface Room {
  id: string;
  nome: string;
  idUsuario: string;
}

interface Message {
  sender: string;
  senderId: string;
  content: string;
  timestamp: string;
}

const ChatRoom = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchRooms();   
    
    
    
  }, [user, router]);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.id);
    }
  }, [activeRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRooms = async () => {
    setLoading(true);
    try {   
      const response = await api.get("/rooms");
      setRooms(response.data.dados || []);
    } catch (err) {
      setError("Erro ao carregar salas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      // Assuming you'll implement this endpoint
      const response = await api.get(`/room/${roomId}/messages`);
      setMessages(response.data.mensagens || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) return;
    
    try {
      const response = await api.post("/room", { nome: newRoomName });
      const newRoom = {
        id: response.data.idSala,
        nome: newRoomName,
        idUsuario: user?.id || ""
      };
      setRooms([...rooms, newRoom]);
      setNewRoomName("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao criar sala");
    }
  };
  const handlerRoomClick = (room: Room) => {
    router.push(`/chat?id=${room.id}`); 
    setActiveRoom(room);
  }
  const inviteToRoom = async () => {
    if (!activeRoom || !inviteEmail.trim()) return;
    
    try {
      await api.post("/room/invite", {
        idSala: activeRoom.id,
        emailConvidado: inviteEmail
      });
      setInviteEmail("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao convidar usuário");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-800 text-white flex flex-col">
        {/* Header with user info */}
        <div className="p-4 bg-gray-900 flex justify-between items-center">
          <div>
            <h3 className="font-bold">{user.nome}</h3>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-sm bg-red-600 rounded hover:bg-red-700"
          >
            Sair
          </button>
        </div>
        
        {/* Create room form */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="font-bold mb-2">Criar Sala</h3>
          <div className="flex">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Nome da sala"
              className="flex-1 p-2 text-gray-900 rounded-l"
            />
            <button
              onClick={createRoom}
              className="bg-blue-600 px-3 rounded-r hover:bg-blue-700"
            >
              +
            </button>
          </div>
        </div>
        
        {/* Rooms list */}
        <div className="flex-1 overflow-y-auto">
          <h3 className="font-bold p-4 pb-2">Salas</h3>
          {loading ? (
            <p className="p-4 text-gray-400">Carregando...</p>
          ) : rooms.length === 0 ? (
            <p className="p-4 text-gray-400">Nenhuma sala encontrada</p>
          ) : (
            <ul>
              {rooms.map((room) => (
                <li 
                  key={room.id}
                  className={`p-3 cursor-pointer hover:bg-gray-700 ${activeRoom?.id === room.id ? "bg-gray-700" : ""}`}
                  onClick={() => handlerRoomClick(room)}
                >
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="font-medium">{room.nome}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="w-3/4 flex flex-col">
        {activeRoom ? (
          <>
            {/* Chat header */}
            <div className="bg-white p-4 shadow flex justify-between items-center">
              <h2 className="text-xl font-bold">{activeRoom.nome}</h2>
              
              {/* Invite form */}
              <div className="flex">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Email do convidado"
                  className="p-2 mr-2 border rounded"
                />
                <button 
                  onClick={inviteToRoom}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Convidar
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length === 0 ? (
                <p className="text-center text-gray-500 my-8">Nenhuma mensagem ainda. Seja o primeiro a enviar!</p>
              ) : (
                messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`mb-4 max-w-3/4 ${message.senderId === user.id ? "ml-auto" : ""}`}
                  >
                    <div 
                      className={`p-3 rounded-lg ${message.senderId === user.id 
                        ? "bg-blue-600 text-white rounded-br-none" 
                        : "bg-gray-200 text-gray-800 rounded-bl-none"}`}
                    >
                      {message.content}
                    </div>
                    <div 
                      className={`text-xs mt-1 ${message.senderId === user.id ? "text-right" : ""}`}
                    >
                      <span className="font-medium">{message.sender}</span> • {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message input */}
            <div className="bg-white p-4 border-t">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  className="flex-1 p-2 border rounded-l"                  
                />
                <button 
               
                  className="bg-blue-600 text-white px-4 rounded-r hover:bg-blue-700"
                >
                  Enviar
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <h3 className="text-xl font-medium mb-2">Selecione uma sala para começar a conversar</h3>
              <p>Ou crie uma nova sala usando o menu à esquerda</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Error toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
          <div className="flex">
            <div className="py-1">
              <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p>{error}</p>
              <button 
                className="text-sm underline"
                onClick={() => setError("")}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;