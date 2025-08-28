import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Info,
  UserPlus,
  Shield
} from 'lucide-react';
import { createUserAccount, validateCollegeId } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const FirebaseUserSetup = () => {
  const [collegeId, setCollegeId] = useState('');
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdUsers, setCreatedUsers] = useState<string[]>([]);
  const { toast } = useToast();

  const sampleUsers = [
    { collegeId: '22B81A05C3', name: 'John Doe', role: 'Student' },
    { collegeId: '22B81A05C4', name: 'Jane Smith', role: 'Student' },
    { collegeId: '22B81B05C1', name: 'Mike Johnson', role: 'Student' },
    { collegeId: '22B81Z05F1', name: 'Dr. Sarah Wilson', role: 'Faculty' },
  ];

  const handleCreateUser = async (userCollegeId: string, userName: string) => {
    if (!validateCollegeId(userCollegeId) && userCollegeId !== 'admin') {
      toast({
        title: "Invalid College ID",
        description: "Please enter a valid college ID format (e.g., 22B81A05C3)",
        variant: "destructive",
      });
      return;
    }

    if (!userName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter the user's full name",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      await createUserAccount(userCollegeId, userName);
      
      setCreatedUsers(prev => [...prev, userCollegeId]);
      toast({
        title: "User Created Successfully!",
        description: `${userName} (${userCollegeId}) can now log in with their College ID as password.`,
      });
      
      // Clear form
      setCollegeId('');
      setName('');
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Failed to Create User",
        description: error.message || "Please check Firebase Authentication is enabled in Console.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const createSampleUsers = async () => {
    for (const user of sampleUsers) {
      if (!createdUsers.includes(user.collegeId)) {
        await handleCreateUser(user.collegeId, user.name);
        // Add small delay between user creations
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Firebase Status Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Firebase Setup Required:</strong> This tool helps create users in Firebase Authentication. 
          Make sure you've enabled Email/Password authentication in your Firebase Console first.
          <a 
            href="https://console.firebase.google.com/project/campverse-1374/authentication" 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-2 text-primary underline"
          >
            Open Firebase Console →
          </a>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual User Creation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Create Individual User
            </CardTitle>
            <CardDescription>
              Add a single user to Firebase Authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="collegeId">College ID</Label>
              <Input
                id="collegeId"
                placeholder="e.g., 22B81A05C3 or admin"
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Format: YYBBBSBBR (e.g., 22B81A05C3) or "admin" for administrator
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="e.g., John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <Button
              onClick={() => handleCreateUser(collegeId, name)}
              disabled={isCreating || !collegeId || !name}
              className="w-full"
            >
              {isCreating ? 'Creating...' : 'Create User'}
            </Button>

            {collegeId && validateCollegeId(collegeId) && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Preview:</p>
                <p className="text-sm text-blue-700">Email: {collegeId}@cvr.ac.in</p>
                <p className="text-sm text-blue-700">Password: {collegeId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Quick Setup
            </CardTitle>
            <CardDescription>
              Create sample users for testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {sampleUsers.map((user) => (
                <div key={user.collegeId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.collegeId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.role === 'Faculty' ? 'secondary' : 'outline'}>
                      {user.role}
                    </Badge>
                    {createdUsers.includes(user.collegeId) ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCreateUser(user.collegeId, user.name)}
                        disabled={isCreating}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={createSampleUsers}
              disabled={isCreating}
              variant="secondary"
              className="w-full"
            >
              Create All Sample Users
            </Button>

            {/* Admin User Creation */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Administrator
                  </p>
                  <p className="text-sm text-muted-foreground">admin</p>
                </div>
                {createdUsers.includes('admin') ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleCreateUser('admin', 'Administrator')}
                    disabled={isCreating}
                  >
                    Create Admin
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Login Instructions */}
      {createdUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Users Created Successfully
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">Created users can now log in with:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {createdUsers.map(userId => (
                  <li key={userId} className="flex items-center gap-2">
                    <span className="font-mono bg-muted px-2 py-1 rounded">
                      {userId}
                    </span>
                    <span>/</span>
                    <span className="font-mono bg-muted px-2 py-1 rounded">
                      {userId}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                Password is the same as College ID. Users can change it after first login.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FirebaseUserSetup;
