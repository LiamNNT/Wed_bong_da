import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MatchForm = ({ editingMatch, setEditingMatch, setShowForm, setMatches }) => {
    const [formData, setFormData] = useState({
        season_id: '',
        matchperday: 2,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (editingMatch) {
            setFormData({
                season_id: editingMatch.season_id._id,
                matchperday: editingMatch.matchperday || 2,
            });
        }
    }, [editingMatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMatch) {
                const response = await axios.put(`http://localhost:5000/api/matches/${editingMatch._id}`, formData);
                setMatches((prev) =>
                    prev.map((match) => (match._id === editingMatch._id ? response.data.data : match))
                );
            } else {
                const response = await axios.post('http://localhost:5000/api/matches/', formData);
                setMatches((prev) => [...prev, response.data.data]);
            }
            setShowForm(false);
            setEditingMatch(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể lưu trận đấu');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">{editingMatch ? 'Sửa trận đấu' : 'Thêm trận đấu'}</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <input
                    type="text"
                    value={formData.season_id}
                    onChange={(e) => setFormData({ ...formData, season_id: e.target.value })}
                    placeholder="ID mùa giải"
                    className="w-full p-2 border rounded"
                    required
                />
                <input
                    type="number"
                    value={formData.matchperday}
                    onChange={(e) => setFormData({ ...formData, matchperday: parseInt(e.target.value) })}
                    placeholder="Số trận mỗi ngày"
                    className="w-full p-2 border rounded"
                    required
                />
                <button type="submit" className="bg-blue-600 text-white p-2 rounded">Lưu</button>
                <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-500 text-white p-2 rounded"
                >
                    Hủy
                </button>
            </form>
        </div>
    );
};

export default MatchForm;