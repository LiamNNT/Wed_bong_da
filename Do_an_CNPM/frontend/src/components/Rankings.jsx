import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Rankings = ({ seasonId, token }) => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!seasonId) return;

        const fetchRankings = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/api/rankings/${seasonId}`);
                // Kiểm tra cấu trúc dữ liệu từ API
                if (!response.data.success || !Array.isArray(response.data.data)) {
                    throw new Error('Invalid data format from API');
                }
                const data = response.data.data;
                setRankings(data);
                // Kiểm tra xem dữ liệu có được populate không
                if (data.length > 0 && !data[0].team_result_id?.team_id?.team_name) {
                    setError('Dữ liệu không được populate. Hiển thị dữ liệu giả.');
                    setRankings([
                        {
                            _id: '67ecbb49dcba31003c8dee6f',
                            team_result_id: {
                                _id: '67ecb8c611b87e1d8a074da6',
                                team_id: {
                                    _id: '67d15dd8b9412e544d984b81',
                                    team_name: 'Updated Team A',
                                    stadium: 'Updated Stadium A',
                                    coach: 'Updated Coach A',
                                    logo: 'https://example.com/updated_logo.png',
                                },
                                matchesPlayed: 10,
                                points: 25,
                            },
                            season_id: '67ceaf8b444f610224ed67df',
                            rank: 0,
                            date: '2025-01-10T00:00:00.000Z',
                        },
                    ]);
                }
                setLoading(false);
            } catch (err) {
                setError('Không thể tải danh sách xếp hạng đội bóng. Hiển thị dữ liệu giả.');
                setRankings([
                    {
                        _id: '67ecbb49dcba31003c8dee6f',
                        team_result_id: {
                            _id: '67ecb8c611b87e1d8a074da6',
                            team_id: {
                                _id: '67d15dd8b9412e544d984b81',
                                team_name: 'Updated Team A',
                                stadium: 'Updated Stadium A',
                                coach: 'Updated Coach A',
                                logo: 'https://example.com/updated_logo.png',
                            },
                            matchesPlayed: 10,
                            points: 25,
                        },
                        season_id: '67ceaf8b444f610224ed67df',
                        rank: 0,
                        date: '2025-01-10T00:00:00.000Z',
                    },
                ]);
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
            await axios.delete(`http://localhost:5000/api/rankings/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRankings(rankings.filter((ranking) => ranking._id !== id));
        } catch (err) {
            setError('Không thể xóa xếp hạng');
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
                                <th className="py-2 px-4 border-b text-left">Tên đội</th>
                                <th className="py-2 px-4 border-b text-left">Số trận</th>
                                <th className="py-2 px-4 border-b text-left">Điểm</th>
                                <th className="py-2 px-4 border-b text-left">Ngày</th>
                                {token && <th className="py-2 px-4 border-b text-left">Hành động</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {rankings.map((ranking) => (
                                <tr key={ranking._id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">{ranking.rank}</td>
                                    <td className="py-2 px-4 border-b">{ranking.team_result_id?.team_id?.team_name || 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">{ranking.team_result_id?.matchesPlayed || 0}</td>
                                    <td className="py-2 px-4 border-b">{ranking.team_result_id?.points || 0}</td>
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
                <p className="text-gray-500">Chưa có dữ liệu xếp hạng đội bóng.</p>
            )}
        </div>
    );
};

export default Rankings;