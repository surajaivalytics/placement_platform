'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, Building2, CheckCircle2, XCircle, Loader2,
  Award, TrendingUp, Filter
} from 'lucide-react';

interface Application {
  id: string;
  company: string;
  status: string;
  finalTrack: string | null;
  finalDecision: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  assessmentStages: {
    id: string;
    stageName: string;
    isPassed: boolean;
    score: number | null;
    total: number | null;
  }[];
}

interface Stats {
  total: number;
  byCompany: { TCS: number; Wipro: number };
  byStatus: {
    eligibility_check: number;
    in_progress: number;
    completed: number;
    rejected: number;
  };
  byTrack: {
    Digital: number;
    Ninja: number;
    Turbo: number;
    Elite: number;
  };
}

export default function AdminPlacementsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filters, setFilters] = useState({
    company: '',
    status: '',
    track: '',
  });

  const fetchApplications = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.company) params.append('company', filters.company);
      if (filters.status) params.append('status', filters.status);
      if (filters.track) params.append('track', filters.track);

      const res = await fetch(`/api/admin/placements?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      eligibility_check: { label: 'Eligibility', className: 'bg-blue-100 text-blue-800' },
      foundation: { label: 'Foundation', className: 'bg-purple-100 text-purple-800' },
      advanced: { label: 'Advanced', className: 'bg-indigo-100 text-indigo-800' },
      coding: { label: 'Coding', className: 'bg-green-100 text-green-800' },
      aptitude: { label: 'Aptitude', className: 'bg-blue-100 text-blue-800' },
      essay: { label: 'Essay', className: 'bg-purple-100 text-purple-800' },
      voice: { label: 'Voice', className: 'bg-pink-100 text-pink-800' },
      interview: { label: 'Interview', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
    };
    return badges[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div>
        <h1 className="text-3xl font-bold">Placement Applications</h1>
        <p className="text-muted-foreground mt-1">
          Manage and monitor all placement applications
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                TCS: {stats.byCompany.TCS} | Wipro: {stats.byCompany.Wipro}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byStatus.in_progress}</div>
              <p className="text-xs text-muted-foreground">
                Active assessments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byStatus.completed}</div>
              <p className="text-xs text-muted-foreground">
                Successfully finished
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byStatus.rejected}</div>
              <p className="text-xs text-muted-foreground">
                Did not qualify
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Company</label>
              <select
                value={filters.company}
                onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Companies</option>
                <option value="TCS">TCS</option>
                <option value="Wipro">Wipro</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Statuses</option>
                <option value="eligibility_check">Eligibility Check</option>
                <option value="foundation">Foundation</option>
                <option value="advanced">Advanced</option>
                <option value="coding">Coding</option>
                <option value="aptitude">Aptitude</option>
                <option value="essay">Essay</option>
                <option value="voice">Voice</option>
                <option value="interview">Interview</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Track</label>
              <select
                value={filters.track}
                onChange={(e) => setFilters({ ...filters, track: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Tracks</option>
                <option value="Digital">Digital</option>
                <option value="Ninja">Ninja</option>
                <option value="Turbo">Turbo</option>
                <option value="Elite">Elite</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => setFilters({ company: '', status: '', track: '' })}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Candidate</th>
                  <th className="text-left p-3 font-semibold">Company</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Track</th>
                  <th className="text-left p-3 font-semibold">Applied On</th>
                  <th className="text-left p-3 font-semibold">Progress</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-muted-foreground">
                      No applications found
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => {
                    const statusBadge = getStatusBadge(app.status);
                    const completedStages = app.assessmentStages.filter(s => s.isPassed).length;

                    return (
                      <tr key={app.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{app.user.name}</div>
                            <div className="text-sm text-muted-foreground">{app.user.email}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <Building2 className="w-3 h-3" />
                            {app.company}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge className={statusBadge.className}>
                            {statusBadge.label}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {app.finalTrack ? (
                            <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit">
                              <Award className="w-3 h-3" />
                              {app.finalTrack}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(completedStages / (app.company === 'TCS' ? 4 : 5)) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {completedStages}/{app.company === 'TCS' ? 4 : 5}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
