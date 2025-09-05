import express, { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { authMiddleware } from "./authMiddleware";

const app = express();
app.use(express.json());

const JWT_SECRET = "supersecretkey"; // In production, keep in .env file

// In-memory user store (replace with DB in real apps)
interface User {
  username: string;
  password: string; // hashed password
}
const users: User[] = [];
const blacklistedTokens: string[] = [];

// ================= SIGNUP =================
app.post("/signup", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const existingUser = users.find((u) => u.username === username);
  if (existingUser) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });

  res.json({ message: "User registered successfully" });
});

// ================= SIGNIN =================
app.post("/signin", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

  res.json({ message: "Signin successful", token });
});

// ================= LOGOUT =================
app.post("/logout", (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("R",req.headers);
  
  if (!token) return res.status(400).json({ message: "Token required" });

  blacklistedTokens.push(token);
  res.json({ message: "Logout successful" });
});

// ================= Middleware =================
interface AuthRequest extends Request {
  user?: string | JwtPayload;
}



// ================= Protected Route =================
app.get("/profile", authMiddlepwsware, (req: AuthRequest, res: Response) => {
  res.json({ message: `Welcome ${req.user && (req.user as any).username}!` });
});

// ================= Start Server =================
app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
