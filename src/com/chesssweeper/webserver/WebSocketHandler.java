package com.chesssweeper.webserver;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import com.chesssweeper.webserver.ChessSweeperWebSocketServlet;

public class WebSocketHandler {
	
	private static Server server;
	
	public static void runWebServer() {
		server = new Server(8080);

		ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
		
		
		server.setHandler(context);
		
		context.addServlet(new ServletHolder(new ChessSweeperWebSocketServlet()), "/*");
		
		try {
			server.start();
		} catch (Exception e) {
			System.out.println("Could not start webserver!");
			e.printStackTrace();
		}
	}
	
	public static void closeWebServer() {
		try {
			server.stop();
		} catch (Exception e) {
			System.out.println("Encountered an error closing the webserver!");
			e.printStackTrace();
		}
	}

	public static void cleanUpWebServer() {
		// TODO anything else in the future
		closeWebServer();
	}
}
