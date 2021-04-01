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
		// System.out.println("Message received:" + message);

		ChessRoom.getInstance().writeAllClients(message);
		
//		if (session.isOpen()) {
//			String result = null;
//			try {
//				result = handleQuery(message); // TODO turn this into a ternary lol
//			} catch (IllegalArgumentException e) {
//				result = e.getMessage();
//				System.err.print(e.getMessage() + " (" + message + ").");
//			} catch (Exception e) {
//				result = "Invalid JSON Query \"" + message + "\".";
//				System.err.print("Invalid JSON Query \'" + message + "\'.");
//			}
//			if (result != null)
//				session.getRemote().sendString(result);
//		}
	}

//	public String handleQuery(String message) {
//		return null; // TODO
//	}

	@OnWebSocketConnect
	public void onConnect(Session session) throws IOException {
		System.out.println("+" + session.getRemoteAddress().getHostString());
		this.session = session;
		ChessRoom.getInstance().join(this);
	}

	@OnWebSocketClose
	public void onClose(Session session, int status, String reason) {
		System.out.println("-" + session.getRemoteAddress().getHostString());
		ChessRoom.getInstance().leave(this);
	}

	public static class ChessRoom {
		
		private static final ChessRoom INSTANCE = new ChessRoom();

		private List<ChessSweeperWebSocket> clients = new ArrayList<>();

		public static ChessRoom getInstance() {
			return INSTANCE;
		}
		
		public void join(ChessSweeperWebSocket socket) {
			clients.add(socket);
		}
		
		public void leave(ChessSweeperWebSocket socket) {
			clients.remove(socket);
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
	}

}
