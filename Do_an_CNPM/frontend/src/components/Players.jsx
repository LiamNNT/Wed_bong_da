import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PlayerForm from './PlayerForm';

const Players = ({ setEditingPlayer, setShowForm, token }) => {
    const [players, setPlayers] = useState([]);
    const [playerResults, setPlayerResults] = useState({});
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const API_URL = 'http://localhost:5000';

    // Lấy danh sách mùa giải khi component mount
    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/seasons`);
                const seasonsData = response.data.data || [];
                setSeasons(seasonsData);
                if (seasonsData.length > 0) {
                    setSelectedSeason(seasonsData[0]._id); // Chọn mùa đầu tiên làm mặc định
                }
            } catch (err) {
                setError('Không thể tải danh sách mùa giải. Vui lòng thử lại sau.');
            }
        };

        fetchSeasons();
    }, []);

    // Lấy danh sách cầu thủ và kết quả thi đấu khi mùa giải thay đổi
    useEffect(() => {
        if (!selectedSeason) return; // Không gọi API nếu chưa có mùa được chọn

        const fetchPlayersAndResults = async () => {
            setLoading(true);
            setError(''); // Reset lỗi trước khi gọi API
            try {
                // Lấy danh sách cầu thủ
                const playersResponse = await axios.get(`${API_URL}/api/players`);
                const playersData = playersResponse.data.data || [];
                setPlayers(playersData);

                // Lấy kết quả thi đấu theo mùa giải được chọn
                if (playersData.length > 0 && selectedSeason) {
                    const dateObj = new Date();
                    const date = dateObj.toISOString().split('T')[0]; // Ví dụ: "2025-05-01"
                    console.log('Selected Season ID:', selectedSeason);
                    const response = await axios.get(`${API_URL}/api/player_results/season/${selectedSeason}`, {
                        params: { date },
                    });
                    const results = Array.isArray(response.data.data) ? response.data.data : [];

                    // Nếu không có kết quả, lưu thông báo lỗi từ backend nhưng vẫn đặt giá trị mặc định
                    const resultsMap = {};
                    playersData.forEach((player) => {
                        const playerResult = results.find((result) => result.player_id === player._id);
                        resultsMap[player._id] = playerResult || {
                            matchesplayed: 0,
                            totalGoals: 0,
                            assists: 0,
                            yellowCards: 0,
                            redCards: 0,
                        };
                    });
                    setPlayerResults(resultsMap);

                    // Nếu không có kết quả, lưu thông báo lỗi từ backend
                    if (results.length === 0) {
                        setError(response.data.message || 'Không có kết quả cầu thủ nào cho mùa giải và ngày này.');
                    }
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Không thể tải danh sách cầu thủ hoặc kết quả thi đấu. Vui lòng kiểm tra kết nối hoặc dữ liệu backend.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlayersAndResults();
    }, [selectedSeason]);

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

    // Không chặn render nếu có error
    if (loading) return <p className="text-center">Đang tải...</p>;

    return (
        <div className="container mx-auto p-4">
            {success && <p className="text-green-500 text-center mb-4">{success}</p>}
            <h2 className="text-2xl font-bold mb-4">Danh sách cầu thủ</h2>

            {/* Dropdown chọn mùa giải */}
            <div className="mb-4">
                <label htmlFor="season-select" className="mr-2">Chọn mùa giải: </label>
                <select
                    id="season-select"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    className="border rounded p-2"
                    disabled={seasons.length === 0} // Vô hiệu hóa nếu không có mùa giải
                >
                    {seasons.length === 0 ? (
                        <option value="">Không có mùa giải</option>
                    ) : (
                        seasons.map((season) => (
                            <option key={season._id} value={season._id}>
                                {season.season_name} ({formatDate(season.start_date)} - {formatDate(season.end_date)})
                            </option>
                        ))
                    )}
                </select>
                {selectedSeason && seasons.length > 0 && (
                    <p className="text-gray-600 mt-2">
                        Season ID: <span className="font-semibold">{selectedSeason}</span>
                    </p>
                )}
                {seasons.length === 0 && (
                    <p className="text-gray-500 mt-2">Không có mùa giải nào để hiển thị.</p>
                )}
            </div>

            {/* Hiển thị thông báo lỗi nếu có */}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

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