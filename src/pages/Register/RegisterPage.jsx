import { Form, useActionData, useNavigation } from "react-router";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const SECTIONS = [
  "OFFICE OF THE HUMAN RESOURCE MANAGEMENT AND DEVELOPMENT DIVISON CHIEF",
  "HUMAN RESOURCE PLANNING AND PERFORMANCE MANAGEMENT SECTION",
  "PERSONNEL ADMINISTRATION SECTION",
  "HUMAN RESOURCE WELFARE SECTION",
  "LEARNING AND DEVELOPMENT SECTION",
];

const POSITIONS = [
  "DIRECTOR IV",
  "ADMINISTRATIVE ASSISTANT III",
  "SOCIAL WELFARE OFFICER III",
  "PROJECT DEVELOPMENT OFFICER II",
  "ADMINISTRATIVE ASSISTANT II",
  "MANAGEMENT & AUDIT ANALYST II",
  "INFORMATION OFFICER II",
  "ADMINISTRATIVE ASSISTANT II (CLUSTER)",
  "SOCIAL MARKETING OFFICER III",
  "SOCIAL WELFARE AIDE",
  "ADMINISTRATIVE AIDE IV",
  "ATTORNEY III",
  "LEGAL ASSISTANT II",
  "SOCIAL WELFARE OFFICER IV",
  "SOCIAL WELFARE OFFICER II",
  "SOCIAL WELFARE OFFICER I",
  "INFORMATION TECHNOLOGY OFFICER I",
  "PLANNING OFFICER III",
  "PROJECT DEVELOPMENT OFFICER III",
  "INFORMATION OFFICER III",
  "ADMINISTRATIVE OFFICER II",
  "SOCIAL WELFARE ASSISTANT",
  "PROJECT DEVELOPMENT OFFICER I",
  "ADMINISTRATIVE OFFICER IV",
  "STATISTICIAN I",
  "PROJECT DEVELOPMENT OFFICER IV",
  "INFORMATION TECHNOLOGY OFFICER II",
  "STATISTICIAN II",
  "INFORMATION SYSTEMS ANALYST III",
  "COMPUTER PROGRAMMER III",
  "COMPUTER MAINTENANCE TECHNOLOGIST III",
  "COMPUTER MAINTENANCE TECHNOLOGIST II",
  "COMPUTER MAINTENANCE TECHNOLOGIST I",
  "DIRECTOR III",
  "TRAINING SPECIALIST II",
  "PROJECT DEVELOPMENT OFFICER V",
  "ADMINISTRATIVE OFFICER V",
  "ADMINISTRATIVE ASSISTANT II (PROVINCE)",
  "SOCIAL WELFARE OFFICER V",
  "FINANCIAL ANALYST III",
  "FINANCIAL ANALYST I",
  "ADMINISTRATIVE ASSISTANT I",
  "NUTRITIONIST - DIETITIAN III",
  "NUTRITIONIST - DIETITIAN II",
  "SENIOR BOOKKEEPER",
  "PSYCHOLOGIST II",
  "RADIOLOGIC TECHNOLOGIST III",
  "AREA COORDINATOR",
  "TECHNICAL FACILITATOR",
  "MUNICIPAL FINANCIAL ANALYST",
  "COMMUNITY EMPOWERMENT FACILITATOR",
  "ADMINISTRATIVE ASSISTANT II (ENCODER)",
  "WAREHOUSEMAN III",
  "WAREHOUSEMAN II",
  "CHIEF ADMINISTRATIVE OFFICER",
  "ACCOUNTANT III",
  "PLANNING OFFICER I",
  "ADMINISTRATIVE OFFICER III",
  "SUPERVISING ADMINISTRATIVE OFFICER",
  "ADMINISTRATIVE AIDE I",
  "UTILITY WORKER II",
  "FINANCIAL ANALYST II",
  "ENGINEER III",
  "ADMINISTRATIVE OFFICER I",
  "ADMINISTRATIVE ASSISTANT II (PROCUREMENT)",
  "COMMUNITY DEVELOPMENT ASSISTANT II",
  "PLANNING OFFICER IV",
  "ADMINISTRATIVE AIDE VI",
  "NURSE I",
  "TRAINING SPECIALIST I",
  "SECURITY GUARD I",
  "SOCIAL WELFARE OFFICER III (OIC PROVINCIAL LINK)",
  "MANPOWER DEVELOPMENT OFFICER I",
  "HOUSEPARENT II",
  "HOUSEPARENT I",
  "MANPOWER DEVELOPMENT OFFICER II",
  "ADMINISTRATIVE OFFICER II (PSYCHOMETRICIAN)",
  "UTILITY WORKER I",
  "COOK I",
  "HOUSEPARENT III",
  "LAUNDRY WORKER I",
  "CLERK I",
  "NURSE II",
  "PSYCHOLOGIST III",
  "DRIVER II",
  "MANPOWER DEVELOPMENT ASSISTANT",
];

export default function RegisterPage() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [employeeIdDigits, setEmployeeIdDigits] = useState("");
  const [section, setSection] = useState("");
  const [position, setPosition] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleEmployeeIdChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 5) {
      setEmployeeIdDigits(value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Create Account
            </h1>
            <p className="text-gray-600 mt-2">
              Register your employee account
            </p>
          </div>

          <Form method="post" className="space-y-4">
            {/* Employee ID */}
            <div>
              <Label htmlFor="employee_id">Employee ID</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-2 rounded-md border border-gray-300">
                  03-
                </span>
                <Input
                  id="employee_id"
                  name="employee_id"
                  type="text"
                  value={employeeIdDigits}
                  onChange={handleEmployeeIdChange}
                  placeholder="12345"
                  maxLength={5}
                  required
                  className="flex-1"
                />
              </div>
              <input
                type="hidden"
                name="employee_id_full"
                value={`03-${employeeIdDigits}`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter 5 digits after 03-
              </p>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="surname">Surname</Label>
                <Input
                  id="surname"
                  name="surname"
                  type="text"
                  required
                  className="mt-1 uppercase"
                  placeholder="DELA CRUZ"
                />
              </div>
              <div>
                <Label htmlFor="firstname">First Name</Label>
                <Input
                  id="firstname"
                  name="firstname"
                  type="text"
                  required
                  className="mt-1 uppercase"
                  placeholder="JUAN"
                />
              </div>
              <div>
                <Label htmlFor="middlename">Middle Name</Label>
                <Input
                  id="middlename"
                  name="middlename"
                  type="text"
                  required
                  className="mt-1 uppercase"
                  placeholder="SANTOS"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1"
                placeholder="employee@example.com"
              />
            </div>

            {/* Section */}
            <div>
              <Label htmlFor="section">Section</Label>
              <Select name="section" value={section} onValueChange={setSection} required>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent className="max-w-[90vw] md:max-w-full">
                  {SECTIONS.map((sec) => (
                    <SelectItem key={sec} value={sec} className="whitespace-normal">
                      {sec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Position */}
            <div>
              <Label htmlFor="position">Position</Label>
              <div className="mt-1">
                <SearchableSelect
                  options={POSITIONS}
                  value={position}
                  onChange={setPosition}
                  placeholder="Select position"
                  searchPlaceholder="Search position..."
                  emptyMessage="No position found."
                />
              </div>
              <input type="hidden" name="position" value={position} required />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Confirmation */}
            <div>
              <Label htmlFor="password_confirmation">Confirm Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Confirm password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {actionData?.error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {actionData.error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link to="/" className="text-blue-600 hover:underline font-medium">
                Login here
              </Link>
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
}
