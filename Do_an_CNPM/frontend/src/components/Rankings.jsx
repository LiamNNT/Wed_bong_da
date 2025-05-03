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
                if (!response.data.success || !Array.isArray(response.data.data)) {
                    throw new Error('Invalid data format from API');
                }
                const data = response.data.data;

                // Kiểm tra nếu dữ liệu không populate đúng
                if (data.length > 0 && !data[0].team_result_id?.team_id?.team_name) {
                    console.warn('Data is not fully populated. Using partial data with fallback.');
                    setError('Dữ liệu không được populate đầy đủ. Tên đội bóng không khả dụng.');
                }

                setRankings(data);
                setLoading(false);
            } catch (err) {
                console.error('Fetch error:', err.message);
                setError('Không thể tải danh sách xếp hạng đội bóng.');
                setRankings([]);
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
    if (error && rankings.length === 0) return <p className="text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4">
            {error && <p className="text-yellow-500 mb-4">{error}</p>}
            {rankings.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 border-b text-left">Xếp hạng</th>
                                <th className="py-2 px-4 border-b text-left">Tên đội</th>
                                <th className="py-2 px-4 border-b text-left">Số trận</th>
                                <th className="py-2 px-4 border-b text-left">Thắng</th>
                                <th className="py-2 px-4 border-b text-left">Hòa</th>
                                <th className="py-2 px-4 border-b text-left">Thua</th>
                                <th className="py-2 px-4 border-b text-left">Bàn thắng</th>
                                <th className="py-2 px-4 border-b text-left">Bàn thua</th>
                                <th className="py-2 px-4 border-b text-left">Hiệu số</th>
                                <th className="py-2 px-4 border-b text-left">Điểm</th>
                                <th className="py-2 px-4 border-b text-left">Ngày</th>
                                {token && <th className="py-2 px-4 border-b text-left">Hành động</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {rankings.map((ranking) => (
                                <tr key={ranking._id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">{ranking.rank || 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">{ranking.team_result_id?.team_id?.team_name || 'Không xác định'}</td>
                                    <td className="py-2 px-4 border-b">{ranking.team_result_id?.matchplayed || 0}</td>
                                    <td className="py-2 px-4 border-b">{ranking.team_result_id?.wins || 0}</td>
                                    <td className="py-2 px-4 border-b">{ranking.team_result_id?.draws || 0}</td>
                                    <td className="py-2 px-4 border-b">{ranking.team_result_id?.losses || 0}</td>
                                    <td className="py-2 px-4 border-b">{ranking.team_result_id?.goalsFor || 0}</td>
                                    <td className="py-2 px-4 border-b">{ranking.team_result_id?.goalsAgainst || 0}</td>
                                    <td className="py-2 px-4 border-b">{ranking.team_result_id?.goalsDifference || 0}</td>
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