import React from 'react';
import { Users, UserPlus, BookCopy, AlertTriangle } from 'lucide-react';
import { QuizCompletion } from '../services/performanceService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface AdminDashboardOverviewProps {
    stats: { studentCount: number; teacherCount: number; questionCount: number };
    signupData: { name: string, count: number }[];
    strugglingStudents: QuizCompletion[];
}

const StatCard: React.FC<{ icon: React.ElementType, title: string, value: number, color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

// Custom Label Renderer for the Pie Chart
const RADIAN = Math.PI / 180;
const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};


const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({ stats, signupData, strugglingStudents }) => {
    const roleData = [
        { name: 'Students', value: stats.studentCount },
        { name: 'Teachers', value: stats.teacherCount },
    ];
    const COLORS = ['#3B82F6', '#8B5CF6'];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard icon={Users} title="Total Students" value={stats.studentCount} color="blue" />
                <StatCard icon={UserPlus} title="Total Teachers" value={stats.teacherCount} color="purple" />
                <StatCard icon={BookCopy} title="Total Questions" value={stats.questionCount} color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">New User Signups (Last 7 Days)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={signupData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} name="New Users" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">User Role Distribution</h2>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie 
                                data={roleData} 
                                cx="50%" 
                                cy="50%" 
                                labelLine={false} 
                                label={<CustomLabel />} // Using the custom label
                                outerRadius={100} 
                                fill="#8884d8" 
                                dataKey="value" 
                                nameKey="name"
                            >
                                {roleData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                             <Tooltip />
                             <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

             <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                    Needs Attention (Lowest Scores)
                </h2>
                <ul className="divide-y divide-gray-200">
                    {strugglingStudents.map(student => (
                        <li key={student.id} className="py-3 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{student.studentName}</p>
                                <p className="text-xs text-gray-500">Completed on {new Date(student.completedAt).toLocaleDateString()}</p>
                            </div>
                            <span className="text-sm font-semibold text-red-600">{student.score.toFixed(1)}%</span>
                        </li>
                    ))}
                    {strugglingStudents.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No struggling students found. Great job!</p>}
                </ul>
            </div>
        </div>
    );
};

export default AdminDashboardOverview;