import React, { useState } from 'react';
import Matches from '../components/Matches';
import MatchForm from '../components/MatchForm';

const MatchesPage = ({ token }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingMatch, setEditingMatch] = useState(null);
    const [matches, setMatches] = useState([]);

    return (
        <div className="container mx-auto p-4">
            {showForm ? (
                <MatchForm
                    editingMatch={editingMatch}
                    setEditingMatch={setEditingMatch}
                    setShowForm={setShowForm}
                    setMatches={setMatches}
                    token={token} // Truyền token để MatchForm kiểm tra quyền
                />
            ) : (
                <>
                    {token ? (
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-blue-600 text-white p-2 rounded mb-4"
                        >
                            Thêm trận đấu
                        </button>
                    ) : (
                        <p className="text-gray-500 mb-4">Vui lòng đăng nhập để thêm, sửa hoặc xóa trận đấu.</p>
                    )}
                    <Matches
                        setEditingMatch={setEditingMatch}
                        setShowForm={setShowForm}
                        token={token} // Truyền token để Matches kiểm tra quyền
                    />
                </>
            )}
        </div>
    );
};

export default MatchesPage;