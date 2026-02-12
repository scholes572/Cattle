import { Link } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>
            New user registration is not available at this time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Please contact the administrator to get access credentials.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Demo accounts are available:
            </p>
            <div className="text-sm font-mono bg-gray-100 p-4 rounded-lg inline-block">
              <p className="font-bold mb-2">Pre-defined Users:</p>
              <p>lovegah / lovegah123</p>
              <p>farmer2 / farmer2123</p>
            </div>
          </div>
          <Link to="/auth/login" className="block mt-6">
            <Button className="w-full">Back to Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
