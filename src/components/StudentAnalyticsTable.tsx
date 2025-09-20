import React, { useState, useMemo } from 'react';
import { StudentPerformance } from '../types';
import { Users, CheckCircle, XCircle, Percent, Hash, Clock, ArrowUpDown, Search, BookX, Trophy } from 'lucide-react';
import StudentDetailModal from './StudentDetailModal';

interface StudentAnalyticsTableProps {
  performances: (StudentPerformance & { studentName: string })[];
}

// KPI Card Component
const KpiCard: React.FC<{ title: string; value: string; icon: React.ElementType, iconColor: string }> = ({ title, value, icon: Icon, iconColor }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center">
        <div className={`p-3 rounded-full bg-${iconColor}-100`}>
            <Icon className={`h-6 w-6 text-${iconColor}-600`} />
        </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);


const StudentAnalyticsTable: React.FC<StudentAnalyticsTableProps> = ({ performances }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<(StudentPerformance & { studentName: string }) | null>(null);

    const classAnalytics = useMemo(() => {
        if (performances.length === 0) {
            return { avgScore: 0, toughestSubject: 'N/A', distribution: { excellent: 0, proficient: 0, struggling: 0 } };
        }

        const totalScore = performances.reduce((acc, p) => acc + (p.totalQuestions > 0 ? (p.correctAnswers / p.totalQuestions) * 100 : 0), 0);
        const categoryScores: Record<string, { total: number, sum: number }> = {};
        const distribution = { excellent: 0, proficient: 0, struggling: 0 };

        performances.forEach(p => {
            const score = p.totalQuestions > 0 ? (p.correctAnswers / p.totalQuestions) * 100 : 0;
            if (score >= 80) distribution.excellent++;
            else if (score >= 60) distribution.proficient++;
            else distribution.struggling++;

            Object.entries(p.categoryPerformance).forEach(([cat, stats]) => {
                if (!categoryScores[cat]) categoryScores[cat] = { total: 0, sum: 0 };
                categoryScores[cat].total++;
                categoryScores[cat].sum += (stats.correct / stats.total);
            });
        });
        
        const toughestSubject = Object.entries(categoryScores).sort((a, b) => (a[1].sum / a[1].total) - (b[1].sum / b[1].total))[0]?.[0] || 'N/A';

        return {
            avgScore: totalScore / performances.length,
            toughestSubject,
            distribution
        };
    }, [performances]);

    const sortedPerformances = useMemo(() => {
        let sortableItems = [...performances];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: any, bValue: any;

                if (sortConfig.key === 'score') {
                    aValue = a.totalQuestions > 0 ? (a.correctAnswers / a.totalQuestions) : 0;
                    bValue = b.totalQuestions > 0 ? (b.correctAnswers / b.totalQuestions) : 0;
                } else {
                    aValue = a[sortConfig.key as keyof typeof a];
                    bValue = b[sortConfig.key as keyof typeof b];
                }
                
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [performances, sortConfig]);

    const filteredPerformances = sortedPerformances.filter(p =>
        p.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
    <>
      {selectedStudent && <StudentDetailModal performance={selectedStudent} onClose={() => setSelectedStudent(null)} />}
      <div>
       <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Users className="h-8 w-8 mr-3 text-blue-600" />
            Student Performance Analytics
        </h1>
        <p className="text-gray-600">Review quiz results and performance metrics for all students.</p>
      </div>
      
      {/* KPI Cards */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <KpiCard title="Class Average Score" value={`${classAnalytics.avgScore.toFixed(1)}%`} icon={Trophy} iconColor="yellow" />
            <KpiCard title="Toughest Subject" value={classAnalytics.toughestSubject} icon={BookX} iconColor="red" />
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <p className="text-sm font-medium text-gray-600 mb-2">Performance Distribution</p>
                <div className="flex space-x-2">
                    <div className="flex-1 text-center bg-green-100 p-2 rounded">
                        <p className="font-bold text-green-800">{classAnalytics.distribution.excellent}</p><p className="text-xs text-green-700">Excellent</p>
                    </div>
                    <div className="flex-1 text-center bg-blue-100 p-2 rounded">
                        <p className="font-bold text-blue-800">{classAnalytics.distribution.proficient}</p><p className="text-xs text-blue-700">Proficient</p>
                    </div>
                     <div className="flex-1 text-center bg-red-100 p-2 rounded">
                        <p className="font-bold text-red-800">{classAnalytics.distribution.struggling}</p><p className="text-xs text-red-700">Struggling</p>
                    </div>
                </div>
            </div>
        </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 flex justify-end">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                <th onClick={() => requestSort('score')} className="cursor-pointer px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase"><div className="flex items-center justify-center">Score <ArrowUpDown className="h-3 w-3 ml-1" /></div></th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Correct/Incorrect</th>
                <th onClick={() => requestSort('averageTime')} className="cursor-pointer px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase"><div className="flex items-center justify-center">Avg. Time <ArrowUpDown className="h-3 w-3 ml-1" /></div></th>
                <th onClick={() => requestSort('lastUpdated')} className="cursor-pointer px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase"><div className="flex items-center justify-center">Last Quiz <ArrowUpDown className="h-3 w-3 ml-1" /></div></th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPerformances.map((p) => {
                const score = p.totalQuestions > 0 ? (p.correctAnswers / p.totalQuestions) * 100 : 0;
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900">{p.studentName}</div></td>
                    <td className="px-6 py-4 text-center"><span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${ score >= 80 ? 'bg-green-100 text-green-800' : score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800' }`}>{score.toFixed(1)}%</span></td>
                    <td className="px-6 py-4 text-sm text-center">
                        <span className="text-green-600 font-medium">{p.correctAnswers}</span> / <span className="text-red-600 font-medium">{p.totalQuestions - p.correctAnswers}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">{p.averageTime.toFixed(1)}s</td>
                    <td className="px-6 py-4 text-sm text-center">{new Date(p.lastUpdated).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                        <button onClick={() => setSelectedStudent(p)} className="text-blue-600 hover:underline text-sm font-medium">View Details</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {performances.length === 0 && ( <div className="text-center p-12 text-gray-500">No student performance data available yet.</div> )}
        </div>
      </div>
    </div>
    </>
  );
};

export default StudentAnalyticsTable;