import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const token = response.data.data.token;
            setToken(token);
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            navigate('/teams');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Đăng nhập</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-2 border rounded"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu"
                    className="w-full p-2 border rounded"
                    required
                />
                <button type="submit" className="bg-blue-600 text-white p-2 rounded">Đăng nhập</button>
            </form>
        </div>
    );
};

export default Login;