import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TeamForm from './TeamForm';

const Teams = ({ setEditingTeam, setShowForm, token }) => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/teams/');
                setTeams(response.data.data);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải danh sách đội bóng');
                setLoading(false);
            }
        };
        fetchTeams();
    }, []);

    const handleEdit = (team) => {
        setEditingTeam(team);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/teams/${id}`);
            setTeams(teams.filter((team) => team._id !== id));
        } catch (err) {
            setError('Không thể xóa đội bóng');
        }
    };

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Danh sách đội bóng</h2>
            {teams.length === 0 ? (
                <p className="text-gray-500 text-center">Không có đội bóng nào.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border">Tên đội</th>
                                <th className="py-2 px-4 border">Sân vận động</th>
                                <th className="py-2 px-4 border">Huấn luyện viên</th>
                                <th className="py-2 px-4 border">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map((team) => (
                                <tr key={team._id}>
                                    <td className="py-2 px-4 border">{team.team_name}</td>
                                    <td className="py-2 px-4 border">{team.stadium}</td>
                                    <td className="py-2 px-4 border">{team.coach}</td>
                                    <td className="py-2 px-4 border">
                                        {token && setEditingTeam && setShowForm && (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(team)}
                                                    className="bg-yellow-500 text-white p-1 rounded mr-2"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(team._id)}
                                                    className="bg-red-500 text-white p-1 rounded"
                                                >
                                                    Xóa
                                                </button>
                                            </>
                                        )}
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

export default Teams;