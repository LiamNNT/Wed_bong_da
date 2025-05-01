import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PlayerForm from './PlayerForm';

const Players = ({ setEditingPlayer, setShowForm, token }) => {
    const [players, setPlayers] = useState([]);
    const [playerResults, setPlayerResults] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const API_URL = 'http://localhost:5000';

    useEffect(() => {
        const fetchPlayersAndResults = async () => {
            try {
                // Lấy danh sách cầu thủ
                const playersResponse = await axios.get(`${API_URL}/api/players`);
                const playersData = playersResponse.data.data || [];
                setPlayers(playersData);

                // Nếu có cầu thủ, lấy dữ liệu player_results cho từng cầu thủ
                if (playersData.length > 0) {
                    const resultsMap = {};
                    await Promise.all(
                        playersData.map(async (player) => {
                            try {
                                const response = await axios.get(`${API_URL}/api/player_results/player/${player._id}`);
                                const results = Array.isArray(response.data.data) ? response.data.data : [];
                                // Tổng hợp dữ liệu từ tất cả các bản ghi
                                const aggregatedResult = results.reduce(
                                    (acc, result) => ({
                                        matchesplayed: acc.matchesplayed + (result.matchesplayed || 0),
                                        totalGoals: acc.totalGoals + (result.totalGoals || 0),
                                        assists: acc.assists + (result.assists || 0),
                                        yellowCards: acc.yellowCards + (result.yellowCards || 0),
                                        redCards: acc.redCards + (result.redCards || 0),
                                    }),
                                    {
                                        matchesplayed: 0,
                                        totalGoals: 0,
                                        assists: 0,
                                        yellowCards: 0,
                                        redCards: 0,
                                    }
                                );
                                resultsMap[player._id] = aggregatedResult;
                            } catch (err) {
                                // Nếu không tìm thấy kết quả (404) hoặc lỗi khác, đặt giá trị mặc định
                                resultsMap[player._id] = {
                                    matchesplayed: 0,
                                    totalGoals: 0,
                                    assists: 0,
                                    yellowCards: 0,
                                    redCards: 0,
                                };
                            }
                        })
                    );
                    setPlayerResults(resultsMap);
                }
            } catch (err) {
                setError('Không thể tải danh sách cầu thủ. Vui lòng kiểm tra kết nối hoặc dữ liệu backend.');
            } finally {
                setLoading(false); // Đảm bảo luôn thoát trạng thái loading
            }
        };

        fetchPlayersAndResults();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const handleEdit = (player) => {
        setEditingPlayer(player);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/api/players/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPlayers(players.filter((player) => player._id !== id));
            setPlayerResults((prev) => {
                const updatedResults = { ...prev };
                delete updatedResults[id];
                return updatedResults;
            });
            setSuccess('Xóa cầu thủ thành công!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Không thể xóa cầu thủ. Vui lòng thử lại sau.');
        }
    };

    if (loading) return <p className="text-center">Đang tải...</p>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <div className="container mx-auto p-4">
            {success && <p className="text-green-500 text-center mb-4">{success}</p>}
            <h2 className="text-2xl font-bold mb-4">Danh sách cầu thủ</h2>
            {players.length === 0 ? (
                <p className="text-gray-500 text-center">Không có cầu thủ nào.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border">Tên</th>
                                <th className="py-2 px-4 border">Số áo</th>
                                <th className="py-2 px-4 border">Vị trí</th>
                                <th className="py-2 px-4 border">Quốc tịch</th>
                                <th className="py-2 px-4 border">Ngày sinh</th>
                                <th className="py-2 px-4 border">Số trận</th>
                                <th className="py-2 px-4 border">Bàn thắng</th>
                                <th className="py-2 px-4 border">Kiến tạo</th>
                                <th className="py-2 px-4 border">Thẻ vàng</th>
                                <th className="py-2 px-4 border">Thẻ đỏ</th>
                                <th className="py-2 px-4 border">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map((player) => {
                                const results = playerResults[player._id] || {
                                    matchesplayed: 0,
                                    totalGoals: 0,
                                    assists: 0,
                                    yellowCards: 0,
                                    redCards: 0,
                                };

                                return (
                                    <tr key={player._id}>
                                        <td className="py-2 px-4 border">{player.name}</td>
                                        <td className="py-2 px-4 border">{player.number}</td>
                                        <td className="py-2 px-4 border">{player.position}</td>
                                        <td className="py-2 px-4 border">{player.nationality}</td>
                                        <td className="py-2 px-4 border">{formatDate(player.dateOfBirth)}</td>
                                        <td className="py-2 px-4 border">
                                            {results.matchesplayed >= 0 ? results.matchesplayed : <span className="text-gray-400">Dữ liệu không hợp lệ</span>}
                                        </td>
                                        <td className="py-2 px-4 border">
                                            {results.totalGoals >= 0 ? results.totalGoals : <span className="text-gray-400">Dữ liệu không hợp lệ</span>}
                                        </td>
                                        <td className="py-2 px-4 border">
                                            {results.assists >= 0 ? results.assists : <span className="text-gray-400">Dữ liệu không hợp lệ</span>}
                                        </td>
                                        <td className="py-2 px-4 border">
                                            {results.yellowCards >= 0 ? results.yellowCards : <span className="text-gray-400">Dữ liệu không hợp lệ</span>}
                                        </td>
                                        <td className="py-2 px-4 border">
                                            {results.redCards >= 0 ? results.redCards : <span className="text-gray-400">Dữ liệu không hợp lệ</span>}
                                        </td>
                                        <td className="py-2 px-4 border">
                                            {token && setEditingPlayer && setShowForm && (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(player)}
                                                        className="bg-yellow-500 text-white p-1 rounded mr-2"
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(player._id)}
                                                        className="bg-red-500 text-white p-1 rounded"
                                                    >
                                                        Xóa
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Players;