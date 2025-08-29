import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Users, 
  Upload, 
  Settings, 
  BarChart3, 
  Download,
  Search,
  Filter
} from 'lucide-react';
import DatasetImport from '@/components/DatasetImport';
import CustomStudentDashboard from '@/components/CustomStudentDashboard';
import FirebaseUserSetup from '@/components/FirebaseUserSetup';
import ExcelUploadGuide from '@/components/ExcelUploadGuide';
import { useStudentsList } from '@/hooks/useFirestore';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const StudentDataManagement = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  
  const { students, loading, reloadStudents } = useStudentsList();

  // Filter students based on search and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.collegeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = filterBranch === 'all' || student.branch === filterBranch;
    const matchesYear = filterYear === 'all' || student.year === filterYear;
    
    return matchesSearch && matchesBranch && matchesYear;
  });

  // Get unique branches and years for filters
  const branches = [...new Set(students.map(s => s.branch))].filter(Boolean);
  const years = [...new Set(students.map(s => s.year))].filter(Boolean);

  const handleImportComplete = () => {
    reloadStudents();
  };

  const exportStudentData = () => {
    const csvContent = [
      'name,collegeId,email,year,section,branch,rollNumber,phone,dateOfBirth,address,cgpa,semester',
      ...students.map(student => [
        student.name,
        student.collegeId,
        student.email,
        student.year,
        student.section,
        student.branch,
        student.rollNumber,
        student.profile?.phone || '',
        student.profile?.dateOfBirth || '',
        student.profile?.address || '',
        student.profile?.academic?.cgpa || '',
        student.profile?.academic?.semester || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_data_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Data Management</h1>
          <p className="text-muted-foreground mt-1">
            Import datasets, manage student profiles, and customize dashboards
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportStudentData}
            className="flex items-center gap-2"
            disabled={students.length === 0}
          >
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button onClick={reloadStudents} className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Branches</p>
                <p className="text-2xl font-bold">{branches.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Academic Years</p>
                <p className="text-2xl font-bold">{years.length}</p>
              </div>
              <Settings className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg CGPA</p>
                <p className="text-2xl font-bold">
                  {students.length > 0 
                    ? (students.reduce((sum, s) => sum + (s.profile?.academic?.cgpa || 0), 0) / students.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <Database className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="firebase" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="firebase" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Firebase Setup
          </TabsTrigger>
          <TabsTrigger value="dataset" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Dataset Import
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Student Management
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard Preview
          </TabsTrigger>
        </TabsList>

        {/* Firebase Setup Tab */}
        <TabsContent value="firebase" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Firebase Authentication Setup
              </CardTitle>
              <CardDescription>
                Configure Firebase Authentication and create initial users for your CampVerse system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FirebaseUserSetup />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dataset Import Tab */}
        <TabsContent value="dataset" className="space-y-6">
          <DatasetImport onImportComplete={handleImportComplete} />
        </TabsContent>

        {/* Student Management Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Student Directory ({filteredStudents.length})
              </CardTitle>
              <CardDescription>
                Search and filter students to view their custom dashboards
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by name or college ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterBranch} onValueChange={setFilterBranch}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch} value={branch}>Branch {branch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>Year {year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Students List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No students found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => (
                    <Card 
                      key={student.uid} 
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedStudentId === student.uid ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedStudentId(student.uid)}
                    >
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{student.name}</h4>
                          <p className="text-sm font-mono text-muted-foreground">{student.collegeId}</p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {student.role}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Year {student.year}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Branch {student.branch}
                            </Badge>
                          </div>
                          {student.profile?.academic?.cgpa && (
                            <div className="text-sm text-muted-foreground">
                              CGPA: {student.profile.academic.cgpa.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Preview Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Custom Student Dashboard
              </CardTitle>
              <CardDescription>
                {selectedStudentId 
                  ? `Viewing dashboard for ${students.find(s => s.uid === selectedStudentId)?.name}`
                  : 'Select a student from the Student Management tab to preview their dashboard'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedStudentId ? (
                <CustomStudentDashboard studentId={selectedStudentId} />
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Student Selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Go to the Student Management tab and click on a student to preview their custom dashboard
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Auto-select first student if available
                      if (students.length > 0) {
                        setSelectedStudentId(students[0].uid);
                      }
                    }}
                    disabled={students.length === 0}
                  >
                    {students.length > 0 ? 'Select First Student' : 'Import Students First'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDataManagement;
