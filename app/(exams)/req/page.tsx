// src/pages/req.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RequestExamPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    examName: "",
    category: "",
    description: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // This would be where you'd handle the actual form submission
    // For now, we'll just simulate a submission
    try {
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success message and redirect
      alert("Thank you! Your exam request has been submitted.");
      router.push("/");
    } catch (error) {
      alert("There was an error submitting your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] py-8">
      <div className="container max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Request an Exam Test</CardTitle>
            <CardDescription>
              Fill out this form to request a new exam to be added to our
              platform
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="examName">
                  Exam Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  id="examName"
                  name="examName"
                  placeholder="e.g., GATE Computer Science"
                  value={formData.examName}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  required
                  value={formData.category}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="government">Government Job</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  required
                  className="min-h-32"
                  id="description"
                  name="description"
                  placeholder="Describe the exam in detail, including subjects and chapters you'd like to see"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Your Email <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  id="email"
                  name="email"
                  placeholder="We'll notify you when the exam is added"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end space-x-2 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
