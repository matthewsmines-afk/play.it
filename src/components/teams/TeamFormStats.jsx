import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const ResultIndicator = ({ result }) => {
  const config = {
    W: { text: "W", color: "bg-green-100 text-green-700 border-green-200" },
    D: { text: "D", color: "bg-slate-100 text-slate-700 border-slate-200" },
    L: { text: "L", color: "bg-red-100 text-red-700 border-red-200" },
  };
  const { text, color } = config[result] || config.D;
  
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${color}`}>
      {text}
    </div>
  );
};

export default function TeamFormStats({ matches }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 mb-3">Team Form</h3>
        <Card className="text-center p-6 card-shadow">
          <p className="text-slate-500">No completed matches to display form stats.</p>
        </Card>
      </div>
    );
  }

  const played = matches.length;
  const wins = matches.filter(m => m.our_score > m.opponent_score).length;
  const draws = matches.filter(m => m.our_score === m.opponent_score).length;
  const losses = matches.filter(m => m.our_score < m.opponent_score).length;

  const winPercentage = played > 0 ? Math.round((wins / played) * 100) : 0;

  const lastFiveMatches = matches
    .sort((a, b) => new Date(b.date_time) - new Date(a.date_time))
    .slice(0, 5)
    .map(m => {
      if (m.our_score > m.opponent_score) return "W";
      if (m.our_score < m.opponent_score) return "L";
      return "D";
    })
    .reverse();

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-slate-800 mb-3">Team Form</h3>
      <Card className="card-shadow overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-800">{played}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase">Played</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{wins}</p>
              <p className="text-xs font-semibold text-green-500 uppercase">Wins</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{draws}</p>
              <p className="text-xs font-semibold text-yellow-500 uppercase">Draws</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{losses}</p>
              <p className="text-xs font-semibold text-red-500 uppercase">Losses</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg col-span-2 md:col-span-1">
              <p className="text-2xl font-bold text-blue-600">{winPercentage}%</p>
              <p className="text-xs font-semibold text-blue-500 uppercase">Win Rate</p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-200">
            <h4 className="font-semibold text-sm text-center text-slate-600 mb-3">Recent Form (Last 5)</h4>
            <div className="flex justify-center items-center gap-2 sm:gap-4">
              {lastFiveMatches.length > 0 ? (
                lastFiveMatches.map((result, index) => <ResultIndicator key={index} result={result} />)
              ) : (
                <p className="text-sm text-slate-400">Not enough matches played.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}