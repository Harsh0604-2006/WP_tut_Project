import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function createToken(user) {
  const secret = process.env.JWT_SECRET || "default_vruksh_saathi_jwt_secret";
  return jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: "7d" });
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email, and password are required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "An account with that email already exists" });

    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: createToken(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message || "Could not create account" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid email or password" });

    res.json({ token: createToken(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Could not log in" });
  }
}
