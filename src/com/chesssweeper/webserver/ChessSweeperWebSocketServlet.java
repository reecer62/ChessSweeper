package com.chesssweeper.webserver;

import javax.servlet.annotation.WebServlet;

import org.eclipse.jetty.websocket.servlet.WebSocketServlet;
import org.eclipse.jetty.websocket.servlet.WebSocketServletFactory;
import com.chesssweeper.webserver.*;

@WebServlet(urlPatterns="/ChessSweeperWS") //TODO see if this is the little bugger messing with my extension
public class ChessSweeperWebSocketServlet  extends WebSocketServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = -7387886809127697540L;

	@Override
	public void configure(WebSocketServletFactory factory) {
		
	      factory.register(ChessSweeperWebSocket.class);
		
	}

}
