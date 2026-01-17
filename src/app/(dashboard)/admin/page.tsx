import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { PerformanceChart } from "@/components/admin/performance-chart";
import { RecentStudentsTable } from "@/components/admin/recent-students-table";
import { getDashboardStats } from "@/lib/admin-stats";
import { Calendar } from "@/components/ui/calendar";
import { Bell, Search, Settings, Activity, UserPlus, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const data = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session?.user?.name || "Admin"}
          </h1>
          <p className="text-gray-500 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-white p-2 rounded-full shadow-sm">
            <Search className="w-5 h-5 text-gray-400 ml-2" />
            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-40" />
          </div>
          <button className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-gray-900">
            <Bell className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 bg-white p-1 pl-3 pr-1 rounded-full shadow-sm">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-none">{session?.user?.name}</p>
              <p className="text-xs text-gray-400 leading-none mt-1">{session?.user?.email}</p>
            </div>
            <Avatar>
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-gray-900 text-white">AD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
        <DashboardStats stats={data} />
      </div>

        {/* Recent Activity (Takes 2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Recent Activity</h3>
            <span className="text-xs font-medium text-blue-600 cursor-pointer hover:underline">View log</span>
          </div>
          <div className="space-y-4">
            {/* @ts-ignore */}
            {data.recentActivities?.length > 0 ? (
              // @ts-ignore
              data.recentActivities.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === 'user_signup' ? 'bg-green-100 text-green-600' :
                      item.type === 'system' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                    }`}>
                    {item.type === 'user_signup' ? <UserPlus className="w-6 h-6" /> :
                      item.type === 'system' ? <Settings className="w-6 h-6" /> :
                        <Activity className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-500 truncate">{item.description}</p>
                  </div>
                  <div className="text-xs text-gray-400 font-medium whitespace-nowrap bg-gray-50 px-2 py-1 rounded">
                    {item.time}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">No recent activity</div>
            )}
          </div>
        </div>

        {/* Right Column: Chart & Calendar */}
        <div className="lg:col-span-1 space-y-8">
          {/* Student Performance Chart */}
          <div className="h-[300px]">
            <PerformanceChart data={data.statusDistribution} />
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Calendar</h3>
            </div>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={new Date()}
                className="rounded-md border-0"
              />
            </div>
          </div>
        </div>
      

      {/* Bottom Grid: Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Students Table */}
        <div className="lg:col-span-2">
          <RecentStudentsTable students={data.recentApplications} />
        </div>

        {/* Weekly Timetable */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Weekly Timetable</h3>
            <span className="text-xs font-medium text-blue-600 cursor-pointer">View all</span>
          </div>
          <div className="space-y-4">
            {[
              { time: "10:00", title: "Assessment Review", sub: "Class 3A" },
              { time: "11:30", title: "System Check", sub: "All Servers" },
              { time: "15:30", title: "Placement Drive", sub: "TCS Ninja" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-colors">
                <div className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded shadow-sm">{item.time}</div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
