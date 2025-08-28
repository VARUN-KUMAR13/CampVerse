import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  Trophy, 
  BarChart3, 
  Clock,
  Mail,
  Phone,
  MapPin,
  Edit,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';
import { useStudentDashboard, useStudentProfile } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';

interface CustomStudentDashboardProps {
  studentId?: string; // If provided, shows another student's dashboard (for faculty/admin)
}

const CustomStudentDashboard: React.FC<CustomStudentDashboardProps> = ({ studentId }) => {
  const { userData: currentUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  
  // Use the custom hook to get student dashboard data
  const { 
    profile, 
    courses, 
    dashboardStats, 
    loading, 
    updateProfile 
  } = useStudentDashboard();

  // If viewing another student's profile (faculty/admin view)
  const { 
    profile: viewProfile, 
    loading: viewLoading 
  } = useStudentProfile(studentId);

  // Use appropriate profile based on context
  const displayProfile = studentId ? viewProfile : profile;
  const isLoading = studentId ? viewLoading : loading;
  const isOwnProfile = !studentId || studentId === currentUser?.uid;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!displayProfile) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No profile data found</p>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const calculateProgress = (cgpa: number) => {
    return (cgpa / 10) * 100; // Assuming CGPA is out of 10
  };

  const handleUpdateProfile = async (updates: any) => {
    if (isOwnProfile) {
      const success = await updateProfile(updates);
      if (success) {
        setEditMode(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
                  {getInitials(displayProfile.name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">{displayProfile.name}</h1>
                <p className="text-lg font-mono text-primary">{displayProfile.collegeId}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {displayProfile.email}
                  </span>
                  {displayProfile.profile?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {displayProfile.profile.phone}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{displayProfile.role}</Badge>
                  <Badge variant="outline">Year {displayProfile.year}</Badge>
                  <Badge variant="outline">Section {displayProfile.section}</Badge>
                  <Badge variant="outline">Branch {displayProfile.branch}</Badge>
                </div>
              </div>
            </div>
            {isOwnProfile && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditMode(!editMode)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {editMode ? 'Cancel' : 'Edit Profile'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current CGPA</p>
                <p className="text-2xl font-bold">
                  {displayProfile.profile?.academic?.cgpa?.toFixed(2) || 'N/A'}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
            </div>
            {displayProfile.profile?.academic?.cgpa && (
              <Progress 
                value={calculateProgress(displayProfile.profile.academic.cgpa)} 
                className="mt-2"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enrolled Courses</p>
                <p className="text-2xl font-bold">{dashboardStats.totalCourses}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Semester</p>
                <p className="text-2xl font-bold">
                  {displayProfile.profile?.academic?.semester || 'N/A'}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assignments</p>
                <p className="text-2xl font-bold">{dashboardStats.completedAssignments}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Trophy className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Academic Performance
            </CardTitle>
            <CardDescription>
              Your academic progress and achievements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall CGPA</span>
                <span className="text-sm font-bold">
                  {displayProfile.profile?.academic?.cgpa?.toFixed(2) || 'N/A'} / 10.0
                </span>
              </div>
              {displayProfile.profile?.academic?.cgpa && (
                <Progress 
                  value={calculateProgress(displayProfile.profile.academic.cgpa)} 
                  className="h-2"
                />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Semester Progress</span>
                <span>{displayProfile.profile?.academic?.semester || 1}/8</span>
              </div>
              <Progress 
                value={((displayProfile.profile?.academic?.semester || 1) / 8) * 100} 
                className="h-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Award className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-green-600">Grade: A</p>
                <p className="text-xs text-muted-foreground">Current Standing</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-blue-600">85%</p>
                <p className="text-xs text-muted-foreground">Attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest academic activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Assignment Submitted</p>
                  <p className="text-xs text-muted-foreground">Data Structures - Binary Trees</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <Trophy className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Quiz Completed</p>
                  <p className="text-xs text-muted-foreground">Database Management - Score: 95%</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Calendar className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Upcoming Exam</p>
                  <p className="text-xs text-muted-foreground">Operating Systems - March 15</p>
                  <p className="text-xs text-muted-foreground">In 3 days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Enrolled Courses
          </CardTitle>
          <CardDescription>
            Courses for current semester
          </CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No courses found for this semester</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course, index) => (
                <Card key={course.id || index} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{course.name}</h4>
                      <p className="text-sm text-muted-foreground">Code: {course.code}</p>
                      <p className="text-sm text-muted-foreground">Faculty: {course.faculty}</p>
                      <div className="flex justify-between items-center pt-2">
                        <Badge variant="outline">{course.credits} Credits</Badge>
                        <span className="text-xs text-muted-foreground">
                          Semester {course.semester}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Contact details and personal info
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                <p className="text-sm">{displayProfile.profile?.dateOfBirth || 'Not provided'}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                <p className="text-sm">{displayProfile.profile?.phone || 'Not provided'}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                <p className="text-sm flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  {displayProfile.profile?.address || 'Not provided'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Bio</Label>
                <p className="text-sm text-muted-foreground">
                  {displayProfile.profile?.bio || 'No bio provided yet.'}
                </p>
              </div>
              {displayProfile.profile?.emergencyContact && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Emergency Contact</Label>
                  <div className="p-3 bg-red-50 rounded-lg space-y-1">
                    <p className="text-sm font-medium">{displayProfile.profile.emergencyContact.name}</p>
                    <p className="text-sm text-muted-foreground">{displayProfile.profile.emergencyContact.phone}</p>
                    <p className="text-xs text-muted-foreground">{displayProfile.profile.emergencyContact.relation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomStudentDashboard;
