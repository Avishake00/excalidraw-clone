import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
const JWT_SECRET = "asdfasfd";
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws, request) {
	const url = request.url;
	if (!url) return;

	const queryParams = new URLSearchParams(url.split("?")[1]);
	const token = queryParams.get("token") || "";
	const decoded = jwt.verify("token", JWT_SECRET);

	if (!decoded || (decoded as JwtPayload).userId) {
		ws.close();
		return;
	}
	ws.on("error", console.error);
	ws.on("message", function message(data) {
		if (data.toString() === "ping") ws.send("pong");
	});

	ws.send("something");
});
