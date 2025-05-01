import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RegulationForm from './RegulationForm';

const Regulations = ({ setEditingRegulation, setShowForm, token }) => {
    const [regulations, setRegulations] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const regulationsResponse = await axios.get('http://localhost:5000/api/regulations/');
                setRegulations(regulationsResponse.data.data);

                const seasonsResponse = await axios.get('http://localhost:5000/api/seasons');
                setSeasons(seasonsResponse.data.data);

                setLoading(false);
            } catch (err) {
                setError('Không thể tải dữ liệu');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Tạo ánh xạ season_id -> season_name
    const seasonMap = seasons.reduce((map, season) => {
        map[season._id] = season.season_name;
        return map;
    }, {});

    const handleEdit = (regulation) => {
        setEditingRegulation(regulation);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/regulations/${id}`);
            setRegulations(regulations.filter((regulation) => regulation._id !== id));
        } catch (err) {
            setError('Không thể xóa quy định');
        }
    };

    // Hàm hiển thị rules theo type
    const renderRules = (regulation) => {
        const { rules, type } = regulation;
        if (!rules || typeof rules !== 'object') {
            return <div className="text-sm">Không có quy tắc</div>;
        }

        // Ánh xạ key sang nhãn dễ đọc
        const ruleLabels = {
            minAge: 'Tuổi tối thiểu',
            maxAge: 'Tuổi tối đa',
            minPlayersPerTeam: 'Số cầu thủ tối thiểu mỗi đội',
            maxPlayersPerTeam: 'Số cầu thủ tối đa mỗi đội',
            maxForeignPlayers: 'Số cầu thủ ngoại tối đa',
            goalTypes: 'Loại bàn thắng',
            goalTimeLimit: 'Giới hạn thời gian bàn thắng',
            minMinute: 'Phút tối thiểu',
            maxMinute: 'Phút tối đa',
            winPoints: 'Điểm thắng',
            drawPoints: 'Điểm hòa',
            losePoints: 'Điểm thua',
            rankingCriteria: 'Tiêu chí xếp hạng',
            matchRounds: 'Số vòng đấu',
            homeTeamRule: 'Quy tắc đội nhà',
        };

        switch (type) {
            case 'age':
                return Object.entries(rules).map(([key, value]) => (
                    <div key={key} className="text-sm">
                        {`${ruleLabels[key] || key}: ${value}`}
                    </div>
                ));

            case 'goal':
                return (
                    <div>
                        <div className="text-sm">
                            {`${ruleLabels.goalTypes}: ${Array.isArray(rules.goalTypes) ? rules.goalTypes.join(', ') : 'Không có'
                                }`}
                        </div>
                        {rules.goalTimeLimit && typeof rules.goalTimeLimit === 'object' && (
                            <>
                                <div className="text-sm">
                                    {`${ruleLabels.minMinute}: ${rules.goalTimeLimit.minMinute || 'N/A'}`}
                                </div>
                                <div className="text-sm">
                                    {`${ruleLabels.maxMinute}: ${rules.goalTimeLimit.maxMinute || 'N/A'}`}
                                </div>
                            </>
                        )}
                    </div>
                );

            case 'ranking':
                return (
                    <div>
                        <div className="text-sm">
                            {`${ruleLabels.winPoints}: ${rules.winPoints || 'N/A'}`}
                        </div>
                        <div className="text-sm">
                            {`${ruleLabels.drawPoints}: ${rules.drawPoints || 'N/A'}`}
                        </div>
                        <div className="text-sm">
                            {`${ruleLabels.losePoints}: ${rules.losePoints || 'N/A'}`}
                        </div>
                        <div className="text-sm">
                            {`${ruleLabels.rankingCriteria}: ${Array.isArray(rules.rankingCriteria)
                                    ? rules.rankingCriteria.join(', ')
                                    : 'Không có'
                                }`}
                        </div>
                    </div>
                );

            case 'match':
                return (
                    <div>
                        <div className="text-sm">
                            {`${ruleLabels.matchRounds}: ${rules.matchRounds || 'N/A'}`}
                        </div>
                        <div className="text-sm">
                            {`${ruleLabels.homeTeamRule}: ${rules.homeTeamRule || 'N/A'}`}
                        </div>
                    </div>
                );

            default:
                return Object.entries(rules).map(([key, value]) => (
                    <div key={key} className="text-sm">
                        {`${ruleLabels[key] || key}: ${value}`}
                    </div>
                ));
        }
    };

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Danh sách quy định</h2>
            {regulations.length === 0 ? (
                <p className="text-gray-500 text-center">Không có quy định nào.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border">Tên quy định</th>
                                <th className="py-2 px-4 border">Mùa giải</th>
                                <th className="py-2 px-4 border">Quy tắc</th>
                                <th className="py-2 px-4 border">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {regulations.map((regulation) => (
                                <tr key={regulation._id}>
                                    <td className="py-2 px-4 border">{regulation.regulation_name}</td>
                                    <td className="py-2 px-4 border">
                                        {seasonMap[regulation.season_id] || 'Không xác định'}
                                    </td>
                                    <td className="py-2 px-4 border">{renderRules(regulation)}</td>
                                    <td className="py-2 px-4 border">
                                        {token && setEditingRegulation && setShowForm ? (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(regulation)}
                                                    className="bg-yellow-500 text-white p-1 rounded mr-2"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(regulation._id)}
                                                    className="bg-red-500 text-white p-1 rounded"
                                                >
                                                    Xóa
                                                </button>
                                            </>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Regulations;