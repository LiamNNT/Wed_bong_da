import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PlayerRankings = ({ seasonId, token }) => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!seasonId) return;

        const fetchRankings = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/api/player_rankings/season/${seasonId}`, {
                    params: { date: new Date().toISOString().split('T')[0] },
                });
                setRankings(response.data.data || []);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải danh sách xếp hạng cầu thủ');
                setLoading(false);
            }
        };
        fetchRankings();
    }, [seasonId]);

    const handleDelete = async (id) => {
        if (!token) {
            alert('Vui lòng đăng nhập để xóa xếp hạng.');
            return;
        }
        try {
            await axios.delete(`http://localhost:5000/api/player_rankings/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRankings(rankings.filter((ranking) => ranking._id !== id));
        } catch (err) {
            setError('Không thể xóa xếp hạng cầu thủ');
        }
    };

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4">
            {rankings.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 border-b text-left">Xếp hạng</th>
                                <th className="py-2 px-4 border-b text-left">Tên cầu thủ</th>
                                <th className="py-2 px-4 border-b text-left">Số bàn thắng</th>
                                <th className="py-2 px-4 border-b text-left">Ngày</th>
                                {token && <th className="py-2 px-4 border-b text-left">Hành động</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {rankings.map((ranking) => (
                                <tr key={ranking._id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">{ranking.rank}</td>
                                    <td className="py-2 px-4 border-b">{ranking.player_result_id?.playerName || 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">{ranking.player_result_id?.goalsScored || 0}</td>
                                    <td className="py-2 px-4 border-b">{new Date(ranking.date).toLocaleDateString()}</td>
                                    {token && (
                                        <td className="py-2 px-4 border-b">
                                            <button
                                                onClick={() => handleDelete(ranking._id)}
                                                className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500">Chưa có dữ liệu xếp hạng cầu thủ.</p>
            )}
        </div>
    );
};

export default PlayerRankings;