import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SeasonForm from './SeasonForm';

const Seasons = ({ setEditingSeason, setShowForm, token }) => {
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/seasons');
                setSeasons(response.data.data);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải danh sách mùa giải');
                setLoading(false);
            }
        };
        fetchSeasons();
    }, []);

    const handleEdit = (season) => {
        setEditingSeason(season);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/seasons/${id}`);
            setSeasons(seasons.filter((season) => season._id !== id));
        } catch (err) {
            setError('Không thể xóa mùa giải');
        }
    };

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Danh sách mùa giải</h2>
            <table className="min-w-full bg-white border">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border">Tên mùa giải</th>
                        <th className="py-2 px-4 border">Ngày bắt đầu</th>
                        <th className="py-2 px-4 border">Ngày kết thúc</th>
                        <th className="py-2 px-4 border">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {seasons.map((season) => (
                        <tr key={season._id}>
                            <td className="py-2 px-4 border">{season.season_name}</td>
                            <td className="py-2 px-4 border">{new Date(season.start_date).toLocaleDateString()}</td>
                            <td className="py-2 px-4 border">{new Date(season.end_date).toLocaleDateString()}</td>
                            <td className="py-2 px-4 border">
                                {token && setEditingSeason && setShowForm && (
                                    <>
                                        <button
                                            onClick={() => handleEdit(season)}
                                            className="bg-yellow-500 text-white p-1 rounded mr-2"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(season._id)}
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
    );
};

export default Seasons;