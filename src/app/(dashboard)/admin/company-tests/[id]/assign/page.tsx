'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, UserPlus, Users, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Assignment {
  id: string;
  userId: string;
  isPublic: boolean;
  createdAt: string;
}

interface Test {
  id: string;
  title: string;
  company: string;
}

export default function AssignTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Fetch test details
      const testRes = await fetch(`/api/tests?id=${id}`);
      const testData = await testRes.json();
      setTest(testData.test);

      // Fetch all users
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      setUsers(usersData.users || []);

      // Fetch existing assignments
      const assignmentsRes = await fetch(`/api/assignments?testId=${id}`);
      const assignmentsData = await assignmentsRes.json();
      setAssignments(assignmentsData.assignments || []);

      // Check if test is public
      const publicAssignment = assignmentsData.assignments?.find((a: Assignment) => a.isPublic);
      setIsPublic(!!publicAssignment);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssign = async () => {
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: id,
          userIds: isPublic ? [] : selectedUsers,
          isPublic,
        }),
      });

      if (res.ok) {
        setSelectedUsers([]);
        fetchData();
        alert('Test assigned successfully!');
      }
    } catch (error) {
      console.error('Error assigning test:', error);
      alert('Failed to assign test');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm('Remove this assignment?')) return;

    try {
      const res = await fetch(`/api/assignments?id=${assignmentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error removing assignment:', error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const assignedUserIds = assignments
    .filter(a => !a.isPublic)
    .map(a => a.userId);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Assign Test</h1>
          <p className="text-muted-foreground">
            {test?.company} - {test?.title}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Assign to Users
            </CardTitle>
            <CardDescription>
              Select users who can take this test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="public" className="cursor-pointer">
                Make this test available to all users
              </Label>
            </div>

            {!isPublic && (
              <>
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-2">
                  {users.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-2 p-2 hover:bg-muted rounded"
                    >
                      <Checkbox
                        id={user.id}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleUserSelection(user.id)}
                        disabled={assignedUserIds.includes(user.id)}
                      />
                      <label
                        htmlFor={user.id}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        <div className="font-medium">{user.name || 'Unnamed User'}</div>
                        <div className="text-muted-foreground text-xs">{user.email}</div>
                      </label>
                      {assignedUserIds.includes(user.id) && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          ✓ Assigned
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleAssign}
                  disabled={selectedUsers.length === 0}
                  className="w-full"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign to {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
                </Button>
              </>
            )}

            {isPublic && (
              <Button onClick={handleAssign} className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Make Public
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Assignments</CardTitle>
            <CardDescription>
              Users who can currently access this test
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No assignments yet
              </p>
            ) : (
              <div className="space-y-2">
                {assignments.map(assignment => {
                  if (assignment.isPublic) {
                    return (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 dark:bg-blue-950"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">Public Test</span>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveAssignment(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    );
                  }

                  const user = users.find(u => u.id === assignment.userId);
                  return (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{user?.name || 'Unknown User'}</div>
                        <div className="text-sm text-muted-foreground">{user?.email}</div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveAssignment(assignment.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
