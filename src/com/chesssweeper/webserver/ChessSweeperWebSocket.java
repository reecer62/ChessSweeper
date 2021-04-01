package com.chesssweeper.webserver;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;

@WebSocket
public class ChessSweeperWebSocket {

	public Session session;
	
	@OnWebSocketMessage
	public void onText(Session session, String message) throws IOException {

		String placeholder = "";
		// Client requests a side
		if(ChessRoom.getInstance().contains(this)) {
			// Existing Client
			if(placeholder.equals("get")) {
				session.getRemote().sendString(ChessRoom.getInstance().getState());
			} else {
				ChessRoom.getInstance().updateState(this, message);
			}
		} else {
			// New Client
			if(placeholder.equals("Joinblack")) {
				if(!ChessRoom.getInstance().joinBlack(this)) {
					// "Black is not empty"
				}
				
			} else if(placeholder.equals("Joinwhite")) {
				if(!ChessRoom.getInstance().joinWhite(this)) {
					// "Black is not empty"
				}
				
			}
		}

		ChessRoom.getInstance().writeAllClients(message);
	}

	@OnWebSocketConnect
	public void onConnect(Session session) throws IOException {
		System.out.println("+" + session.getRemoteAddress().getHostString());
		this.session = session;
		
	}

	@OnWebSocketClose
	public void onClose(Session session, int status, String reason) {
		System.out.println("-" + session.getRemoteAddress().getHostString());
		ChessRoom.getInstance().leave(this);
	}
	

	public static class ChessRoom {
		
		private static final ChessRoom INSTANCE = new ChessRoom();
		
		private String gameState;

		private List<ChessSweeperWebSocket> clients = new ArrayList<>();
		
		private ChessSweeperWebSocket clientBlack, clientWhite;

		public static ChessRoom getInstance() {
			return INSTANCE;
		}
		
		public boolean joinBlack(ChessSweeperWebSocket socket) {
			synchronized(this) {
				if(clientBlack != null) {
					return false;
				}
				clientBlack = socket;
			}
			return true;
			
		}
		
		public boolean isBlack(ChessSweeperWebSocket socket) {
			return socket.session.getRemoteAddress().equals(clientBlack.session.getRemoteAddress());
		}
		
		public boolean joinWhite(ChessSweeperWebSocket socket) {
			synchronized(this) {
				if(clientWhite != null) {
					return false;
				}
				clientWhite = socket;
			}
			return true;
		}
		
		public boolean isWhite(ChessSweeperWebSocket socket) {
			return socket.session.getRemoteAddress().equals(clientWhite.session.getRemoteAddress());
		}
		
		// State is client validated by the chess.js library
		public void updateState(ChessSweeperWebSocket socket, String state) {
			// Update the state with a monitor
			synchronized(this) {
				gameState = state;
			}
			
			// Once the state is updated, the new value can safely be sent
			// using the function argument
			try {
				writeOtherClient(socket, state);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		
		public String getState() {
			return gameState;
		}
		
		public void leave(ChessSweeperWebSocket socket) {
			if(isBlack(socket)) {
				clientBlack = null;
			} if (isWhite(socket)) {
				clientWhite = null;
			} else {
				// Not a player address
			}
		}
		
		public boolean contains(ChessSweeperWebSocket socket) {
			return isBlack(socket) || isWhite(socket);
		}
		
		public void writeAllClients(String message) {
			for(ChessSweeperWebSocket client : clients) {
				try {
					client.session.getRemote().sendString(message);
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
		
		public void writeOtherClient(ChessSweeperWebSocket socket, String message) throws IOException {
			if(isBlack(socket)) {
				clientWhite.session.getRemote().sendString(message);
			} else if(isWhite(socket)) {
				clientBlack.session.getRemote().sendString(message);
			}
		}
	}

}
