'use client'
import { useState } from "react";
import Input from "@/components/Input";

const UserSettingsPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the updated data to your backend
        setMessage("Settings saved (not really, this is a mockup)");
    };

    return (
        <div style={{ maxWidth: 400, margin: "0 auto", padding: 24 }}>
            <h1>User Settings</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Input
                    label="Name:"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                />
                <Input
                    label="Email:"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                />
                <Input
                    label="Password:"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter new password"
                />
                <button type="submit">Save Settings</button>
            </form>
            {message && <p style={{ color: "green" }}>{message}</p>}
        </div>
    );
};

export default UserSettingsPage;