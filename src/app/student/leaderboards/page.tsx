"use client";

import Leaderboard from '@/components/student/Leaderboard';

const LeaderboardPage = () => {
    return (
        <div className="bg-tathir-beige min-h-screen pb-6 pt-6 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-[35rem] h-[35rem] bg-tathir-maroon/10 rounded-full blur-3xl -top-24 -right-24 animate-pulse"></div>
                <div className="absolute w-[25rem] h-[25rem] bg-tathir-brown/10 rounded-full blur-3xl bottom-0 left-0 animate-pulse delay-1000"></div>
                <div className="absolute w-[20rem] h-[20rem] bg-tathir-dark-green/10 rounded-full blur-3xl top-1/2 left-1/2 animate-pulse delay-500"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <Leaderboard maxEntries={100} />
            </div>
        </div>
    );
};

export default LeaderboardPage;