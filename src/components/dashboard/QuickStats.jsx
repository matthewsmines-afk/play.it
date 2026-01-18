import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const colorClasses = {
  blue: 'bg-gray-100',
  green: 'bg-gray-100',
  purple: 'bg-gray-100',
  orange: 'bg-orange-100',
  red: 'bg-gray-100',
  teal: 'bg-gray-100',
  pink: 'bg-gray-100'
};

const QuickStats = ({ title, value, icon: Icon, color = 'blue', trend }) => {
  const bgColorClass = colorClasses[color] || colorClasses.blue;
  const iconColor = color === 'orange' ? 'text-orange-600' : 'text-black';

  return (
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-lg ${bgColorClass} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-600 truncate">{title}</p>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-bold text-black">{value}</p>
          {trend && (
            <div className={`flex items-center text-xs font-semibold ${trend > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
              {trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(QuickStats);